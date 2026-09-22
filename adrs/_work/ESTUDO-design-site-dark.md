# Estudo: design system e layout do site do DokDraw, moderno, dark e futurista

**Data da pesquisa:** 2026-09-22
**Pedido:** humano, na `DDP-405`. "Se você fosse sugerir um design system e layout moderno para um website, pesquisando a fundo nas melhores tendências de mercado, o que você me sugeriria? Faça um estudo, analisando grandes designs de sites para o segmento de wiki e desenho de diagramas. Quero algo que seja moderno, dark e futurista."
**Alcance:** a tela inicial pública do DokDraw (landing) e os tokens que ela pede do app. O tema do editor não muda por este estudo.
**Protótipo:** https://claude.ai/artifact/ (link na `DDP-405`).

## Método

Cada home foi carregada em Chromium headless (Playwright, 1440×900) com `prefers-color-scheme: dark` emulado. De cada uma saíram os estilos computados: cor de fundo efetiva no centro do hero, fonte e peso do `h1`, botão primário, raio, cor de borda mais frequente em cards, contagem de gradientes e de `backdrop-filter`. Dos sites dark saíram também screenshots do hero e da segunda dobra. As fontes propostas foram confirmadas no endpoint `fonts.googleapis.com/css2` (HTTP 200). O contraste da paleta proposta foi calculado em WCAG 2.x.

Não verificado: motion real (só a contagem de gradientes e blur e a presença de `<canvas>` ou `<video>`), estados de hover, e a segunda dobra de Notion, Figma, Miro, Lucid, Confluence, Slite e Outline. Cores em `oklch` e `lab` foram aproximadas para hex. Várias páginas serviram pt-BR por geolocalização.

## 1. Os sites, um a um

"Segue sistema" quer dizer que a página muda com `prefers-color-scheme`.

### Wiki e diagrama (o segmento)

| Site | Tema | Fundo e tratamento | Acento | Tipografia | Hero | Detalhe que vale copiar |
| --- | --- | --- | --- | --- | --- | --- |
| [tldraw.com](https://www.tldraw.com/) | Claro `#f9fafb` | É o app, sem landing | Azul do botão | Inter 700 | Canvas real | Cai direto no canvas, zero atrito |
| [excalidraw.com](https://excalidraw.com) | Claro | Radial índigo atrás do hero, rabiscos | Índigo `#6965db` | Assistant 600 (56px), Excalifont nos rabiscos | Vídeo e frame do app | Palavra do título com marca-texto |
| [eraser.io](https://www.eraser.io) | Claro `#fcfbf9` | Grade 1px `#ededed` e hachura no frame | Preto, roxo e azul mínimos | Inter 600 (78px) | Frame do app com chrome de janela e campo de prompt | Título em dois tons (cinza e preto) |
| [whimsical.com](https://whimsical.com) | Claro, hero em gradiente lilás para rosa | 12 gradientes, 5 blur | Roxo e rosa | Manrope 700 | Screenshot real de board com diagrama | Único concorrente com diagrama de arquitetura real no hero |
| [miro.com](https://miro.com) | Claro `#ffffff` | 15 gradientes | Amarelo e azul | Roobert 500 (56px), Nanum Pen no "manuscrito" | Canvas e vídeo | Fonte manuscrita como voz do canvas |
| [lucid.co](https://lucid.co) | Claro `#ffffff` | Plano | Azul | Graphik Wide 200 (64px) | Vídeo de prompt gerando fluxograma | Peso 200 no título |
| [icepanel.io](https://icepanel.io) | Misto: hero ciano ilustrado, corpo dark `#0c0d0d` | Gradiente cinza para azul-petróleo | Verde-água | IBM Plex Sans 500 (48px), IBM Plex Mono | Ilustração e diagrama C4 vivo | Viewer C4 interativo embutido, com abas de exemplos |
| [structurizr.com](https://structurizr.com) | Segue sistema (`#111111` ou branco) | Plano, Bootstrap | Azul `#1168bd` | Open Sans 400, Menlo | DSL à esquerda, diagrama à direita | Texto e diagrama lado a lado, sem enfeite |
| [mermaid.ai](https://mermaid.ai/) | Claro | Ilustração pastel lavanda | Rosa `#e60a57` | Instrument Serif 400 (80px), Inter, Rec Mono | Campo de prompt gigante | Serif elegante para "sistemas" |
| [figma.com](https://www.figma.com) | Claro | Plano | Multicolor de produto | Figma Sans 400 (56px) | Mockups de produto | Peso 400 em título grande |
| [notion.com](https://www.notion.com) | Claro `#ffffff` | 4 gradientes | Preto | Inter 600 (96px) | Vídeo e screenshots empilhados | Título 96px em duas linhas |
| [gitbook.com](https://www.gitbook.com) | Claro | Onda laranja atrás do frame, 9 blur | Laranja | General Sans 700 (45px) | Frame de docs real | Pílula "New" acima do título |
| [mintlify.com](https://mintlify.com) | Dark `#0a0a0a` | Campo de linhas finas verdes animado em canvas | Verde | Arizona Flare serif 400 (50px), Inter | Frame real da doc e contador em mono | Métrica viva em mono ao lado do título |
| [getoutline.com](https://www.getoutline.com) | Claro | Plano | Neutro | HK Grotesk 600 (64px) | Screenshot | "Dark mode" vendido como feature |
| [obsidian.md](https://obsidian.md) | Dark `#0f0f0f` fixo | Textura sutil | Roxo `#7c3aed` só no CTA | system-ui 600 (60px), ui-monospace | App real com grafo de notas | Grafo de nós como assinatura do produto |
| [slite.com](https://slite.com) | Claro `#fdfdfd` | Sketches SVG | Amarelo e verde | Garnett 500 (64px) | Ilustrações | Selo SOC 2 no hero |
| [confluence](https://www.atlassian.com/software/confluence) | Claro | 13 gradientes | Azul `#1868db` | Charlie Display 600 (84px) | Formulário de e-mail | Signup direto no hero |

### Referências dark fora do segmento

| Site | Fundo | Tratamento | Acento | Tipografia | Hero | Detalhe que vale copiar |
| --- | --- | --- | --- | --- | --- | --- |
| [linear.app](https://linear.app) | `#08090a` fixo | Radial branco 4%, gradientes discretos, 3 blur | `#7170ff` quase invisível, CTA branco | Inter 510 (64px), Berkeley Mono | App real em frame com sombra | Rótulos mono "FIG 0.1" e ilustrações wireframe isométricas |
| [vercel.com](https://vercel.com) | `#000000`, segue sistema | Preto puro, um glow radial atrás do triângulo | Nenhum, CTA branco | Geist 400 (64px), Geist Mono | Símbolo com glow e faixa de logos | Um único glow, resto plano |
| [supabase.com](https://supabase.com) | `#1c1c1c`, segue sistema | Plano, banner ASCII em mono | Verde `#72e3ad` no CTA e na segunda linha do título | Manrope 500 (46px), Inter, Source Code Pro | Título curto, bento de 3 cards, dashboard real | Segunda linha do título na cor do acento |
| [raycast.com](https://www.raycast.com) | `#07080a` fixo | Faixas vermelhas com grão, 237 gradientes, 21 blur | Vermelho só na arte | Inter 600 (64px), JetBrains Mono | Arte abstrata e botão | Linha de instalação em mono sob o CTA |
| [resend.com](https://resend.com) | `#000000` fixo | Cubo 3D, 240 gradientes, canvas e vídeo | Nenhum, CTA branco | Domaine serif 400 (96px), Commit Mono | Render 3D | Serif grande em preto puro |
| [cursor.com](https://cursor.com) | `#14120b` quente, segue sistema | Pintura de paisagem atrás do frame | Laranja só em links | CursorGothic 400 (26px), Berkeley Mono | IDE real e CLI em frames | Título pequeno, produto enorme |
| [warp.dev](https://www.warp.dev) | Claro `#ffffff` (redesign 2026) | Grade de pontos 1px, colunas visíveis | Azul `#2a1eff`, amarelo | Matter Mono 500 (56px) no título | Figura "fig. 1" em grade | Rótulo de figura com réguas |
| [railway.com](https://railway.com) | `#13111c` fixo (índigo) | Nuvens noturnas com estrelas, dot grid no canvas | Roxo `#7c4dff` só no CTA | IBM Plex Serif 500 (54px), Inter, JetBrains Mono | Dashboard real com canvas de serviços | Linha do tempo vertical que acompanha o scroll |
| [clerk.com](https://clerk.com) | Claro `#f7f7f8` | Circuito esquemático desbotado, 107 gradientes, 18 blur | Roxo tímido | Suisse 700 (64px), Söhne Mono | Título e linha de prompt em mono | Prompt para agentes como CTA secundário |

## 2. O que se repete

1. **Quase-preto tingido, nunca `#000`.** Linear `#08090a`, Raycast `#07080a`, Railway `#13111c` (violeta), Obsidian `#0f0f0f`, IcePanel `#0c0d0d`, Cursor `#14120b` (quente). Preto puro só em Vercel e Resend, e os dois compensam com um único glow.
2. **Um acento, usado pouco.** Supabase põe o verde no CTA e numa linha do título. Railway e Obsidian põem o roxo só no botão. O CTA primário é branco ou quase branco em Linear, Raycast, Resend e Vercel, não a cor da marca.
3. **Título em peso médio, não bold.** Linear 510, Vercel 400, Supabase 500, IcePanel 500, Railway 500, Figma 400, Lucid 200. Bold 700 ficou nos sites claros.
4. **Serif ou mono como voz.** Serif em Railway, Resend, Mintlify e Mermaid. Mono no título em Warp. Sans neutra em Linear, Vercel e Supabase.
5. **Produto real no hero, com chrome de janela.** Linear, Obsidian, Railway, Cursor, Supabase, Mintlify, Whimsical, Eraser, Structurizr. Render abstrato só em quem vende infraestrutura (Vercel, Resend, Raycast).
6. **Hairline 1px em alfa baixo e raio de 8 a 16.** Blur é raro: Linear 3, Supabase 2, Cursor 0. Os pesados em blur (Raycast 21, Clerk 18) são exceção.
7. **Mono como textura editorial.** Rótulos "FIG 0.1" (Linear), "[ fig. 1 ]" (Warp), contador (Mintlify), linha de instalação (Raycast), banner ASCII (Supabase).
8. **Ilustração wireframe em traço, não 3D colorido.** Caixas isométricas (Linear), elefante em traço (Supabase), campo de linhas (Mintlify), circuito desbotado (Clerk).
9. **Grade de pontos como metáfora de canvas.** Railway, Warp, Eraser, Clerk. Para um produto de diagrama é a textura mais honesta.
10. **Título em dois tons.** Eraser (cinza e preto), Supabase (branco e verde).
11. **Um único glow radial, e só no hero.** Vercel, Linear (branco 4%), Excalidraw (índigo).
12. **Nenhum concorrente direto de wiki e diagrama é dark.** Notion, Confluence, GitBook, Slite, Outline, Miro, Lucid, Figma, Eraser, Whimsical, Mermaid e Excalidraw são claros. Só Obsidian e o corpo do IcePanel são dark. É espaço aberto.

## 3. Recomendação para o DokDraw

A direção é a de Linear, Railway e Supabase, tingida pelo roxo da marca: quase-preto violeta, um único acento lilás, título em peso médio, produto real no hero sobre grade de pontos, mono como rótulo. "Futurista" vem da precisão (grade, mono, hairline, uma luz só), não de gradiente nem de 3D.

### Paleta dark, tingida por `#301c5f`

| Token | Valor | Uso | Contraste sobre `bg-0` |
| --- | --- | --- | --- |
| `bg-0` | `#0b0912` | Página | |
| `bg-1` | `#120e1f` | Seção alternada | |
| `bg-2` | `#1a1430` | Card, frame | |
| `bg-3` | `#221b3d` | Card em hover, popover | |
| `border-1` | `#2b2344` | Hairline 1px | |
| `border-2` | `#3a2f5c` | Hover e foco de card | |
| `text-1` | `#ece8f7` | Título e corpo | 16,4:1 |
| `text-2` | `#aaa3c2` | Secundário | 8,2:1 |
| `text-3` | `#8f88a8` | Legenda e mono, mínimo permitido | 5,9:1 |
| `accent` | `#a78bfa` | Link, ícone, segunda linha do título | 7,3:1 |
| `accent-strong` | `#c4b5fd` | Fundo do CTA primário, com texto `#0b0912` | 10,7:1 |
| `accent-deep` | `#502e9e` | Só preenchimento de nó dentro de screenshot, nunca texto | 2,1:1 (reprova como texto) |
| `glow` | `rgba(167,139,250,.08)` | Um radial atrás do frame do hero | |

Regras do acento: um só matiz. Aparece no CTA primário, em links, na segunda linha do título e no glow do hero. Nunca em borda de card, nunca em fundo de seção, nunca em ícone decorativo. O roxo profundo da marca (`#301c5f`, `#502e9e`) vive dentro dos diagramas nos screenshots, onde já é linguagem do produto. `#e0d7f4` (componente) e `#e4e4ea` (externo) continuam como preenchimento de nó com texto `#241a44`.

### Tipografia (Google Fonts, confirmadas)

- Título e corpo: **Geist**, peso 500 em títulos (tracking -0.02em, 56 a 64px em duas linhas), 400 no corpo. Mesma família neutra e técnica de Vercel, no Google Fonts desde 2024.
- Mono: **Geist Mono** 400, 12 a 13px, caixa alta com tracking 0.08em, em rótulos "FIG 01", códigos de elemento C4 ("[Container]", "[Component]"), métricas e URLs.
- Opcional, para não parecer Vercel: **Instrument Serif** itálico numa única palavra do título. Só se a sessão D validar. Alternativas testadas e disponíveis: Manrope, Inter, IBM Plex Sans e Mono, JetBrains Mono, Space Grotesk, Bricolage Grotesque.

### Superfície, borda, glow

Card: `bg-2`, borda 1px `border-1`, raio 12, sem sombra. Hover: borda `border-2`, sem glow. Frame de produto: raio 16, borda 1px `border-1`, `inset 0 1px 0 rgba(255,255,255,.06)`, sombra `0 24px 64px rgba(0,0,0,.5)`. Botão: raio 8. `backdrop-filter` só na nav ao rolar. Grade de pontos `rgba(167,139,250,.07)`, 1px a cada 24px, como fundo do hero, que é o mesmo canvas do app.

### Hero

Coluna esquerda: título em duas linhas (a segunda em `accent`), subtítulo de uma linha em `text-2`, par de CTAs ("Começar grátis" em `accent-strong`, "Ver um exemplo" fantasma com borda `border-2`), linha mono abaixo com uma prova concreta ("C4 · AWS · Azure · GCP · OCI · DokMD"). Abaixo, frame de largura cheia com chrome de janela mostrando o app **em tema dark** dividido: página de wiki à esquerda, diagrama de containers C4 à direita, com ícones de nuvem dentro do diagrama. Rótulo mono acima do frame: "FIG 01 · Diagrama de containers e a página que o documenta". Imagem estática (AVIF de até 150 KB) como `poster`, com um loop de 6 a 8 s (WebM e MP4, mudo, até 1,5 MB, só acima de 1024px) mostrando uma edição no diagrama refletida na página.

### Ordem das seções

1. Nav transparente, blur ao rolar.
2. Hero.
3. Faixa de prova: logos se houver, senão três números em mono (páginas, diagramas, exportações), nunca contadores falsos.
4. "Wiki e diagrama no mesmo lugar": duas colunas, screenshot real de página com bloco de diagrama embutido.
5. "C4 em três níveis": três cards com recortes reais (contexto, container, componente) nas cores da marca.
6. "Ícones das quatro nuvens": um card largo com diagrama real contendo AWS, Azure, GCP e OCI.
7. Fluxo editorial e versões (ADR 003 e 004): linha do tempo vertical, estilo Railway.
8. Exportação e publicação (ADR 010 e 011): bloco mono com URL publicada e formato exportado.
9. "Por que DokDraw": três colunas com ilustração wireframe em traço, rótulos FIG 02 a 04.
10. CTA final com o único glow radial da página.
11. Footer com o alternador de tema do app. A landing fica dark.

### Orçamento de motion

Três coisas, no máximo: blur da nav, loop do hero, reveal de seção (opacidade mais 8px, 200 ms, uma vez). `prefers-reduced-motion` desliga o loop e o reveal. Sem parallax, sem glow que segue o cursor, sem 3D, sem canvas WebGL.

### Acessibilidade

Todo texto em `text-3` ou mais claro (5,9:1 ou mais). CTA lilás com texto escuro (10,7:1). Foco visível: anel 2px `#c4b5fd` com offset 2px em todo elemento interativo. Nada comunicado só por cor (os níveis C4 têm rótulo mono). Vídeo com `poster` e sem áudio. Links no corpo sublinhados no hover. O tema claro do app (`#241a44` sobre `#f7f6fa`, 14,9:1) fica intacto.

### O que não fazer

Gradiente roxo para azul em texto ou hero. Glass em todo card (só na nav). Glow em borda de card ou botão. Preto `#000` com traços roxos saturados (halo). Render 3D abstrato que não mostra o produto. Mascote ilustrado. Título 96px em 700. Pílulas em tudo. Borda em gradiente. Contadores animados sem dado real. Ícones de nuvem recoloridos ou fora de screenshot.

## 4. Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Supabase com as cores trocadas (pedido anterior na `DDP-405`) | Supabase é cinza neutro `#1c1c1c` com um verde. Trocar o verde por roxo sobre cinza neutro dá o halo saturado que o estudo manda evitar. O fundo precisa ser tingido pelo roxo, e isso já é outra paleta |
| Raycast ou Resend (arte abstrata, muitos gradientes e blur) | Vendem infraestrutura, não canvas. Custo de GPU alto e o produto some do hero |
| Serif no título inteiro (Railway, Mermaid) | Quatro dos sites dark já fazem isso. Vira tendência saturada em 2026. Fica como opção de uma palavra |
| Landing clara, igual aos concorrentes do segmento | Nenhum concorrente de wiki e diagrama é dark. Ficar claro é entrar na fila |

## 5. Custo aceito

A landing dark obriga o app a ter tema dark pronto antes, com screenshots reais em dark. O roxo profundo da marca não serve como texto no dark e ganha um degrau lilás (`#a78bfa`, `#c4b5fd`). Geist é a fonte de Vercel e o site vai lembrar Vercel para quem conhece. O estudo aceita isso em troca de uma família neutra, gratuita e com mono casada.

## 6. Riscos

1. **Landing dark, app com tema claro por padrão.** Os screenshots do hero precisam ser do app em tema dark, senão o frame claro dentro da página escura vira o elemento mais brilhante da tela e quebra a hierarquia. O tema dark do app tem de estar pronto antes da landing, na mesma família de matiz (`bg-2 #1a1430`). Decisão de token, cabe à sessão D propor e à A validar. Uma seção da landing deve mostrar o tema claro para sinalizar que existem os dois.
2. **Logos de provedores de nuvem.** Só dentro de screenshots reais (hero e seção 6), nunca em faixa de logos nem recoloridos. A imagem de compartilhamento social (OG) tende a ser um screenshot e vai carregar os ícones. Conferir as diretrizes de marca de AWS, Azure, GCP e OCI antes de publicar.
3. **Desempenho de hero animado.** O orçamento limita a um vídeo de até 1,5 MB com `preload="metadata"`, poster AVIF, nada de blur em área grande e LCP abaixo de 2,5 s.
4. **Lovable como implementador (`DEC-0007`).** Os tokens entram como variáveis CSS do Tailwind e shadcn, e as fontes por `<link>` com `display=swap`. Geradores tendem ao clichê de gradiente. A ordem para o Lovable precisa proibir explicitamente a lista do "o que não fazer".
5. **Idioma da landing** não está decidido em nenhum insumo. Fica como pendência.

## Verificação

Com a página no ar: fundo do hero mede `#0b0912`, nenhum gradiente em texto, um único `backdrop-filter` (na nav), um único radial (hero ou CTA final). Contraste de todo texto acima de 5,9:1 no Lighthouse. Fontes carregam de `fonts.googleapis.com` sem fallback silencioso. Com `prefers-reduced-motion`, o vídeo não toca e nada anima. LCP abaixo de 2,5 s em 3G rápido. Os screenshots do hero são do app em tema dark.

## Fontes complementares

[LogRocket sobre "Linear design"](https://blog.logrocket.com/ux-design/linear-design/), [Linear: como redesenhamos a UI](https://linear.app/now/how-we-redesigned-the-linear-ui), [Geist (Vercel)](https://vercel.com/geist/introduction), [teardown do railway.com](https://design.withfudge.com/share/railway.com-design), [SaaSFrame: tendências 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples).

## Retorno do humano (2026-09-22)

O humano escolheu a direção D pelo protótipo (`DDP-405`, comentário de 11:24) e pediu três mudanças, aplicadas na versão 3 do protótipo, cuja fonte está em `adrs/_work/prototipos/site-dark/`:

1. **Sem estouro de texto.** Rótulos de tipo como `[Container: CloudFront]` e `[External: Azure Service Bus]` vazavam das caixas nos diagramas do hero e da seção das nuvens. As caixas foram alargadas e os rótulos encurtados, e a regra passa a valer para a página real: rótulo que não cabe é cortado com reticência, como o app faz com `truncate`, nunca vaza. A página inicial é a cara comercial do produto, e um vazamento ali custa mais do que no editor.
2. **Menu Diagramas no lugar de C4.** O C4 deixa de ser o único protagonista. A navegação ganha o item "Diagramas" com um submenu por família, na ordem do catálogo do app (`src/domain/c4/families.ts`): C4 Model, Formas básicas, AWS, Azure, Google Cloud, OCI, Tecnologias, UML e BPMN. A seção "C4 em três níveis" vira a seção "Diagramas", com um card por família e o link "Ver a página", porque cada família terá página própria com formas, regras e exemplo. A seção das nuvens continua, agora "no mesmo canvas" em vez de "dentro do C4".
3. **Menu Desenvolvedores.** Item de navegação que leva ao Developer Portal, uma segunda página do protótipo (`desenvolvedores.html`). A página mostra o que o portal precisa demonstrar, alinhado à `DEC-0006` (decisão 3, DokMD versionado no git e renderizado pelo produto) e ao ADR 014 ainda não escrito: nove seções (comece aqui, formato DokMD, arquitetura viva, decisões, API e dados, contribuir, versões, qualidade, glossário), as doze seções do arc42 com o diagrama que cada uma carrega, um exemplo de página DokMD com bloco de diagrama versionado, e as três regras que mantêm o portal vivo. Os números do painel de status são exemplo de layout, marcados como tal.

O que continua em aberto: idioma da landing, screenshots reais do app no lugar dos desenhos vetoriais, e a prancha no Figma pela sessão D depois da aprovação da versão 3.
