# Política de segurança

## Versões cobertas

A versão publicada mais recente recebe correções de segurança. Versões anteriores são mantidas para referência, sem garantia de atualização.

## Como relatar

Não abra issue pública para vulnerabilidades, credenciais expostas ou caminhos que permitam abuso de serviços externos.

Use o recurso **Report a vulnerability** na aba Security do repositório:

https://github.com/pedropaulofernandes88-stack/farmaco-brasil/security/advisories/new

Inclua impacto, reprodução mínima e sugestão de mitigação. Não inclua dados pessoais reais.

## Escopo sensível

- validação e abuso da rota BNAFAR;
- exposição de dados descartados pelo proxy;
- injeção por parâmetros ou conteúdo de fonte externa;
- dependências comprometidas;
- segredos ou credenciais em código, build ou histórico;
- alteração indevida dos artefatos de dados.

O projeto não processa prontuários ou dados identificáveis de pacientes. Caso uma contribuição introduza essa necessidade, ela exige avaliação separada e não deve ser enviada diretamente.
