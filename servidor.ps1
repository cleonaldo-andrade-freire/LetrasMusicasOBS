<#
  servidor.ps1 — Servidor local do Rodapé de Letras (Espaço Novo Tempo Aracaju)

  - Serve as páginas (rodape.html, tv.html, studio.html) em http://localhost:<porta>/
  - Repassa /api/* para o API Server do Holyrics, acrescentando o token do config.json.
    Assim o OBS não esbarra em bloqueio de CORS e o token não aparece na URL.

  Uso:
    powershell -ExecutionPolicy Bypass -File servidor.ps1            (normal)
    powershell -ExecutionPolicy Bypass -File servidor.ps1 -Simular   (finge ser o Holyrics, para testes)
#>
param([switch]$Simular)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$cfg = Get-Content (Join-Path $raiz 'config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$porta = if ($cfg.porta) { [int]$cfg.porta } else { 8787 }
$holyrics = ($cfg.holyricsUrl -replace '/+$', '')
$utf8 = New-Object System.Text.UTF8Encoding($false)

$tipos = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.svg' = 'image/svg+xml'
  '.webp' = 'image/webp'; '.woff2' = 'font/woff2'; '.ico' = 'image/x-icon'
}

# ---------- Simulador do Holyrics (modo -Simular) ----------
$simSlides = @(
  "Quando a manhã desperta sobre a cidade`nE o sol se levanta trazendo esperança`nEu lembro que a Tua fidelidade`nNunca falhou, é firme como aliança",
  "Tu és a rocha onde eu firmo os meus pés`nTu és a luz que ilumina o caminho",
  "Eu vou cantar, eu vou cantar`nA Tua graça me alcançou`nEu vou cantar, eu vou cantar`nPorque o Teu amor me transformou"
)
$simInicio = Get-Date
function Resposta-Simulada([string]$corpo) {
  $seg = [int]((Get-Date) - $simInicio).TotalSeconds
  $passo = [int][math]::Floor($seg / 4) % ($simSlides.Count + 1)   # troca a cada 4 s; último passo = tela em branco
  $incluir = $corpo -match '"include_slides"\s*:\s*true'
  $data = [ordered]@{
    id = 'sim-1'; type = 'song'; name = 'Música de exemplo (simulação)'
    slide_number = [math]::Min($passo + 1, $simSlides.Count); total_slides = $simSlides.Count
    slide_type = $(if ($passo -ge $simSlides.Count) { 'blank' } else { 'default' })
  }
  if ($incluir) {
    $i = 0
    $data.slides = @($simSlides | ForEach-Object { $i++; [ordered]@{ number = $i; text = $_ } })
  }
  return (@{ status = 'ok'; data = $data } | ConvertTo-Json -Depth 6 -Compress)
}

# ---------- Funções HTTP ----------
function Enviar($ctx, [int]$codigo, [string]$tipo, [byte[]]$bytes) {
  $r = $ctx.Response
  $r.StatusCode = $codigo
  $r.ContentType = $tipo
  $r.Headers.Add('Cache-Control', 'no-store')
  $r.Headers.Add('Access-Control-Allow-Origin', '*')
  $r.ContentLength64 = $bytes.Length
  $r.OutputStream.Write($bytes, 0, $bytes.Length)
  $r.OutputStream.Close()
}
function Enviar-Texto($ctx, [int]$codigo, [string]$tipo, [string]$texto) { Enviar $ctx $codigo $tipo ($utf8.GetBytes($texto)) }

function Repassar-Api($ctx) {
  $req = $ctx.Request
  $acao = $req.Url.AbsolutePath.Substring(5)   # depois de "/api/"
  if ($acao -notmatch '^[A-Za-z]+$') { Enviar-Texto $ctx 400 'application/json' '{"status":"error","error":"acao invalida"}'; return }
  $leitor = New-Object System.IO.StreamReader($req.InputStream, $utf8)
  $corpo = $leitor.ReadToEnd(); if (-not $corpo) { $corpo = '{}' }

  if ($Simular) { Enviar-Texto $ctx 200 'application/json; charset=utf-8' (Resposta-Simulada $corpo); return }

  $token = $req.QueryString['token']; if (-not $token) { $token = $cfg.token }
  $url = "$holyrics/api/$acao" + $(if ($token) { '?token=' + [uri]::EscapeDataString($token) } else { '' })
  try {
    $wr = [System.Net.HttpWebRequest]::Create($url)
    $wr.Method = 'POST'; $wr.ContentType = 'application/json'; $wr.Timeout = 3000; $wr.Proxy = $null
    $b = $utf8.GetBytes($corpo); $wr.ContentLength = $b.Length
    $s = $wr.GetRequestStream(); $s.Write($b, 0, $b.Length); $s.Close()
    $resp = $wr.GetResponse()
    $txt = (New-Object System.IO.StreamReader($resp.GetResponseStream(), $utf8)).ReadToEnd()
    $resp.Close()
    Enviar-Texto $ctx 200 'application/json; charset=utf-8' $txt
  } catch {
    $msg = $_.Exception.Message -replace '"', "'"
    Enviar-Texto $ctx 502 'application/json; charset=utf-8' ('{"status":"error","error":"Holyrics indisponivel em ' + $holyrics + ': ' + $msg + '"}')
  }
}

function Servir-Arquivo($ctx) {
  $caminho = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  if (-not $caminho) { $caminho = 'studio.html' }
  if ($caminho -eq 'config.json') { Enviar-Texto $ctx 403 'text/plain' 'Proibido'; return }  # não expõe o token
  $completo = [System.IO.Path]::GetFullPath((Join-Path $raiz $caminho))
  if (-not $completo.StartsWith($raiz, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $completo -PathType Leaf)) {
    Enviar-Texto $ctx 404 'text/plain; charset=utf-8' 'Não encontrado'; return
  }
  $ext = [System.IO.Path]::GetExtension($completo).ToLower()
  $tipo = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
  Enviar $ctx 200 $tipo ([System.IO.File]::ReadAllBytes($completo))
}

# ---------- Laço principal ----------
$ouvinte = New-Object System.Net.HttpListener
$ouvinte.Prefixes.Add("http://localhost:$porta/")
$ouvinte.Prefixes.Add("http://127.0.0.1:$porta/")
try {
  $ouvinte.Start()
} catch {
  Write-Host ''
  Write-Host "  A porta $porta já está em uso." -ForegroundColor Red
  Write-Host '  Provavelmente o servidor do rodapé JÁ ESTÁ ABERTO em outra janela.'
  Write-Host "  Confira em: http://localhost:$porta/rodape.html?debug=1"
  Write-Host '  Se precisar de outra porta, mude "porta" no config.json (e a URL no OBS).'
  Write-Host ''
  exit 1
}

Write-Host ''
Write-Host '  Rodapé de Letras — servidor local' -ForegroundColor Yellow
Write-Host "  Estúdio:  http://localhost:$porta/studio.html"
Write-Host "  OBS:      http://localhost:$porta/rodape.html"
Write-Host "  Teste:    http://localhost:$porta/rodape.html?debug=1"
if ($Simular) { Write-Host '  MODO SIMULAÇÃO: respostas falsas do Holyrics' -ForegroundColor Cyan }
else { Write-Host "  Holyrics: $holyrics" }
Write-Host '  Deixe esta janela aberta durante o culto. Ctrl+C para encerrar.'
Write-Host ''

try {
  while ($ouvinte.IsListening) {
    $ctx = $ouvinte.GetContext()
    try {
      if ($ctx.Request.HttpMethod -eq 'OPTIONS') {
        $ctx.Response.Headers.Add('Access-Control-Allow-Headers', 'Content-Type')
        $ctx.Response.Headers.Add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        Enviar-Texto $ctx 204 'text/plain' ''
      } elseif ($ctx.Request.Url.AbsolutePath.StartsWith('/api/')) {
        Repassar-Api $ctx
      } else {
        Servir-Arquivo $ctx
      }
    } catch {
      Write-Host ("  erro: " + $_.Exception.Message) -ForegroundColor Red
      try { $ctx.Response.Abort() } catch {}
    }
  }
} finally {
  $ouvinte.Stop()
}
