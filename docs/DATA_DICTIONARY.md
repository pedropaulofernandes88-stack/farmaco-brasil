# Dicionário de dados

## `app/data/access.json`

Os municípios são armazenados como vetores compactos. A ordem é declarada em `municipalityFields`.

| Campo | Tipo | Unidade/domínio | Definição |
|---|---|---|---|
| `id` | string | código IBGE, 7 dígitos | identificador territorial usado na camada estática |
| `name` | string | texto | nome do município/registro territorial |
| `uf` | string | sigla UF | unidade federativa |
| `population` | inteiro ou nulo | habitantes | população estimada em 2024 |
| `cnesPharmacies` | inteiro | estabelecimentos | CNES ativos com tipo de unidade 43 |
| `cnesRate` | decimal ou nulo | por 10 mil habitantes | `cnesPharmacies / population × 10.000` |
| `pfpbCovered` | booleano | verdadeiro/falso | cobertura PFPB observada segundo regra documentada |
| `nearestCnesKm` | decimal ou nulo | quilômetros | distância geodésica até presença CNES tipo 43 |
| `nearestCnesMunicipality` | string ou nulo | texto | município associado à menor distância CNES |
| `nearestPfpbKm` | decimal ou nulo | quilômetros | distância geodésica até cobertura PFPB observada |
| `nearestPfpbMunicipality` | string ou nulo | texto | município associado à menor distância PFPB |

Valores nulos indicam ausência de denominador ou de geometria compatível, não valor zero.

## Metadados nacionais

| Campo | Definição |
|---|---|
| `generatedAt` | momento UTC de geração |
| `populationYear` | ano do denominador populacional |
| `municipalities` | número de registros territoriais publicados |
| `population` | soma das estimativas não nulas |
| `cnesPharmacies` | soma dos estabelecimentos selecionados |
| `cnesRate` | taxa nacional calculada com os totais |
| `pfpbCoveredMunicipalities` | registros com cobertura observada |
| `pfpbNoCoverageObserved` | registros sem cobertura observada |
| `pfpbCoveragePct` | proporção territorial com cobertura observada |

## Resposta de `/api/bnafar`

| Campo | Tipo | Definição |
|---|---|---|
| `municipality` | string | nome informado pela fonte ou código consultado |
| `product` | string | descrição do produto na resposta oficial |
| `catmat` | string | CATMAT com unidade permitido |
| `latestDate` | data ou nulo | data mais recente presente na página consultada |
| `records` | inteiro | registros considerados na data mais recente |
| `facilities` | inteiro | CNES únicos na data mais recente |
| `totalQuantity` | número | soma das quantidades declaradas na data mais recente |
| `zeroRecords` | inteiro | registros cuja quantidade declarada é zero |
| `truncated` | booleano | resposta atingiu o limite de 1.000 registros |
| `entries` | lista | até oito agregados por CNES |
| `caveat` | string | ressalva obrigatória de interpretação |

`totalQuantity` não deve ser denominado estoque atual ou disponibilidade para retirada.
