# Prompt — ADR 015: Conjuntos de formas do Diagram Studio

> Rascunho da sessão A, para o humano revisar e copiar para `prompts/PROMPT-ADR-015.md`. A pasta `prompts/` é de escrita do humano.

[Colar o Bloco 0. Anexar: LEDGER.md; ADR-001 (Motor de diagrama), que precisa estar em `adrs/`; DEC-0019, DEC-0021, DEC-0022, DEC-0025, DEC-0026 e DEC-0027; `adrs/_work/REFERENCIA-drawio-persistencia.md` como material de pesquisa, não conferido; `adrs/_work/ANALISE-latencia-ao-soltar-elemento.md` e `adrs/_work/ANALISE-cache-no-navegador-e-escrita-assincrona.md`.]

# Tarefa
Escreva o ADR 015 — Conjuntos de formas do Diagram Studio. A `DEC-0021` decidiu que a aba do Studio é um quadro livre e que o C4 deixa de ser o modelo e passa a ser um conjunto de formas entre outros. O humano pediu dois conjuntos para as próximas versões: **C4 model** e **AWS**. Decida o que é um conjunto de formas neste produto, como ele é guardado, versionado e validado, e entregue os dois primeiros.

Este ADR reabre o ADR 001 no ponto central dele, que é o que o banco guarda de um diagrama. A reabertura é explícita e precisa de custo declarado.

# Perguntas que o ADR precisa responder
1. **Contrato de um conjunto de formas.** O que o produto precisa saber de uma forma para desenhá-la, editá-la, exportá-la e buscá-la. Como um conjunto declara as formas que tem, e como uma forma nova entra sem mexer no núcleo.
2. **Contêineres.** Diagramas AWS dependem de agrupamento aninhado: região, VPC, zona de disponibilidade, sub-rede, grupo de segurança. O C4 tem fronteira de sistema. É o mesmo mecanismo para os dois?
3. **Semântica por forma.** Uma forma carrega atributos de negócio (tipo C4, serviço AWS, tecnologia)? Onde eles moram? A referência do draw.io descreve o `UserObject` como forma possível.
4. **Validação como plugin.** O que um validador recebe e devolve. Erro bloqueante e aviso, no molde do `DOK-E`/`DOK-W` do ADR 002? Um diagrama pode declarar que segue o C4 e ser validado contra isso?
5. **O que o banco guarda.** Documento por diagrama, gravado inteiro com espera por inatividade (o modelo do draw.io), ou as três tabelas normalizadas de hoje (`model_elements`, `view_nodes`, `relationships`)? Custo de cada um para o atraso de interação medido em 2026-09-21, para conflito entre abas, e para a `DEC-0019`.
6. **Versionamento.** A `DEC-0019` decidiu que o diagrama versiona mantendo o mesmo id e que a página vincula o id e renderiza sempre o último. Como o formato escolhido na pergunta 5 ganha histórico.
7. **Migração.** Três projetos existem em produção no modelo C4 estruturado. O que acontece com eles.
8. **Ícones AWS.** Qual é a fonte oficial dos ícones, qual a licença e o que ela permite num produto. Versão e licença conferidas na web na data da pesquisa, com link. README não é evidência. Onde a atribuição da AWS aparece: texto pronto na `DDP-236`. A sessão A propõe duas posições, uma linha pequena no rodapé de todo arquivo exportado que contenha ícone AWS e uma página de licenças no app, e o ADR confirma ou troca.
9. **Os 24 tipos da `DEC-0026`.** O contrato de conjunto de formas precisa acomodar todos. Para roadmap, Gantt e ciclo de vida, com eixo de tempo, e para AS-IS vs. TO-BE, que compara dois estados, diga como entram: modo próprio do editor, posição derivada ou comparação entre versões. Base: `adrs/_work/INVENTARIO-formas-por-diagrama.md`.

10. **Esquema de cores do tenant (`DEC-0025`).** Onde o esquema é guardado, como tenant, espaço e projeto herdam um do outro, cor por forma e por tema, e que esquema vale para um diagrama embutido na wiki de outro espaço.
11. **Catálogo de ícones em escala (`DEC-0027`).** Landscape da CNCF, linguagens e infraestrutura somam centenas de ícones. Diga o formato do catálogo e como um ícone novo entra sem mudar código.

12. **Tipos de diagrama do C4 que faltam (`DEC-0029`).** Nível de código, panorama de sistemas, diagrama dinâmico e diagrama de implantação com nó de implantação e de infraestrutura. Base: `adrs/_work/INVENTARIO-C4-contra-documentacao.md`.

# Eliminatórios específicos
- R-01 Cor só por token, igual em tema claro e escuro, como no resto do app.
- R-02 Nenhuma forma de conjunto de terceiros entra sem licença conferida que permita o uso no produto.
- R-03 A tela de edição não espera a rede para mostrar uma mudança (lição das dez ações otimistas de 2026-09-21).

# Checagem para frente
- Renderização (007): o diagrama embutido na página da wiki é renderizado a partir do formato decidido aqui.
- Exportação (010): o formato tem representação exportável (imagem, e talvez o XML do draw.io).
- Busca (009): o que dentro de um diagrama é buscável.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: contrato de conjunto de formas; contrato de validador; formato gravado de um diagrama.
restricoes_impostas: toda forma nova entra por um conjunto, nunca por código específico do editor.
premissas: 007 e 010 consomem o formato decidido aqui.
