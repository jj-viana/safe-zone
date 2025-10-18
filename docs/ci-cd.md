# Pipeline CI/CD

Este documento descreve o fluxo de integração e entrega contínua configurado para o projeto, bem como os pré-requisitos para que o deploy em Azure aconteça com sucesso.

## Visão Geral
- **Validação em PR**: Toda Pull Request com destino para `development` executa lint/build do front-end (`web/`) e `dotnet test` da API (`api/`). Pull Requests para `main` também passam pela mesma validação, desde que a origem seja `development`.
- **Deploy e release automatizados**: Quando um PR de `development` para `main` é aprovado e mesclado, o workflow `Release Deploy` publica o front-end no Azure Static Web Apps e a API no Azure App Service. Em seguida, uma release é criada automaticamente no GitHub com um tag SemVer incremental.

## Workflows
| Arquivo | Objetivo | Gatilho |
| --- | --- | --- |
| `.github/workflows/pr-validation.yml` | Garante qualidade do código via lint/build (Next.js) e testes da API. | `pull_request` com destino em `development` ou `main` (apenas se a origem for `development`). |
| `.github/workflows/release-deploy.yml` | Faz login no Azure, publica os artefatos e gera release no GitHub. | `pull_request_target` quando um PR para `main` é mesclado e a origem é `development`. |

## Segredos Necessários
Configure os seguintes segredos nos **Repository Secrets** ou, preferencialmente, em **GitHub Environments**:

| Nome | Descrição |
| --- | --- |
| `AZURE_CLIENT_ID` | Client ID da identidade federada ou Service Principal com permissão nos recursos do Azure. |
| `AZURE_TENANT_ID` | Tenant ID do Azure AD. |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID onde os recursos foram provisionados. |
| `AZURE_RESOURCE_GROUP` | Resource Group do App Service. |
| `AZURE_WEBAPP_NAME` | Nome do Azure App Service que hospeda a API. |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Token de implantação do Azure Static Web Apps. |
| `AZURE_API_HEALTHCHECK_URL` *(opcional)* | Endpoint de health check da API para validação pós-deploy. |
| `AZURE_STATIC_WEB_APP_HEALTHCHECK_URL` *(opcional)* | URL pública da Static Web App para smoke test pós-deploy. |

> **Dica**: armazene segredos sensíveis em Azure Key Vault e referencie-os nas configurações do GitHub apenas quando necessário.

## Restrições de Branch
Para garantir que apenas `development` possa ser mesclada em `main`, configure proteção de branch no GitHub:
1. Vá em **Settings › Branches › Branch protection rules**.
2. Crie (ou edite) a regra para `main` com as opções:
   - **Require a pull request before merging** com *Require status checks to pass* incluindo `PR Validation`.
   - **Restrict who can push to matching branches** permitindo somente administradores/automação.
   - **Require branches to be up to date before merging** (opcional, mas recomendado).
3. Garanta que o time siga o fluxo `feature/*` → `development` → `main` descrito em `docs/conventions.md`.

## Troubleshooting
- Verifique se os arquivos `package-lock.json` e `api.sln` estão atualizados antes de abrir o PR.
- Falhas de deploy geralmente indicam permissões insuficientes (Azure) ou variáveis ausentes. Consulte os logs do job para detalhes.
- Releases são numeradas automaticamente (`vMAJOR.MINOR.PATCH`). Ajuste manualmente caso seja necessário um incremento diferente.
