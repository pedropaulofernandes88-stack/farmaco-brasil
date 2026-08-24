# Limitações

## Cadastro não é oferta

O CNES descreve estabelecimentos cadastrados. Um registro ativo do tipo 43 não confirma:

- funcionamento no momento da consulta;
- vínculo operacional com o SUS;
- atendimento ao público;
- horário;
- elenco de medicamentos;
- estoque ou dispensação.

## Cobertura PFPB observada

A classificação deriva do Anexo I de vagas do credenciamento e é uma inferência. Município classificado com cobertura observada pode não ter estoque do produto, unidade próxima ou atendimento disponível.

## Posição BNAFAR/Hórus

A API pública fornece posições declaradas e datadas. A cobertura pode variar entre entes, estabelecimentos, sistemas e produtos. Portanto:

- quantidade positiva não garante disponibilidade atual;
- quantidade zero pode representar ruptura ou condição do registro naquela data;
- ausência de resposta não equivale a estoque zero;
- a página consultada pode atingir o limite de 1.000 registros;
- agregações não medem pacientes atendidos nem dispensação;
- o projeto não avalia a completude nacional da base.

## Distância

As distâncias são calculadas em linha reta entre centroides municipais. Não incorporam:

- rede rodoviária;
- rios, balsas ou relevo;
- transporte público;
- endereço da residência;
- endereço exato do ponto de atendimento;
- tempo e custo da viagem.

Devem ser usadas para triagem territorial, não planejamento individual de deslocamento.

## Mercado farmacêutico

Dados CMED divulgados nacionalmente não permitem atribuir vendas a estados ou municípios. Faixas de embalagens não representam número de pacientes, prevalência, prescrição ou adesão.

## Rename

Presença na Rename é normativa. Apresentações, componentes de financiamento e protocolos precisam ser avaliados separadamente. A classificação não comprova compra, estoque ou dispensação local.

## Compras públicas

Registros do BPS refletem compras informadas. Diferenças podem decorrer de apresentação, unidade, modalidade, volume, data, impostos, logística e qualidade do registro. Comparações não constituem estimativas causais.

## Temporalidade

As fontes possuem datas de referência diferentes. A ferramenta preserva essas datas, mas não elimina o risco de comparação entre períodos não coincidentes.

## Uso inadequado

O painel não deve ser usado para:

- automedicação;
- prescrição;
- substituição de aconselhamento profissional;
- garantia de retirada de medicamento;
- decisão clínica individual;
- identificação de pessoas.

## Agenda de validação

Antes de uso decisório, recomenda-se validação com gestores e serviços locais, teste de completude, análise de sensibilidade das regras de cobertura e confronto com dados independentes.
