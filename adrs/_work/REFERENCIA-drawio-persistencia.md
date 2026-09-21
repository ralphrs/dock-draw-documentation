# Referência: persistência, autosave e conexões no draw.io

**Procedência:** quatro textos de pesquisa trazidos pelo dono do produto em 2026-09-21, consolidados aqui sem as partes repetidas. É material de terceiro e **não foi conferido contra o código-fonte do draw.io**. Nomes de classe, de propriedade e de algoritmo citados abaixo (`scheduleAutosave`, `autosaveDelay`, `desktopAutoSync`, `extractGraphModelFromPng`, o teste de conflito em duas camadas) são alegações da pesquisa, e precisam ser conferidos no repositório `jgraph/drawio` antes de servirem de evidência num ADR.

**Para que serve:** insumo do ADR 015 (`DDP-151`) e da discussão sobre atraso no editor de diagrama (`adrs/_work/ANALISE-latencia-ao-soltar-elemento.md`).

---

## 1. Arquitetura client-side-first, e por que não há atraso

A manipulação dos objetos e a renderização vetorial acontecem inteiramente no navegador ou no runtime desktop (Electron), pelo motor `mxGraph` / `maxGraph`. Nenhuma ação de edição espera rede ou validação de servidor para atualizar a tela.

**Renderização e persistência são camadas separadas.** Ao conectar duas formas, o motor altera o grafo em memória e desenha o conector na hora, sem esperar serialização nem envio.

**Modelo e transações.** O modelo central é `mxGraphModel` (`GraphModel` no maxGraph), que mantém a hierarquia de objetos `<mxCell>`. Toda alteração topológica (adicionar nó, mover geometria, reconfigurar conector, mudar estilo) é uma transação atômica gerida pelo `mxUndoManager`.

**Conexão.** Ligar dois elementos é alterar os atributos `source` e `target` do `<mxCell>` da aresta, em memória.

## 2. Detecção de mudança e debouncing

1. Ao fim de uma transação, o `mxGraphModel` emite `mxEvent.CHANGE`. O controlador `EditorUi` captura e marca o `DrawioFile` como modificado (*dirty state*).
2. A rotina `scheduleAutosave` cancela o temporizador anterior e agenda nova gravação segundo `autosaveDelay`. A gravação só acontece depois que o usuário para de interagir pelo tempo configurado.
3. O diagrama não é duplicado em memória durante a espera. O sistema se apoia na pilha de deltas do `mxUndoManager` e gera o XML consolidado só no instante da gravação.

O objetivo declarado é evitar I/O durante edição contínua (arrastar um nó, por exemplo) e não estourar limite de taxa das APIs de nuvem.

## 3. Camada de armazenamento (`DrawioFile`)

A classe abstrata `DrawioFile` isola o editor dos destinos de gravação.

- **Locais:** `StorageFile` (LocalStorage ou IndexedDB) e `LocalFile` (File System Access API no navegador, IPC e `fs` do Node no desktop).
- **Nuvem:** `DriveFile`, `OneDriveFile`, `DropboxFile`, `GitHubFile`, `GitLabFile`, por REST e OAuth2. Se a conexão falha durante o autosave, os dados ficam num rascunho local até a rede voltar.

## 4. Formato e serialização

A cada gravação o draw.io escreve um **snapshot XML completo**, e delega o histórico de revisões ao armazenamento de destino (Drive, OneDrive, Git).

Estrutura: raiz `<mxfile>` com atributos globais (`etag`, `version`), um `<diagram>` por página, e dentro de cada página um `<mxGraphModel>` com `<root>` e a coleção de `<mxCell>`. Cada célula tem `id` único, geometria (`<mxGeometry>`), conexões e estilo.

```xml
<mxfile etag="sPZhZ1..." version="21.0.0" type="device">
  <diagram id="page-1" name="Página-1">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="2" value="Início" style="rounded=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="3" style="edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="2" target="4">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

**Formatos embutidos:**

- **PNG editável (`.drawio.png`):** o XML é comprimido com zlib/DEFLATE e gravado nos metadados do PNG, em chunks `zTXt` ou `tEXt`, sob a chave `mxfile` ou `mxGraphModel`. Na leitura, `extractGraphModelFromPng` tenta zlib padrão (RFC 1950) e recai para DEFLATE cru se falhar.
- **SVG editável (`.drawio.svg`):** o XML vai como comentário no cabeçalho ou como atributo da tag `<svg>`. Texto com HTML e CSS usa `<foreignObject>`.

## 5. Concorrência e conflitos

Não há sincronização contínua de operações (nem OT nem CRDT). Por gravar snapshots, a validação acontece no momento da gravação.

**Nuvem:** concorrência otimista por cabeçalho `ETag`. Se o `ETag` remoto difere do carregado na sessão, a escrita para e a reconciliação começa.

**Arquivo local e desktop:** sem cabeçalho HTTP, uma mudança no timestamp do arquivo dispara um teste em duas camadas.

1. Tamanho em bytes diferente da última gravação confirma o conflito.
2. Tamanho igual leva a um checksum estrutural do XML. Checksum igual ao da memória é tratado como falso positivo (antivírus, rotina do sistema operacional) e o aviso é suprimido.

**Mesclagem estrutural:** com conflito confirmado, o `DrawioFile` compara os dois XML mapeando os `<mxCell>` pelo `id`. Mudanças em propriedades diferentes da mesma célula (posição local, texto remoto) são combinadas sozinhas. Colisão na mesma propriedade é mesclada automaticamente se `desktopAutoSync` estiver ativo, ou abre um diálogo com **Overwrite**, **Merge** e **Cancel**.

## 6. Desempenho da interface

A renderização no DOM (SVG ou Canvas) é síncrona na thread principal. Serialização XML, compressão DEFLATE, codificação Base64 e comunicação de rede são fatiadas em Promises e microtasks, intercaladas com a renderização, para manter a thread livre a 60 quadros por segundo. Exportação pesada (PNG, PDF, SVG) roda em Web Workers.

## 7. Modo embutido

Hospedado em `iframe` (`embed.diagrams.net`), o draw.io delega a persistência à aplicação hospedeira por `postMessage`:

1. O editor abre e envia `init`.
2. A hospedeira responde com `load`, trazendo o diagrama (XML, CSV ou imagem comprimida).
3. Durante a edição, o editor emite eventos de estado e mensagens `save` ou `exit`, e a hospedeira grava no próprio banco ou armazenamento.

## 8. Acréscimos do quarto texto

O quarto texto é escrito em tom prescritivo ("mandatório", "a única via"). As prescrições são opinião do texto, não documentação do draw.io, e ficam registradas como alegação.

**Início da sessão no modo embutido.** O texto diz que o editor emite `ready`. A seção 7 acima, vinda de outro texto, diz `init`. Os dois não podem estar certos ao mesmo tempo, e a divergência fica em aberto até conferência.

**Carga de formato que não é XML.** Por padrão o editor passa a carga por `mxUtils.parseXml`. CSV e outros formatos precisam de descritor: `{action: 'load', descriptor: {format: 'csv', data: '...'}}`. Mandar CSV sem descritor produz `Not a diagram file (error on line 1 at column 1)`.

**Pipeline de compressão**, em quatro passos: `mxUtils.getXml()` sobre o modelo, `encodeURIComponent()`, `pako.deflateRaw()` (DEFLATE cru, RFC 1951, sem cabeçalho zlib) e Base64. Na leitura de PNG, o fallback de zlib (RFC 1950) para DEFLATE cru, descrito na seção 4, cobre arquivos gerados por versões ou ferramentas diferentes.

```js
const pako = require('pako')
function encodeLibraryEntry(xmlContent) {
  const compressed = pako.deflateRaw(encodeURIComponent(xmlContent))
  return Buffer.from(compressed).toString('base64')
}
```

**Detecção de conflito em três níveis**, acrescentando o `ETag` na frente das duas camadas da seção 5: divergência de `ETag` na nuvem, variação de tamanho em bytes, e checksum estrutural quando o tamanho é igual.

**Integridade de id ao remover elemento.** O texto cita a [discussão #4468 do `jgraph/drawio`](https://github.com/jgraph/drawio/discussions/4468), que **foi conferida e existe**: "(embed mode) Merge doesnt always work", aberta em junho de 2024. O relato é que o merge por `postMessage` falha depois que algo é removido do diagrama. O texto apresenta a causa como diagnosticada, e na discussão ela é **hipótese de quem abriu**: os ids removidos continuariam numa lista interna, e o motor acharia que a forma ainda existe.

**Web Worker a partir de 1.000 células.** O limiar é alegação do texto, sem fonte.

---

## Leitura da sessão A contra o DokDraw

**O contraste que explica os atrasos.** O draw.io guarda um documento por diagrama e grava o documento inteiro depois de um intervalo sem edição. O DokDraw guarda o diagrama normalizado em `model_elements`, `view_nodes` e `relationships`, e cada gesto é uma ida ao servidor. A atualização otimista despachada em 2026-09-21 esconde a espera sem remover a causa.

**O que o DokDraw já tem de equivalente:** espera por inatividade no mover elemento (400 ms), rascunho da wiki com envio a cada 2 s de inatividade e forçado a cada 30 s (ADR 006), e concorrência otimista por `expectedVersion` com `DraftVersionConflictError` (ADR 006), que é o papel do `ETag`.

**O que pesa para o ADR 015:** a `DEC-0021` (aba como quadro livre) e a `DEC-0019` (diagrama versiona no mesmo id) combinam com documento versionado por diagrama. A mesclagem por id de célula sai quase de graça nesse modelo.

**O modo embutido é uma alternativa inteira, não um detalhe.** Hospedar o draw.io num `iframe` substituiria o editor React Flow do ADR 001 em vez de reproduzir a arquitetura dele. Fica registrado como opção a pesar, não como recomendação.

**O caso da #4468 tem espelho no DokDraw.** A atualização otimista despachada em 2026-09-21 cria elemento com id provisório, troca pelo real quando o servidor responde, e desfaz apagamento reinserindo o que saiu. É o mesmo terreno: um id que sai do estado e volta, ou uma conexão que aponta para um elemento ainda provisório. A conferência daquela entrega precisa olhar exatamente isso.

## Lacuna declarada

Só a discussão #4468 foi conferida. O resto deste arquivo não foi conferido no código-fonte. As afirmações de maior peso para uma decisão, e que por isso precisam de conferência primeiro, são o gatilho de gravação por `autosaveDelay`, a mesclagem por id de célula e o protocolo de mensagens do modo embutido.
