# Guia de instalação na igreja — Rodapé de Letras

**Espaço Novo Tempo Aracaju** · Holyrics (TVs de 49") + OBS (rodapé na live do YouTube)

Este guia repete na igreja exatamente o que testamos: o **Holyrics** projeta a letra completa nas TVs, e o **OBS** mostra a mesma letra como um **rodapé de 2 linhas** na transmissão. Depois de configurado, **ninguém precisa mexer no OBS durante o louvor**: o rodapé acompanha sozinho o slide que o operador do Holyrics passa.

### Como as peças se conectam

```
 PC do Holyrics                          PC do OBS (pode ser o mesmo PC)
┌───────────────────────┐               ┌──────────────────────────────────────────┐
│ Holyrics              │               │ Janela preta "Rodapé de Letras"          │
│  └ API Server (8091)  │ ◄──────────── │  (Iniciar-Rodape.bat, porta 8787)        │
│  └ Tela pública → TV  │  pergunta     │        │                                 │
└───────────────────────┘  "qual slide  │        ▼                                 │
                            está no ar?"│ OBS → Fonte de Navegador "rodape.html"   │
                                        └──────────────────────────────────────────┘
```

1. O **Holyrics** sabe qual slide está no ar.
2. O **servidor** (a janela preta) pergunta isso ao Holyrics duas vezes por segundo.
3. O **rodapé dentro do OBS** pega a resposta do servidor e desenha a letra em 2 linhas.

### Como usar este guia

- Siga as partes **na ordem**. Cada passo termina com **✔ Deve aparecer**, para você conferir antes de seguir.
- Se algo não bater, veja o bloco **✖ Se não aparecer** logo abaixo do passo.
- Marque os quadradinhos `[ ]` conforme for concluindo. Vale imprimir.

| Parte | O quê | Onde | Tempo |
|---|---|---|---|
| 0 | Preparar o material | Em casa | 10 min |
| 1 | Ajustar as músicas | Qualquer PC | Contínuo |
| 2 | Liberar o Holyrics (API Server) | PC do Holyrics | 10 min |
| 3 | Instalar o servidor do rodapé | PC do OBS | 15 min |
| 4 | Configurar o OBS | PC do OBS | 15 min |
| 5 | Ensaio geral | Os dois | 15 min |
| 6 | Checklist do dia do culto | Os dois | 5 min |
| 7 | Problemas comuns | — | — |

---

## Parte 0 — Preparar o material (antes de ir à igreja)

### 0.1 Conferir as versões dos programas

- [ ] **Holyrics 2.19 ou mais novo.** Testamos na 2.30. Para ver a versão, abra o Holyrics e procure **Ajuda → Sobre**.
- [ ] **OBS Studio 28 ou mais novo.** Testamos na 33. Para ver a versão, abra o OBS: ela aparece no título da janela, por exemplo "OBS 33.0.3".

**✖ Se a versão for antiga:** atualize o programa pelo site oficial antes de seguir.

### 0.2 Copiar a pasta para o pen drive

1. [ ] Copie a pasta **`LetrasMusicasOBS`** inteira para um pen drive, ou para o Google Drive.
2. [ ] **Apague o token de teste.** Abra o `config.json` da cópia com o Bloco de Notas e troque o valor de `"token"` por `"COLOCAR_TOKEN_DA_IGREJA"`. Salve. O token de teste só vale no computador de testes, e é melhor não deixá-lo circulando.
   - **Baixou a pasta do GitHub?** Ela não traz o `config.json` (o arquivo com token fica fora do repositório). Copie o `config.exemplo.json` e renomeie a cópia para `config.json`. Ele já vem sem token.

**✔ Deve aparecer:** na pasta do pen drive, os arquivos `Iniciar-Rodape.bat`, `config.json`, `rodape.html`, `studio.html`, `servidor.ps1` e a pasta `js`.

### 0.3 Descobrir como é a montagem da igreja

Responda antes de começar, porque isso muda a Parte 2:

- [ ] O Holyrics e o OBS rodam **no mesmo computador**? Se sim, ignore o passo 2.5 e use sempre `127.0.0.1`.
- [ ] Eles rodam em **computadores diferentes**? Se sim, você vai precisar do **IP do PC do Holyrics** (passo 2.5), e os dois PCs precisam estar **na mesma rede**, no mesmo roteador ou switch.
- [ ] O PC do OBS tem **internet**? Ele precisa dela para baixar a fonte Montserrat. Sem internet, o rodapé usa Segoe UI automaticamente, e também fica bom.

---

## Parte 1 — Ajustar as músicas no Holyrics

### O padrão (vale para todas as músicas)

| Regra | Por quê |
|---|---|
| **No máximo 4 linhas por slide** | A letra fica grande na TV e vira exatamente **2 linhas** no rodapé |
| **No máximo 32 caracteres por linha** | Cada linha do rodapé (2 linhas da TV somadas) cabe sem precisar diminuir a fonte |
| **Refrão em slide próprio**, repetido onde é cantado | O operador só avança, sem voltar |
| **Uma frase nunca fica dividida entre dois slides** | O público e a live leem a frase inteira |

> **Exemplo:** um slide de 4 linhas na TV (linhas 1, 2, 3 e 4) aparece no rodapé como **"linha 1 + linha 2"** em cima e **"linha 3 + linha 4"** embaixo.

### 1.1 Ajustar uma música com o Estúdio

Faça isso em **qualquer computador** que tenha a pasta e acesso ao Holyrics.

**Passo 1 — Abrir o Estúdio**
1. [ ] Na pasta `LetrasMusicasOBS`, dê **dois cliques** em `Iniciar-Rodape.bat`.
2. [ ] Abra o navegador (Chrome ou Edge) e digite: **`http://localhost:8787/studio.html`**

**✔ Deve aparecer:** uma tela escura chamada **"Estúdio de Letras"**, com a letra à esquerda e as prévias da **TV 49"** e do **YouTube 1080p** à direita.

**✖ Se não aparecer:** confira se a janela preta do servidor está aberta. Se ela fechou sozinha com erro, veja a Parte 7.

**Passo 2 — Copiar a letra do Holyrics**
1. [ ] No Holyrics, localize a música, clique com o botão direito nela e escolha a opção de **editar**.
2. [ ] Clique dentro do campo da letra, tecle **Ctrl+A** para selecionar tudo e **Ctrl+C** para copiar.

**Passo 3 — Formatar no Estúdio**
1. [ ] No Estúdio, confira se o botão **"Letra local"** está selecionado, no topo.
2. [ ] Digite o **nome da música** no campo **Título**.
3. [ ] Clique no campo **Texto**, tecle **Ctrl+A** e depois **Ctrl+V**, para trocar o exemplo pela letra.
4. [ ] Confira se **Máx. linhas por slide = 4** e **Máx. caracteres por linha = 32**.
5. [ ] Clique em **Formatar no padrão**.

**✔ Deve aparecer:** uma mensagem verde como "Formatado: 9 → 14 slides", e o resumo da lista de slides em verde, dizendo **"tudo no padrão"**.

**Passo 4 — Revisar**
1. [ ] Clique em cada slide da lista, ou use as setas **← →** do teclado, e olhe as duas prévias:
   - **TV:** a letra está grande? A frase faz sentido sozinha?
   - **YouTube:** o rodapé ficou com **2 linhas**?
2. [ ] Se algum corte ficou estranho, corrija direto no campo **Texto**. A prévia atualiza na hora.
   - Para **juntar** duas linhas, apague a quebra de linha entre elas.
   - Para **trocar de slide**, deixe **uma linha em branco** entre os blocos.

**✖ Se aparecer ⚠ em algum slide:** o slide ainda tem mais de 4 linhas, ou linhas com mais de 32 caracteres. Clique em **Formatar no padrão** de novo, ou corrija à mão.

**Passo 5 — Devolver para o Holyrics**
1. [ ] Clique em **Copiar para o Holyrics**. Deve aparecer a mensagem verde "Letra copiada".
2. [ ] No editor da música no Holyrics, clique no campo da letra, tecle **Ctrl+A** e depois **Ctrl+V**.
3. [ ] **Salve** a música no Holyrics.
4. [ ] Abra a música no Holyrics e confira se os slides ficaram divididos igual ao Estúdio.

> ⚠️ **Na primeira música, confira com atenção.** O Holyrics separa os slides por **linha em branco**, o mesmo formato do Estúdio. Se a divisão ficar diferente, pare e avise antes de ajustar as outras.

### 1.2 Em que ordem ajustar

1. [ ] As músicas do **próximo culto**.
2. [ ] As **mais cantadas** da igreja.
3. [ ] O restante do acervo, aos poucos.

> Não precisa ajustar tudo antes de começar a usar. Uma música fora do padrão **continua funcionando**: o rodapé diminui a fonte para caber. Só fica menos bonito.

### 1.3 Ajuste em lote (em preparação)

Assim que chegarem amostras de arquivos **`.muf`**, exportados pelo Holyrics, haverá um conversor que ajusta muitas músicas de uma vez e gera um relatório do que mudou em cada uma. Esta parte do guia será atualizada.

### 1.4 Ajustar o tema da TV no Holyrics

No Holyrics, abra as configurações do **tema** usado nas músicas e ajuste:

- [ ] **Fonte:** sem serifa e em negrito, como Montserrat, Arial Black ou Segoe UI Bold.
- [ ] **Cor do texto:** branca, com **sombra** ou **contorno** leve.
- [ ] **Fundo:** escuro. Se for imagem ou vídeo, escureça para a letra se destacar.
- [ ] **Tamanho:** ajuste automático **ligado**, com margem de uns 5% nas bordas.

**✔ Como conferir:** no Estúdio, o texto abaixo da prévia da TV informa a **altura real da letra** numa TV de 49" e **até que distância** ela é confortável de ler. Ajuste o controle **"Distância da última fileira"** em **Cenários** para a medida real do salão.

---

## Parte 2 — Liberar o Holyrics para o rodapé (API Server)

> Faça tudo no **PC do Holyrics**.

### 2.1 Abrir as configurações do API Server

1. [ ] Abra o Holyrics.
2. [ ] Clique em **Arquivo → Configurações**.
3. [ ] Procure a seção **API Server**.

**✔ Deve aparecer:** opções para ativar o servidor e o número da **porta**.

### 2.2 Ativar o servidor e anotar a porta

1. [ ] **Ative** o API Server **local**.
2. [ ] Anote a **porta**: __________. No nosso teste foi **8091**.

### 2.3 Criar o token e dar a permissão

1. [ ] Ainda no API Server, clique em **Gerenciar permissões**.
2. [ ] **Crie um token novo** e dê a ele um nome como `Rodape OBS`.
3. [ ] Na lista de ações desse token, marque **somente**: ✅ **GetCurrentPresentation**.
4. [ ] **Copie o token** e guarde num lugar seguro. Você vai colar no `config.json` na Parte 3. Token: ______________________
5. [ ] Clique em **Salvar / OK** na janela de permissões e **também** na janela de configurações.

> ⚠️ Use um **token novo, criado na igreja**. Não reaproveite o token do computador de testes.
>
> ℹ️ **GetCurrentPresentation** é a única permissão de que o rodapé precisa. Não libere outras.

### 2.4 Conferir a tela pública (a TV)

1. [ ] A **tela pública** do Holyrics deve estar no **monitor da TV**, que é o segundo monitor.
2. [ ] Projete uma música e confira se ela aparece **na TV**, e não por cima da tela do operador.

**✖ Se a música cobrir a tela do operador:** o Windows está tratando a TV como monitor principal, ou a TV não foi detectada. Abra **Configurações do Windows → Sistema → Tela**, escolha **"Estender estas telas"** e defina o monitor do operador como **tela principal**.

### 2.5 Só se o Holyrics e o OBS estiverem em PCs diferentes

**Descobrir o IP do PC do Holyrics**
1. [ ] No PC do Holyrics, clique em **Iniciar**, digite **PowerShell** e abra.
2. [ ] Digite `ipconfig` e tecle **Enter**.
3. [ ] Anote o **Endereço IPv4** da placa de rede em uso, por exemplo `192.168.0.20`: __________

**Liberar a porta no firewall**
1. [ ] Clique em **Iniciar**, digite **PowerShell**, clique com o botão direito e escolha **Executar como administrador**.
2. [ ] Cole o comando abaixo, trocando `8091` se a sua porta for outra, e tecle **Enter**:

   ```powershell
   New-NetFirewallRule -DisplayName "Holyrics API" -Direction Inbound -Protocol TCP -LocalPort 8091 -Action Allow -Profile Private
   ```

3. [ ] Confira se a rede da igreja está como **rede privada**: **Configurações → Rede e Internet → propriedades da rede → Perfil de rede: Privada**.

**Fixar o IP (recomendado)**
- [ ] Peça a quem cuida da rede para **reservar o IP** do PC do Holyrics no roteador. Se o IP mudar, o rodapé para de funcionar até alguém corrigir o `config.json`.

---

## Parte 3 — Instalar o servidor do rodapé

> Faça tudo no **PC do OBS**. Se for o mesmo do Holyrics, faça nele.

### 3.1 Copiar a pasta para o computador

1. [ ] Copie a pasta `LetrasMusicasOBS` do pen drive para **`C:\LetrasMusicasOBS`**.
2. [ ] **Não rode direto do pen drive:** se ele for removido, o rodapé para.

**✔ Deve aparecer:** `C:\LetrasMusicasOBS\Iniciar-Rodape.bat`, junto com os outros arquivos.

### 3.2 Preencher o `config.json`

1. [ ] Se não houver `config.json` na pasta, copie o `config.exemplo.json` e renomeie a cópia para `config.json`.
2. [ ] Na pasta, clique com o botão direito em `config.json` e escolha **Abrir com → Bloco de Notas**.
3. [ ] Preencha **com cuidado**, mantendo as aspas, os dois-pontos e as vírgulas:

   **Holyrics no mesmo PC:**
   ```json
   {
     "holyricsUrl": "http://127.0.0.1:8091",
     "token": "COLE_O_TOKEN_AQUI",
     "porta": 8787
   }
   ```

   **Holyrics em outro PC** (use o IP anotado no passo 2.5):
   ```json
   {
     "holyricsUrl": "http://192.168.0.20:8091",
     "token": "COLE_O_TOKEN_AQUI",
     "porta": 8787
   }
   ```

4. [ ] Se a porta anotada no passo 2.2 não for 8091, troque o número em `holyricsUrl`.
5. [ ] Salve com **Ctrl+S** e feche.

> ℹ️ **Não mude `"porta": 8787`.** Essa é a porta do servidor do rodapé, que é outra coisa. Só mude se a 8787 já estiver em uso no PC.

### 3.3 Ligar o servidor pela primeira vez

1. [ ] Dê **dois cliques** em **`Iniciar-Rodape.bat`**.
2. [ ] Se aparecer **"O Windows protegeu o computador"**, clique em **Mais informações → Executar assim mesmo**.
3. [ ] Se o **Firewall do Windows** perguntar sobre o PowerShell, clique em **Permitir**, só em **rede privada**.

**✔ Deve aparecer:** uma janela preta assim:

```
  Rodapé de Letras — servidor local
  Estúdio:  http://localhost:8787/studio.html
  OBS:      http://localhost:8787/rodape.html
  Teste:    http://localhost:8787/rodape.html?debug=1
  Holyrics: http://127.0.0.1:8091
  Deixe esta janela aberta durante o culto. Ctrl+C para encerrar.
```

**✖ Se aparecer "A porta 8787 já está em uso":** o servidor **já está aberto** em outra janela. Feche esta e use a que já estava aberta.

**✖ Se a janela abrir e fechar na hora:** provavelmente há um erro de digitação no `config.json`, como uma aspa ou vírgula faltando. Abra o arquivo e compare com o exemplo do passo 3.2.

### 3.4 Testar a conexão com o Holyrics

1. [ ] No Holyrics, **projete uma música** e passe para um slide de **letra**, não a capa.
2. [ ] No navegador do PC do OBS, abra **`http://localhost:8787/rodape.html?debug=1`**.

**✔ Deve aparecer:** um painel verde no canto superior esquerdo, com algo como:

```
tipo: song | slide 3/18 | slide_type: default
nome: Nome da Música
texto:
(a letra do slide)
```

**✖ Se aparecer outra mensagem:**

| Mensagem no painel verde | Causa | Como resolver |
|---|---|---|
| `invalid token` | O token no `config.json` está errado | Copie de novo do Holyrics (passo 2.3) e cole no `config.json`. Depois **feche e abra** a janela preta |
| `unauthorized action` | O token está certo, mas falta a permissão | Marque **GetCurrentPresentation** (passo 2.3) e **salve** |
| `Holyrics indisponivel` | O servidor não alcança o Holyrics | Confira se o Holyrics está aberto, se o API Server está ativo e se a porta e o IP do `config.json` estão certos. Em PCs diferentes, confira o firewall (passo 2.5) |
| `Nada em apresentação.` | Está tudo conectado, mas nada está no ar | Projete uma música no Holyrics |

> ℹ️ Sempre que mudar o `config.json`, **feche a janela preta e abra o `Iniciar-Rodape.bat` de novo**.

### 3.5 Fazer o servidor ligar sozinho com o Windows (recomendado)

1. [ ] Tecle **Win+R**, digite `shell:startup` e tecle **Enter**. Abre uma pasta chamada **Inicializar**.
2. [ ] Em outra janela, abra `C:\LetrasMusicasOBS`.
3. [ ] Clique com o **botão direito** em `Iniciar-Rodape.bat`, escolha **Mostrar mais opções → Criar atalho** e arraste o atalho criado para a pasta **Inicializar**.
4. [ ] Reinicie o PC e confira se a janela preta abre sozinha.

---

## Parte 4 — Configurar o OBS

> Faça no **PC do OBS**, com a **janela preta do servidor aberta**.

### 4.1 Conferir a resolução do OBS

1. [ ] No OBS, clique em **Configurações**, no canto inferior direito, e depois em **Vídeo**.
2. [ ] Confira:
   - **Resolução base (tela):** `1920x1080`
   - **Resolução de saída (escalonada):** `1920x1080`
3. [ ] Clique em **OK**.

### 4.2 Escolher o visual do rodapé no Estúdio

1. [ ] Tire um **print da câmera real** da igreja: no OBS, clique com o botão direito no preview e escolha **Captura de tela (prévia)**. Ou use a tecla **Print Screen** e salve a imagem.
2. [ ] Abra **`http://localhost:8787/studio.html`**.
3. [ ] Em **Cenários → Imagem de fundo da câmera**, escolha o print. A prévia do YouTube passa a mostrar a câmera real.
4. [ ] Cole a letra de uma música no campo **Texto** e use **← →** para passar os slides.
5. [ ] Em **Estilo do rodapé (OBS)**, ajuste até ficar bom:
   - **Estilo:** *Faixa translúcida*, que é o recomendado; *Degradê na base*; ou *Só texto com sombra*.
   - **Fonte** e **Tamanho do texto:** 54 px é o padrão.
   - **Opacidade do fundo**, que controla quanto a faixa escura esconde a câmera.
   - **Distância da base**, que deve ficar acima de logos ou letreiros da transmissão.
   - **Cores:** o destaque é a linha colorida embaixo da faixa; dá para usar a cor da identidade visual da igreja.
   - **Mostrar nome da música**, se quiserem.
6. [ ] Clique em **Copiar**, ao lado de **"URL para colar na Fonte de Navegador do OBS"**.

**✔ Deve aparecer:** a mensagem verde "URL copiada".

### 4.3 Adicionar o rodapé na cena do louvor

1. [ ] No OBS, no quadro **Cenas**, clique na cena usada **durante o louvor**.
2. [ ] No quadro **Fontes**, clique no **+** e escolha **Navegador**.
3. [ ] Escolha **Criar nova**, dê o nome **`Rodapé de Letras`** e clique em **OK**.
4. [ ] Na janela de propriedades:

   | Campo | Valor |
   |---|---|
   | **Arquivo local** | ⬜ desmarcado |
   | **URL** | Cole a URL copiada com **Ctrl+V** |
   | **Largura** | `1920` |
   | **Altura** | `1080` |
   | **Controlar áudio via OBS** | ⬜ desmarcado |
   | **CSS personalizado** | Deixe como está |
   | **Desligar fonte quando não estiver visível** | ✅ marcado |
   | **Atualizar navegador quando a cena se tornar ativa** | ⬜ desmarcado |

5. [ ] Clique em **OK**.

**✔ Deve aparecer:** se houver uma música com letra projetada no Holyrics, o rodapé aparece no preview do OBS.

### 4.4 Posicionar e travar

1. [ ] Com **Rodapé de Letras** selecionado na lista de fontes, tecle **Ctrl+F** para ajustar à tela. A caixa vermelha deve cobrir **a tela inteira**.
2. [ ] Na lista de **Fontes**, arraste **Rodapé de Letras** para **cima da câmera**. Quem está mais acima aparece na frente.
3. [ ] Clique no **cadeado 🔒** ao lado de **Rodapé de Letras** para travar.

### 4.5 Remover a captura antiga do Holyrics

1. [ ] Na mesma cena, localize a fonte antiga que capturava a tela do Holyrics, por exemplo "Captura de janela" ou "Captura de tela".
2. [ ] Clique no **olho 👁** para **ocultar**. Depois do ensaio, se tudo estiver bem, apague essa fonte.

**✔ Deve aparecer:** no preview, só a câmera e o rodapé novo.

### 4.6 Usar o mesmo rodapé em outras cenas (se houver)

Se durante o louvor vocês alternam entre cenas, como câmera aberta e close:

1. [ ] Na cena onde o rodapé já está, clique com o botão direito em **Rodapé de Letras → Copiar**.
2. [ ] Vá para a outra cena, clique com o botão direito no quadro **Fontes** e escolha **Colar (referência)**.
3. [ ] Repita os passos 4.4 nessa cena.

> ℹ️ **"Colar (referência)"** usa o **mesmo** rodapé nas duas cenas. Se mudar o estilo depois, muda em todas.

### 4.7 Se quiser mudar o visual depois

1. [ ] Abra o Estúdio, ajuste o estilo e clique em **Copiar** na URL.
2. [ ] No OBS, dê **dois cliques** em **Rodapé de Letras**, cole a nova URL no campo **URL** e clique em **OK**.

---

## Parte 5 — Ensaio geral (antes do primeiro culto com o rodapé)

Com o Holyrics projetando na TV, o servidor aberto e o OBS aberto, confira cada item:

| # | Faça | ✔ Deve acontecer |
|---|---|---|
| 1 | Projete a **capa** da música (nome e artista) | Rodapé **não** aparece |
| 2 | Passe para o **1º slide de letra** | Rodapé **aparece** suavemente, em **2 linhas** |
| 3 | Passe vários slides | O texto **troca** suavemente, sem piscar |
| 4 | Deixe o Holyrics **em branco** (tela limpa) | Rodapé **some** |
| 5 | Volte para a letra | Rodapé **volta** |
| 6 | Vá até o **fim** da música | Rodapé **some** |
| 7 | Projete um **aviso**, uma **imagem** ou um **versículo** | Rodapé **não** aparece |
| 8 | Olhe a **TV do fundo do salão** | Letra **legível** |
| 9 | Faça uma live **não listada** de 2 minutos no YouTube e assista **no celular** | Rodapé **nítido e legível** na tela pequena |

- [ ] Todos os itens conferidos.

**✖ Se o item 9 mostrar o rodapé pequeno no celular:** aumente o **Tamanho do texto** no Estúdio, por exemplo para 60 px, e atualize a URL no OBS (passo 4.7).

---

## Parte 6 — Checklist do dia do culto

> Imprima esta parte e deixe ao lado dos computadores.

### Ao chegar (operador)

1. [ ] Ligar o **PC do Holyrics** e abrir o **Holyrics**.
2. [ ] Conferir se a **tela pública** está na **TV**.
3. [ ] Ligar o **PC do OBS** e conferir se a **janela preta "Rodapé de Letras — servidor local"** está aberta. Se não estiver, abrir `C:\LetrasMusicasOBS\Iniciar-Rodape.bat`.
4. [ ] Abrir o **OBS**.
5. [ ] **Teste rápido:** projetar um slide de letra no Holyrics e conferir o rodapé no preview do OBS. Depois, deixar o Holyrics **em branco**.

### Durante o culto

- O operador do Holyrics trabalha **normalmente**. **O rodapé acompanha sozinho.**
- **Não feche a janela preta** do servidor. Pode **minimizar**.

### Se o rodapé sumir ou travar no meio do louvor

1. [ ] A **janela preta** está aberta? Se não estiver, abra o `Iniciar-Rodape.bat`.
2. [ ] No OBS, clique com o botão direito em **Rodapé de Letras → Propriedades** e depois em **Atualizar cache da página atual → OK**.
3. [ ] **Último recurso:** clique no **olho 👁** do Rodapé de Letras para ocultá-lo e siga a live sem ele. Depois do culto, investigue com `http://localhost:8787/rodape.html?debug=1`.

---

## Parte 7 — Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| A janela preta mostra **"A porta 8787 já está em uso"** | O servidor já está aberto em outra janela | Feche esta. A outra já está funcionando |
| A janela preta **abre e fecha** na hora | Erro de digitação no `config.json` | Compare com o exemplo do passo 3.2: aspas, vírgulas e chaves |
| O rodapé não aparece, e o `?debug=1` mostra **`invalid token`** | Token errado | Passo 2.3. Depois, feche e abra a janela preta |
| O rodapé não aparece, e o `?debug=1` mostra **`unauthorized action`** | Falta a permissão | Marque **GetCurrentPresentation** e salve |
| O rodapé não aparece, e o `?debug=1` mostra **`Holyrics indisponivel`** | Holyrics fechado, API desligada, ou IP, porta ou firewall errados | Partes 2.2 e 2.5 e passo 3.2 |
| O `?debug=1` funciona, mas o **OBS não mostra** o rodapé | A fonte foi carregada antes do servidor | No OBS: **Propriedades → Atualizar cache da página atual** |
| O rodapé aparece com **3 ou mais linhas** ou **letra pequena** | A música está fora do padrão | Ajuste a música (Parte 1) |
| O rodapé mostra **nome e artista** | Capa com texto diferente do nome da música | Ajuste o slide de capa no Holyrics para ter o mesmo nome da música |
| A **fonte** está diferente da escolhida | O PC do OBS está sem internet | Normal: ele usa Segoe UI. Para usar Montserrat sem internet, instale a fonte no Windows |
| Projetar no Holyrics **cobre a tela do operador** | A TV não está como segundo monitor | Passo 2.4 |
| Funcionava, e **parou de funcionar** depois de um tempo | O IP do PC do Holyrics mudou (PCs diferentes) | Veja o IP novo (passo 2.5), atualize o `config.json` e reserve o IP no roteador |

---

## Referência rápida

| Endereço | Para quê |
|---|---|
| `http://localhost:8787/studio.html` | Estúdio: formatar letras, simular a TV e a live, gerar a URL do OBS |
| `http://localhost:8787/rodape.html` | O rodapé (usado no OBS) |
| `http://localhost:8787/rodape.html?debug=1` | Diagnóstico da conexão com o Holyrics |

| Arquivo | Para quê |
|---|---|
| `Iniciar-Rodape.bat` | Liga o servidor (deixe aberto durante o culto) |
| `Simular-Holyrics.bat` | Servidor de **treino**: finge ser o Holyrics, para treinar operadores sem o Holyrics |
| `config.json` | Endereço, porta e token do Holyrics. **Contém o token: não compartilhe** (fica fora do GitHub) |
| `config.exemplo.json` | Modelo do `config.json`, sem token. Copie e renomeie para `config.json` |
| `LEIA-ME.md` | Detalhes técnicos e todas as opções da URL do rodapé |
