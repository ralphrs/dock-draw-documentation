# Organização dos arquivos do DokDraw no Figma

Regra fixada pelo humano em 2026-09-22, em vigor para a sessão D, para a sessão A e para o próprio humano. Complementa a `DEC-0028` e as emendas dela. Nenhum design novo avança antes de a estrutura abaixo estar aplicada.

## As pastas

Tudo fica no plano `SquadPro`, projeto `dok draw app`. Três lugares, cada um com um papel só.

| Lugar | Link | O que guarda | Quem escreve |
| --- | --- | --- | --- |
| `dok draw app` (raiz) | https://www.figma.com/files/folder/658360362 | Só o arquivo `design-system-latest` | Sessão D, por consolidação aprovada |
| `dok draw app/draft` | https://www.figma.com/files/folder/658381844 | Proposta em andamento ou aguardando aprovação do humano | Sessão D cria e edita |
| `dok draw app/done` | https://www.figma.com/files/folder/658381968 | Proposta aprovada, arquivada como registro de como foi validada | Humano move, ninguém edita |

`design-system-latest` (https://www.figma.com/design/gN8mZGcM6KXDP6iWkMQCHL) é o arquivo vivo: tipo Design, organizado em camadas, com todas as decisões já tomadas. Só guarda o que o humano aprovou. Quem consulta "como é a forma X hoje" abre esse arquivo, nunca um draft.

Camadas do `design-system-latest`, uma página por camada: Fundação (temas, paletas, tipografia, espaçamento), Componentes de base (moldura, alça de conexão), Conexões, e uma página por família de formas: C4 Model, Básicas, AWS, Azure, Google Cloud, OCI, Tecnologias, UML, BPMN. Página nova só quando a primeira forma da família é aprovada.

## Ciclo de vida de uma proposta

1. **Nasce em `draft`.** A sessão D cria o arquivo com `create_new_file` passando `planKey` do `SquadPro` e `projectId: "658381844"`. Sem o `projectId` o arquivo cai no rascunho pessoal e fica perdido para o humano. Nome do arquivo: `Forma básica: <nome>` para forma, `Contêineres <família>: <tema>` para contêiner, `Wireflow <área>` para wireflow. Um arquivo por tarefa de conferência final, com as páginas das subtarefas dentro.
2. **Vai ao humano** pela tarefa de conferência final nos dois temas, com a sessão A conferindo antes.
3. **Aprovada**, a sessão A abre no mesmo ciclo dois cards: um de consolidação para a sessão D, nomeando a página do `design-system-latest` e as regras aceitas, e um de rótulo `humano` com a lista dos arquivos a mover para `done`.
4. **Consolidada.** A sessão D reconstrói a forma no `design-system-latest`, como conjunto de componentes com variantes (Estilo × Estado), cores só por variável da coleção Tema, no padrão da página C4 Model. A API não copia nó entre arquivos, por isso a consolidação é reconstrução a partir da especificação lida no draft.
5. **Arquivada.** O humano move o arquivo de `draft` para `done`, com o nome que já tem. O draft não é editado depois disso.

Proposta recusada fica em `draft` até virar aprovada ou ser descartada. Descarte é gesto do humano, que apaga o arquivo.

## O que a API do Figma faz e o que não faz

Conferido em 2026-09-21 (`DDP-368`) e 2026-09-22.

| Gesto | API | Quem faz |
| --- | --- | --- |
| Criar arquivo dentro de uma pasta | Sim, `create_new_file` com `projectId` | Sessão D |
| Editar conteúdo, páginas, variáveis | Sim, `use_figma` | Sessão D |
| Mover arquivo entre pastas | Não | Humano |
| Renomear arquivo | Não. `figma.root.name` responde "Setting the document name is currently not supported" | Humano |
| Apagar arquivo | Não | Humano |
| Listar o conteúdo de uma pasta | Não | Humano, ou a sessão A pelo navegador |

Todo card que precisa de um desses gestos manuais leva o rótulo `humano`, com a lista exata de arquivos e links, e uma pergunta com o significado do arraste.

## Regras para a sessão D

- Antes de criar arquivo, confira com `whoami` o `planKey` do `SquadPro` e use `projectId: "658381844"`. Registre no resultado o link do arquivo e a pasta em que ele nasceu.
- Um arquivo por proposta, pequeno, feito para o humano validar. Nada de arquivo "de trabalho" fora do ciclo.
- Nunca edite o `design-system-latest` fora de um card de consolidação aberto pela sessão A.
- Nunca recrie no `done` o que está no draft. `done` é arquivo do humano.
- No resultado de toda consolidação, liste os arquivos de draft que ficaram aprovados, para a sessão A montar o card de mover.

## Regras para a sessão A

- Toda aprovação do humano gera, no mesmo ciclo, o card de consolidação e o card de mover. Sem os dois, a forma fica aprovada só no draft.
- Conferência do estado das pastas quando houver dúvida: pelo navegador, nos links acima. A API não lista pasta.
- Divergência entre o que este guia diz e o que está nas pastas vira card `humano` com a correção pedida, nunca ajuste silencioso.
