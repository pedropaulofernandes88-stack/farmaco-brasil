# Catálogo de fontes

| ID | Fonte e responsável | Granularidade | Referência | Uso | Limitação principal |
|---|---|---|---|---|---|
| CMED-2024 | [Anuário do Mercado Farmacêutico — Anvisa/SCMED](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/medicamentos/cmed/) | Brasil, princípio ativo/apresentação | 2024 | comercialização e faturamento | volumes territoriais não são publicados nessa fonte |
| RENAME-2024.2 | [Relação Nacional de Medicamentos Essenciais — Ministério da Saúde](https://www.gov.br/saude/pt-br/composicao/sectics/rename) | Brasil, medicamento/apresentação | 2ª ed. 2025 | presença normativa no SUS | não informa disponibilidade local |
| BPS-2024 | [Registros de compras compilados — Ministério da Saúde](https://www.gov.br/saude/pt-br/acesso-a-informacao/banco-de-precos/bases-anuais-compiladas/registro-de-compras-compilados-ano-base-2023-2024/view) | compra, instituição, município, CATMAT | ano-base 2024 | preço, quantidade e fornecedor | cobertura depende do registro de compras |
| BNAFAR-API | [Posição de estoque Hórus/BNAFAR — Ministério da Saúde](https://dadosabertos.saude.gov.br/dataset/bnafar-posicao-de-estoque/resource/8d9d25ed-01c1-4eb0-bc21-203728073a01) | data, CNES, município, CATMAT | consulta atual | posição declarada de estoque | parcial e não necessariamente em tempo real |
| CNES | [Cadastro Nacional de Estabelecimentos de Saúde](https://dadosabertos.saude.gov.br/dataset/cnes-cadastro-nacional-de-estabelecimentos-de-saude) | estabelecimento, município | arquivo consultado na geração | presença cadastral tipo 43 | cadastro não confirma atendimento ou dispensação |
| PFPB-VAGAS | [Anexo I do credenciamento Farmácia Popular](https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular/credenciamento/documentacao/anexo-i-lista-de-municipios_atualizada_em_06-03-2026.xlsx/view) | município, vaga | 06/03/2026 | cobertura observada inferida | não é inventário de unidades nem estoque |
| SIDRA-6579 | [População residente estimada — IBGE](https://sidra.ibge.gov.br/tabela/6579) | município | 2024 | denominador populacional | ano difere de algumas fontes de oferta |
| IBGE-MALHAS | [Malhas territoriais — IBGE](https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas.html) | geometria municipal | malha mínima consultada | centroides e distância | qualidade mínima, sem rede rodoviária |
| OBM-FHIR | [Ontologia Brasileira de Medicamentos](https://portal-obm.saude.gov.br/) | terminologia de medicamento | versionada | referência de interoperabilidade | integração ainda parcial |
| DCB | [Denominações Comuns Brasileiras — Anvisa](https://www.gov.br/anvisa/pt-br/assuntos/farmacopeia/dcb) | ingrediente | versão da fonte | nomenclatura | não resolve sozinha dose, forma e unidade |
| SIGTAP | [Tabela de procedimentos do SUS — DataSUS](https://sigtap.datasus.gov.br/tabela-unificada/app/download.jsp) | competência, procedimento | mensal | roadmap de produção especializada | ainda não integrada ao painel |

## Proveniência da camada municipal

O manifesto `data/access-manifest.json` é gerado pelo pipeline e contém as URLs exatas de download, tamanhos e hashes SHA-256 dos quatro insumos usados na camada municipal.

Os arquivos brutos não são redistribuídos neste repositório. Eles podem ser reconstruídos a partir das fontes registradas:

```bash
python -m pip install numpy openpyxl
python scripts/build_access_data.py
```

## Licenciamento

A licença MIT cobre o código original. Bases, documentos, marcas e publicações continuam submetidos aos termos dos respectivos órgãos. A presença de uma URL ou transformação no projeto não significa relicenciamento da fonte.

Antes de redistribuir um arquivo bruto, confirme seus termos atuais diretamente no portal responsável.
