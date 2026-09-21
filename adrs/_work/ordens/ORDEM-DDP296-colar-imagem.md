# Ordem DDP-296: colar imagem externa no diagrama

Prioridade 1, item 7 de `adrs/_work/ANALISE-editor-o-basico.md`. Categoria `app-release` (`DEC-0007`): cria bucket e política no Supabase Storage. Exige aprovação humana explícita antes de rodar, marcada nesta ordem.

## O que fazer

**1. Gatilho.** Ctrl+V com imagem na área de transferência do sistema, e arrastar um arquivo de imagem do sistema operacional para o quadro, criam um elemento de imagem na posição do mouse (ou do cursor de colagem).

**2. Armazenamento.** A imagem vai para um bucket privado do Supabase Storage, não para base64 dentro do elemento (descartado na análise, incha toda leitura do diagrama). Caminho do objeto: `{projectId}/{elementId}.{extensão}`, para a política poder ler o projeto direto do caminho.

**3. Tipos aceitos.** PNG, JPEG e WebP. Sem SVG: SVG pode carregar `<script>`, e a regra base do produto é que conteúdo de usuário nunca é compilado nem avaliado como código (`LEDGER.md`). Sem GIF animado, para não abrir a porta de arquivo grande disfarçado de imagem pequena.

**4. Tamanho máximo.** 5 MB por arquivo. Decisão desta ordem, sem medição de uso real; ajustável pelo humano se a prática mostrar que é pouco ou muito.

**5. Elemento de imagem.** `type: "image"` novo em `C4ElementType`. Ao contrário dos tipos hoje, não usa nenhuma das dez formas de `element-shape.tsx`: desenha a imagem em si, escalada à largura e à altura do nó, com o quadro e a borda de seleção que os outros elementos já têm. O caminho do objeto fica em `style.imagePath` (campo novo em `C4ElementStyle`, dentro do JSONB que a tabela já tem), sem migração de coluna nova em `model_elements`.

**6. Leitura da imagem.** Nunca por URL pública. A mesma linha de `getAssetSignedUrl`, já publicada como interface do ADR 003 para assets da wiki: URL assinada gerada no servidor, não direto do bucket, não pela política de RLS.

**7. Estado enquanto sobe.** Diferente das outras criações, não há o que pintar antes de gravar: o arquivo ainda não existe em lugar nenhum até o upload terminar. O elemento nasce com um estado de carregamento visível (por exemplo um contorno com indicador de progresso) e vira a imagem real quando o upload e a criação do elemento terminam. Falha no upload remove o elemento de carregamento e avisa, sem deixar elemento quebrado no quadro.

**8. Exclusão.** Apagar o elemento de imagem apaga também o objeto no bucket, na mesma operação de exclusão que já existe (`deleteNodeById`). Falha ao apagar o objeto não bloqueia nem desfaz a exclusão do elemento: o metadado do banco é a fonte de verdade, um objeto órfão no bucket é custo menor que travar a exclusão.

## Bucket e política (app-release, aprovação humana antes de rodar)

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('diagram-images', 'diagram-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY diagram_images_select ON storage.objects FOR SELECT USING (
  bucket_id = 'diagram-images'
  AND private.can_access_project((storage.foldername(name))[1]::uuid)
);

CREATE POLICY diagram_images_insert ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'diagram-images'
  AND private.can_access_project((storage.foldername(name))[1]::uuid)
);

CREATE POLICY diagram_images_delete ON storage.objects FOR DELETE USING (
  bucket_id = 'diagram-images'
  AND private.can_access_project((storage.foldername(name))[1]::uuid)
);
```

`private.can_access_project` já existe e já é usada na política de `view_nodes` hoje, reaproveitada aqui, não recriada.

## O que não fazer aqui

- Editar a imagem depois de colada (recortar, redimensionar o conteúdo interno além do nó): fora do pedido.
- Galeria ou reuso da mesma imagem em vários elementos: cada colagem sobe um arquivo novo.
- Nenhuma outra tabela, nenhuma outra política, nenhuma migração além do bucket e das três políticas acima.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md`) | Onde esta ordem cumpre |
| --- | --- |
| "Segurança: conteúdo de usuário nunca é compilado nem avaliado como código" (arquitetura base) | Exclusão de SVG da lista de tipos aceitos, item 3, exatamente por SVG poder carregar `<script>` |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova. Bucket e política são recursos do Supabase já usado, `private.can_access_project` já existe |

## Verificação

A sessão C confere no preview: colar imagem da área de transferência e arrastar arquivo criam o elemento na posição certa, tipo fora da lista (por exemplo SVG) é recusado com aviso, arquivo acima de 5 MB é recusado com aviso, o elemento mostra carregamento até a imagem aparecer, e apagar o elemento remove o arquivo do bucket (conferível pelo painel do Supabase Storage).

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não crie tabela nova nem coluna nova em `model_elements`: o caminho do objeto vai em `style.imagePath`.
- Não toque em `content.pages`, `content.spaces` nem qualquer tabela do ADR 003.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
