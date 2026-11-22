# Rodapé de Letras — Espaço Novo Tempo Aracaju

O Holyrics continua sendo a **única fonte das letras**. A TV de 49" mostra o slide completo e o OBS mostra o mesmo slide como um **rodapé de no máximo 2 linhas**, que é montado automaticamente.

```
Holyrics (API Server) ──► servidor.ps1 (localhost:8787) ──► OBS: Fonte de Navegador "rodape.html"
                                                         └──► Estúdio: studio.html (simulação TV + YouTube)
```

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `Iniciar-Rodape.bat` | Liga o servidor local. **Deixe aberto durante o culto.** |
| `Simular-Holyrics.bat` | Liga o servidor fingindo ser o Holyrics, para testar sem o Holyrics aberto. |
| `config.json` | Endereço, porta e token do Holyrics. |
| `rodape.html` | O rodapé (overlay) usado no OBS. |
| `studio.html` | Estúdio: simula a TV 49" e a live em 1080p, formata letras e gera a URL do OBS. |
| `tv.html` | Simulação da tela da TV (usada pelo estúdio). |

---

## 1. Ativar o API Server no Holyrics (uma vez só)

1. No Holyrics, abra **Arquivo → Configurações → API Server**.
2. Ative o servidor **local**.
3. Anote a **porta** que aparece ali.
4. Em **Gerenciar permissões**, crie um token e dê a ele a permissão **GetCurrentPresentation**. Só essa permissão já basta.
5. Abra `config.json` no Bloco de Notas e preencha:

```json
{
  "holyricsUrl": "http://127.0.0.1:PORTA_DO_HOLYRICS",
  "token": "TOKEN_CRIADO",
  "porta": 8787
}
```

> Se o Holyrics estiver em **outro computador** da rede, troque `127.0.0.1` pelo IP dele (ex.: `http://192.168.0.20:8091`).

## 2. Ligar o servidor

Dê dois cliques em **`Iniciar-Rodape.bat`**. Vai abrir uma janela preta com os endereços. Deixe essa janela aberta.

Para conferir se a conexão está funcionando, abra no navegador:
`http://localhost:8787/rodape.html?debug=1`
Um painel verde mostra o que o Holyrics está enviando, ou o erro, se houver.

> Se o Windows perguntar sobre o firewall, pode permitir em **rede privada**.

## 3. Configurar o OBS

1. Abra o **Estúdio**: `http://localhost:8787/studio.html`, ajuste o estilo do rodapé e clique em **Copiar** na URL do OBS.
2. No OBS, na cena da transmissão: **Fontes → + → Navegador**.
   - **URL:** cole a URL copiada.
   - **Largura:** `1920` · **Altura:** `1080`
   - Marque **"Desligar fonte quando não estiver visível"** e **"Atualizar navegador quando a cena se tornar ativa"**.
   - Deixe o campo **CSS personalizado** vazio.
3. Posicione a fonte cobrindo a tela inteira, com o atalho **Ctrl+F** ("ajustar à tela").
4. **Remova a antiga captura da tela do Holyrics** dessa cena.

O rodapé **some sozinho** quando o Holyrics fica em branco, mostra o papel de parede ou exibe algo que não é música, como avisos, versículos ou imagens.

### Opções da URL (o estúdio já gera tudo isso)

| Parâmetro | Valores | Padrão |
|---|---|---|
| `estilo` | `faixa`, `degrade`, `limpo` | `faixa` |
| `linhas` | `1` ou `2` | `2` |
| `tamanho` | tamanho da fonte em px (diminui sozinho se não couber) | `54` |
| `fonte` | `Montserrat`, `Inter`, `Poppins`, `Segoe UI` | `Montserrat` |
| `destaque` / `cor` | cor em hexadecimal, sem `#` | `f2b705` / `ffffff` |
| `opacidade` | `0` a `1` | `0.72` |
| `margem` | distância da base em px | `64` |
| `titulo=1` | mostra o nome da música | desligado |
| `capa=1` | mostra no rodapé o slide de capa (nome/artista) que o Holyrics coloca no início da música | desligado |
| `maiusculas=1` | texto em MAIÚSCULAS | desligado |
| `tipos` | tipos do Holyrics que aparecem no rodapé | `song,text` |
| `debug=1` | painel de diagnóstico | desligado |

> Para exibir versículos também, inclua `verse` em `tipos`, por exemplo `tipos=song,text,verse`. Isso ainda **não foi testado**, porque a documentação do Holyrics diz que a lista de slides não vem para versículos.

## 4. Padronizar as letras no Holyrics

Padrão recomendado para a TV de 49": **no máximo 4 linhas por slide e no máximo 32 caracteres por linha**, com uma linha em branco entre os slides.

1. No **Estúdio** (modo *Letra local*), cole a letra da música.
2. Clique em **Formatar no padrão**. Ele quebra linhas longas, preferindo cortar depois de vírgula e sem deixar palavra curta pendurada. Também divide slides grandes, sem nunca separar uma frase entre dois slides.
3. Revise. Os avisos ⚠ mostram o que ainda está fora do padrão.
4. Clique em **Copiar para o Holyrics** e cole na letra da música dentro do Holyrics.

Um slide de 4 linhas na TV vira **2 linhas** no rodapé: as linhas 1+2 e as linhas 3+4.

## 5. Estúdio de simulação

`http://localhost:8787/studio.html`

- **Letra local:** simula sem o Holyrics. Use <kbd>←</kbd> <kbd>→</kbd> para passar os slides e <kbd>B</kbd> para tela em branco.
- **Holyrics ao vivo:** espelha o que está no ar no Holyrics.
- **Abrir em 1080p:** abre a TV ou o rodapé em tamanho real (1920×1080).
- **Cenários:** carregue um print real da câmera e o fundo usado no Holyrics para ver exatamente como vai ficar.
- O painel da TV calcula a **altura real das letras** na TV de 49" e até que distância o texto é confortável de ler. Ajuste a distância da última fileira no controle *Distância*.

## Problemas comuns

| Sintoma | O que verificar |
|---|---|
| `?debug=1` mostra `invalid token` | O token em `config.json` está errado. |
| `?debug=1` mostra `unauthorized action` | O token está certo, mas falta marcar a permissão **GetCurrentPresentation** em Gerenciar permissões. Depois de marcar, salve. |
| `?debug=1` mostra "Holyrics indisponível" | API Server ativo? Porta certa no `config.json`? Holyrics aberto? |
| Rodapé não aparece no OBS | A janela do `Iniciar-Rodape.bat` está aberta? A fonte está com 1920×1080? |
| Texto com 3 ou mais linhas no rodapé | O slide está fora do padrão: formate a letra no Estúdio. |
| Fonte diferente do esperado | O computador do OBS precisa de internet para baixar as fontes do Google. Sem internet, ele usa Segoe UI. |
