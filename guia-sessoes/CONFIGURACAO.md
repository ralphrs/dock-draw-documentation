# Configuração e ordem de início

## 1. Onde fica a pasta de tarefas

`tasks/` fica **dentro** de `adr-kit/`, e não em `../tasks`. As duas sessões rodam em `adr-kit/`, e o Claude Code só escreve fora do diretório do projeto com `--add-dir`. Dentro, a pasta também entra no Git junto com os ADRs, e o histórico de dúvidas e respostas fica versionado.

Se preferir fora, abra as duas sessões com `claude --add-dir ../tasks` e troque `tasks/` por `../tasks/` nos scripts e no protocolo.

## 2. Permissões

O `.claude/settings.json` do pacote de atualização já traz as permissões de `tasks/` e dos scripts, e bloqueia edição de `guia-sessoes/`. Depois de copiar, rode no terminal:

```bash
chmod +x guia-sessoes/bin/*.sh
```

## 3. Ordem de início

1. Abra a sessão A (nova) em `adr-kit/` e cole `PROMPT-SESSAO-A.md`.
2. Na sessão B (a que está na parada 4), cole `PROMPT-SESSAO-B.md`.
3. A cria `T-0001` e pergunta a você sobre a parada 4. B espera a `T-0001`, publica `Q-0001` e passa a escutar.
4. Daqui em diante, você conversa com A. Acompanhe pelo `tasks/LOG.md`.

## 4. Custo da escuta

Cada ciclo de escuta é uma chamada de ferramenta. Com timeout de 570 s são cerca de 6 chamadas por hora ocioso, por sessão. A regra de ociosidade para as duas depois de uma hora sem evento.
