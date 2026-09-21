# Guardar no navegador antes do banco: o que isso resolve e o que cobra

Continuação de `ANALISE-latencia-ao-soltar-elemento.md`. Proposta do dono do produto, 2026-09-21: salvar no navegador antes do banco, com gestão de cache e um TTL, gravando no banco de forma assíncrona.

## O núcleo da proposta está certo

Tirar o banco do caminho do olho é a correção. O atraso relatado existe porque o elemento só é desenhado quando o servidor responde, e nenhuma otimização de rede ou de SQL muda isso: o problema é a ordem das etapas, não a velocidade delas.

O que segue separa três coisas que a proposta junta, porque elas têm custos muito diferentes.

## Três camadas que a proposta trata como uma

**Camada 1, pintar antes de gravar.** O estado em memória da aba recebe o elemento imediatamente, a gravação segue em paralelo, e o erro desfaz. Resolve o atraso relatado por inteiro. Não precisa de armazenamento no navegador, não precisa de TTL, e é a técnica que o `moveNodes` do mesmo arquivo já usa.

**Camada 2, fila de escrita.** As gravações pendentes viram uma fila com repetição em caso de falha, e a tela mostra em que pé cada uma está. Resolve rede instável e evita perder uma escrita porque um pedido falhou em silêncio. Continua sem precisar de armazenamento durável.

**Camada 3, navegador como armazenamento durável.** O dado sobrevive a fechar a aba, e a sincronização acontece depois. Resolve trabalho offline. É outra ordem de grandeza de custo, e está analisada adiante.

A camada 1 resolve o que foi relatado. As camadas 2 e 3 resolvem problemas diferentes, que ninguém relatou ainda.

## TTL é o primitivo errado para escrita

TTL existe para **leitura**: guarda-se uma cópia e aceita-se que ela envelheça, porque a verdade mora noutro lugar e pode ter mudado. Expirar uma cópia de leitura custa uma releitura.

Escrita pendente não tem essa propriedade. Expirar uma escrita que ainda não chegou ao banco significa **descartar trabalho que a pessoa fez**, e isso nunca é o comportamento desejado. O que escrita pendente precisa é de fila, repetição e confirmação, não de prazo de validade. Uma escrita que não conseguiu ir para o banco em dez minutos continua tão válida quanto no primeiro segundo.

A ideia de TTL aparece aqui porque o modelo mental de cache de leitura foi aplicado a um problema de escrita. São mecanismos diferentes e não devem compartilhar o mesmo ciclo de vida.

## O cache de leitura que a proposta pede já existe e está sendo contornado

Na rota do diagrama:

```ts
const modelQuery = useQuery({ queryKey: ['model', projectId], queryFn: () => loadModel(...) })
const [model, setModel] = useState<Model | null>(null)
```

O modelo é buscado por `useQuery`, copiado para um `useState`, e todas as mutações escrevem no `useState`. O cache do TanStack Query guarda, a partir daí, uma cópia congelada no momento da carga, e ninguém a atualiza.

Duas consequências medidas por leitura de código:

**Existem duas cópias do mesmo dado**, e só uma está certa. Qualquer código que leia o cache em vez do estado lê uma versão desatualizada do diagrama.

**O `QueryClient` nasce sem configuração** (`new QueryClient()` em `router.tsx`), então o `staleTime` padrão é zero e toda remontagem refaz a busca. O `app-shell.tsx` define `staleTime` de cinco minutos para outra consulta, o que mostra que o ajuste é conhecido e não foi aplicado aqui.

A gestão de cache com prazo que a proposta descreve é exatamente o que o TanStack Query faz, já está instalado, e está desligado por contorno. Ligar isso é mais barato que construir qualquer coisa nova.

## O que a camada 3 cobra, contra este schema

Guardar no navegador como fonte durável esbarra em quatro coisas que este banco já decidiu.

**Unicidade não é verificável no cliente.** `content.pages` tem `unique nulls not distinct (space_id, project_id, parent_page_id, slug)`. O navegador não sabe quais slugs os outros usaram. Uma página aceita localmente pode ser recusada pelo banco depois, e alguém precisa decidir o que dizer para quem já a viu criada.

**Ordem calculada a partir de vizinhos diverge.** O `z_index` de um nó novo sai de `max(z_index) + 1` sobre os irmãos. Duas abas calculando isso localmente produzem o mesmo número para nós diferentes.

**Autorização mora na RLS, e a RLS mora no banco.** `private.can_access_view` decide se a escrita vale. O navegador pode aceitar uma escrita que o banco vai recusar, e escrita recusada depois de confirmada ao usuário é pior que escrita lenta.

**Armazenamento de navegador não é durável.** Ele é apagável pelo usuário, despejado sob pressão de espaço e bloqueado em janela privada. Dizer "salvo" quando o dado está só ali é uma afirmação falsa, e o custo dela chega de uma vez, no dia em que chega.

## O que o projeto já decidiu, e que a proposta precisa respeitar

O ADR 006 já desenhou a forma para a wiki: o rascunho vive no cliente entre edições e é sincronizado por `saveDraft` a cada 2 segundos de inatividade, com envio forçado a cada 30 segundos. `DraftVersionConflictError` recarrega sem bloquear, `RevisionConflictError` bloqueia com diálogo.

Isso é a camada 1 mais a camada 2, com o servidor como verdade. Não é a camada 3. A proposta, na forma da camada 1, é consistente com o que já está aceito, e estender o mesmo padrão ao diagrama não reabre nada.

## Recomendação

**Fazer agora:** camada 1 na mutation de criar elemento, e ligar o cache de leitura que já existe em vez de copiá-lo para `useState`.

**Fazer quando houver queixa:** camada 2, fila com repetição e estado visível de gravação.

**Não fazer sem um pedido explícito de trabalho offline:** camada 3.

**Em nenhuma das três:** TTL sobre escrita pendente.

## Lacuna declarada

Esta análise não mediu quanto do atraso vem da rede e quanto do servidor, e a recomendação não depende disso: a camada 1 tira a espera do caminho do olho qualquer que seja a divisão.

Também não foi avaliado o que acontece com o cache de leitura quando duas abas do mesmo diagrama ficam abertas. O problema existe hoje, com `useState`, e continuaria existindo com o cache ligado.
