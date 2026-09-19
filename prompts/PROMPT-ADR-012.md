# Prompt — ADR 012: Consolidação da stack (auditoria de compatibilidade)

[Colar o Bloco 0. Anexar: LEDGER.md completo; todos os ADRs 001 a 011.]

# Tarefa
Escreva o ADR 012 — Consolidação da stack de documentação. Não escolha tecnologia nova. Audite se as escolhas isoladas formam um sistema coerente com a arquitetura base, e aponte o que precisa ser reaberto.

# O que o ADR precisa conter
1. Tabela da stack final: camada × tecnologia × versão × licença × ADR.
2. Matriz de compatibilidade N×N entre as tecnologias escolhidas: mesma AST? mesmas versões de React/Vite/TS? mesmo registry de componentes? conflitos de peerDependencies? duplicação de parser (ex.: dois parsers Markdown diferentes no bundle)?
3. Verificação de cada "premissa_sobre_camadas_futuras" do ledger: foi cumprida pela camada destinatária? Evidência.
4. Verificação de cada "restricao_imposta": alguma camada posterior a violou?
5. Auditoria de licenças da árvore inteira de dependências.
6. Orçamento de bundle por rota (Landing, Wiki leitura, Wiki edição, Studio) e o que é carregado sob demanda.
7. Fluxo ponta a ponta, em diagrama de sequência (Mermaid): escrever → salvar → validar → revisar → aprovar → publicar → indexar → exportar/sincronizar. Cada passo com a camada e a interface responsável.
8. Lacunas: requisitos do produto (Bloco 0) que nenhuma camada cobre.
9. Lista de reaberturas, se houver: qual ADR, por quê, custo, prioridade.
10. Plano de implementação consolidado em fatias, ordenado por dependência entre camadas, com critério de pronto.

# Critério de pronto
Nenhuma premissa sem dono, nenhuma restrição violada sem reabertura registrada, nenhuma licença eliminatória na árvore, e o fluxo ponta a ponta sem passo órfão.
