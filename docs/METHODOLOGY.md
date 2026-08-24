# Metodologia

## Escopo

O Fármaco Brasil é uma ferramenta exploratória de inteligência farmacêutica territorial. Integra fontes com granularidades distintas sem atribuir à fonte uma precisão que ela não possui.

## Unidade de análise

A principal unidade territorial é o registro municipal identificado pelo código IBGE. Algumas fontes são nacionais por princípio ativo; outras apresentam compra, estabelecimento ou posição declarada de estoque.

Nenhuma desagregação territorial é fabricada quando a fonte publica apenas total nacional.

## Indicadores

### Farmácias CNES por 10 mil habitantes

\[
taxa = \frac{estabelecimentos\ CNES\ ativos\ tipo\ 43}{população\ estimada\ em\ 2024} \times 10.000
\]

Numerador: estabelecimentos ativos com `TP_UNIDADE = 43` no arquivo CNES utilizado.

Denominador: população residente estimada da tabela SIDRA 6579, variável 9324, período 2024.

O indicador mede presença cadastral, não capacidade, funcionamento, vínculo com o SUS ou dispensação.

### Cobertura Farmácia Popular observada

A fonte usada é o Anexo I do credenciamento do PFPB, atualizado em 6 de março de 2026. A classificação é uma inferência operacional:

- município fora da lista de vagas: cobertura observada;
- município com vaga preenchida: cobertura observada;
- município listado com vaga não preenchida: cobertura não observada.

Essa regra não mede estoque, número de unidades, horário ou atendimento efetivo.

### Distância exploratória

A distância usa a fórmula de Haversine entre centroides municipais derivados da malha mínima do IBGE.

- zero indica presença observada no próprio município;
- valor positivo indica a menor distância geodésica entre centroides;
- não representa estrada, transporte público, barreira fluvial, tempo ou custo de viagem.

### Posição BNAFAR/Hórus

A consulta combina município e CATMAT com unidade de fornecimento. Da resposta:

1. identifica-se a maior `data_posicao_estoque`;
2. mantêm-se somente registros dessa data;
3. somam-se quantidades por CNES;
4. contam-se estabelecimentos únicos e registros zerados;
5. apresenta-se no máximo oito estabelecimentos, ordenados por quantidade.

Não são somadas posições de datas diferentes. Uma posição positiva não garante disponibilidade atual. Um resultado vazio pode representar ausência do item, ausência de transmissão, incompatibilidade de código ou cobertura incompleta.

### Compras públicas

Os indicadores selecionados do BPS usam apresentações equivalentes por CATMAT e unidade de fornecimento. Preço mediano, P10 e P90 descrevem os registros presentes no arquivo analisado e não constituem preço de mercado, teto regulatório ou estimativa causal.

### Mercado e Rename

O cruzamento usa o princípio ativo como nível conceitual. “Na Rename” indica presença normativa de pelo menos uma apresentação compatível; não garante aquisição ou oferta local.

“Mais vendido” segue as faixas de embalagens divulgadas pela CMED. Não corresponde a pacientes, prescrições, doses diárias ou consumo municipal.

## Qualidade e validação

O conjunto municipal é aceito quando:

- códigos IBGE têm sete dígitos e são únicos;
- existem 27 agregados de UF;
- contagens e distâncias não são negativas;
- municípios com presença observada têm distância zero na respectiva camada;
- totais municipais reconciliam com o metadado nacional;
- número de municípios e somas populacionais são internamente consistentes.

## Atualização

Cada reconstrução registra em `data/access-manifest.json`:

- momento UTC de geração;
- URL da fonte;
- arquivo local bruto;
- descrição da referência;
- tamanho em bytes;
- checksum SHA-256.

As datas de referência não são homogeneizadas artificialmente. Cada indicador deve ser lido com o período de sua fonte.

## Uso acadêmico

Resultados devem ser tratados como hipóteses e evidência descritiva. Inferência causal, avaliação de política ou comparação longitudinal exigem desenho próprio, controle de mudanças de cobertura e análise de sensibilidade.
