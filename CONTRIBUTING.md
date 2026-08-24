# Contribuindo

Obrigado pelo interesse no Fármaco Brasil.

## Modelo de governança

O projeto é mantido exclusivamente por Pedro Paulo Fernandes. Terceiros não recebem permissão direta de escrita no repositório ou na branch principal.

Contribuições externas são aceitas como sugestões por meio de:

- issues para erros, fontes e propostas metodológicas;
- pull requests para demonstrar uma alteração concreta;
- discussões dentro da issue ou do pull request.

Somente o mantenedor decide se, quando e de que forma uma sugestão será incorporada. Enviar uma contribuição não concede permissão de publicação, administração ou merge.

## Antes de sugerir uma mudança

- verifique se já existe issue semelhante;
- cite a fonte oficial e a data de acesso;
- explique granularidade e período;
- descreva limitações e risco de interpretação;
- não envie dados pessoais, dados de saúde individualizados ou credenciais;
- não inclua arquivos brutos grandes quando uma URL e checksum forem suficientes.

## Desenvolvimento

```bash
npm ci
npm run check
```

Para reconstruir a camada municipal:

```bash
python -m pip install numpy openpyxl
python scripts/build_access_data.py
python scripts/validate_access_data.py
```

Atualizações de dados precisam incluir revisão do manifesto, metodologia, dicionário e limitações.

## Pull requests

Um pull request é uma sugestão e deve:

- resolver uma questão delimitada;
- preservar proveniência e granularidade;
- incluir validação proporcional ao risco;
- não alterar acesso, publicação ou infraestrutura externa;
- manter a interface em português;
- declarar o que não foi possível validar.

O mantenedor pode adaptar a proposta, solicitar mudanças ou encerrá-la sem incorporação.
