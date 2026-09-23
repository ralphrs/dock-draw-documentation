# DEC-0044: ícones oficiais da AWS na pasta `aws-icons/` do bucket privado, lidos por URL assinada

**Data:** 2026-09-22
**Quem decidiu:** o dono do produto, em `DDP-549`, sobre a conferência de despacho da sessão A
**Registrado por:** Sessão A
**Substitui:** `DEC-0043` (bucket público `aws-icons`)

## Decisão

Os ícones oficiais da AWS ficam no bucket privado `diagram-images`, que já existe, dentro da pasta `aws-icons/`, um arquivo SVG por serviço no caminho `aws-icons/{categoria}/{slug}.svg`, subidos pelo dono do produto pelo painel Storage do Lovable Cloud, sem alteração de conteúdo. O app lê cada ícone por URL assinada, pelo mesmo adaptador que a imagem colada já usa (`src/infrastructure/supabase/image-storage.ts`, `signDiagramImage`), e embute o SVG como data URL na exportação, como já faz com o tipo `image`. Uma política de leitura nova em `storage.objects` libera o prefixo `aws-icons/` para qualquer pessoa autenticada, porque a política atual só aceita caminho iniciado pelo uuid de um projeto acessível. O manifesto estático continua em `public/aws-icons-manifest.json`.

## Por quê

A `DEC-0043` partiu de duas premissas falsas, achadas na conferência de despacho (`DDP-549`): a criação do bucket por SQL é recusada pela plataforma do Lovable (`DDP-419`), e o upload pelo painel do Supabase não existe para quem usa Lovable Cloud. O painel que existe é o Storage do Lovable Cloud, com bucket, pasta e upload (`DDP-549`, captura de 2026-09-22). O dono do produto preferiu reaproveitar o bucket que já tem a criar outro. O adaptador de URL assinada, a renovação antes de expirar e o embutir na exportação já estão prontos desde a `DDP-308`, então o ícone entra como caso particular de imagem, sem mecanismo novo.

## Alternativas descartadas

- Bucket público `aws-icons` (`DEC-0043`): não há caminho para criar por SQL, e criar pelo painel exigiria um bucket a mais para o mesmo painel de upload. Descartado pelo dono do produto.
- Pasta `public/aws-icons/` no repositório do app: 0,41 MB servido como arquivo estático, sem política nem URL assinada. Descartado pelo dono do produto em `DDP-549`, que preferiu o Storage.
- Subir os arquivos pelo agente do Lovable: nenhuma ferramenta dele sobe arquivo em bucket, e 122 uploads por agente não têm fluxo suportado.

## Custo aceito

- Uma URL assinada por ícone, com validade de uma hora e renovação um minuto antes de expirar, como a imagem colada. Diagrama com muitos serviços gera muitas assinaturas ao abrir. Medir quando a família `aws` estiver no preview.
- Política de leitura nova em `storage.objects` é RLS: categoria `app-release`, migração escrita pelo Lovable, conferida pela sessão A e aplicada com o sim do dono do produto.
- O SVG oficial é servido do domínio do Supabase e desenhado por `img` e data URL, nunca aberto no domínio do app. Sem risco de script.
- A atualização trimestral do pacote da AWS é upload manual pelo painel, pasta por pasta.

## Lacuna

- O painel Storage do Lovable Cloud ainda não foi conferido quanto a upload de pasta com subpasta. Se só aceitar arquivo a arquivo, o dono do produto cria as sete subpastas na mão. Confirmação em `DDP-549`.
- A lista de tipos do bucket segue não gravada (`DEC-0031`). Para a pasta `aws-icons/` não importa: não há política de escrita para ela.
