## CI/CD — Workflows do GitHub Actions (Web + API)

Este documento descreve como funciona o nosso CI/CD, o que cada workflow faz, os pré-requisitos (Azure, segredos e permissões), e o passo a passo de configuração.

---

## Visão geral

- Integração Contínua (CI): valida PRs com build e qualidade do front-end (Next.js) e build + testes da API (.NET).
- Entrega Contínua (CD): a cada push em `main`, constrói artefatos, faz login no Azure via OIDC, publica o front-end no Azure Static Web Apps (SWA), publica a API no Azure App Service e cria uma release com tag SemVer automática (patch incrementado).

Workflows:

- `.github/workflows/pr-validation.yml` — PR Validation (CI)
- `.github/workflows/release-deploy.yml` — Release Deploy (CD)

Branches (conforme convenções):

- `development`: base para PRs de feature/fix/chore.
- `main`: produção (imutável, protegida). Merge de `development` → `main` dispara deploy.

---

## PR Validation (CI)

Arquivo: `.github/workflows/pr-validation.yml`

Disparo:

- Em PRs cujo destino é `development`.
- Em PRs cujo destino é `main` e origem é `development` (garante que apenas merge de `development` para `main` seja validado aqui).

Jobs e etapas:

1) Job `web` — Web Quality Checks

- Runner: `ubuntu-latest`
- Working dir: `web/`
- Node.js: 20 (`actions/setup-node@v4` com cache de npm)
- Passos:
	- Checkout
	- `npm ci` (instala dependências)
	- `npm run lint`
	- `npm run build`

2) Job `api` — API Build and Tests

- Runner: `ubuntu-latest`
- .NET: 9.0 (`actions/setup-dotnet@v4`)
- Variáveis de ambiente para otimização do CLI .NET
- Passos:
	- Checkout
	- `dotnet restore api/api.sln`
	- `dotnet build api/api.sln --configuration Release --no-restore`
	- Verifica segredos do Cosmos DB (`TEST_COSMOS_CONNECTION_STRING`, etc.)
	- `dotnet test api/api.sln --configuration Release --no-build --verbosity normal`

Resultado esperado:

- PRs só podem ser mergeados após lint + build do `web/` e build + testes do `api/` passarem. Isso reduz regressões e mantém a qualidade antes de chegar na branch `main`.

---

## Release Deploy (CD)

Arquivo: `.github/workflows/release-deploy.yml`

Disparo:

- `push` na branch `main` (merge de release) com filtros de path (`web/**`, `api/**`, `tests/**`, workflow file) e manual via `workflow_dispatch`.

Permissões do job:

- `id-token: write` (requerido para OIDC com Azure)
- `contents: write` (para criar release e tag)

O que o pipeline faz:

1) Detecção de mudanças

- Verifica se houve alterações em `web/` ou `api/` (incluindo `tests/`) para executar apenas os jobs necessários.

2) Build do front-end (se houver mudanças em `web/`)

- Node.js 20
- `npm ci` em `web/`
- Injeta variáveis de ambiente de build:
    - `NEXT_PUBLIC_API_BASE_URL`
    - `NEXT_PUBLIC_AZURE_TENANT_ID`
    - `NEXT_PUBLIC_AZURE_CLIENT_ID`
    - `NEXT_PUBLIC_AZURE_REDIRECT_URI`
    - `NEXT_PUBLIC_AZURE_API_SCOPES`
    - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `npm run build` (gera `.next`)

3) Build/Publish da API (se houver mudanças em `api/`)

- .NET 9.0
- Verifica presença dos segredos de teste do Cosmos DB
- `dotnet restore api/api.sln`
- `dotnet publish api/api.csproj -c Release -o publish/api`

4) Login no Azure com OIDC

- `azure/login@v2` usando `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`

5) Deploy do front-end (SWA) (se `web` mudou)

- `Azure/static-web-apps-deploy@v1`
- Publica artefatos de `web/.next` para o Azure Static Web Apps
- Usa token de implantação do SWA (`AZURE_STATIC_WEB_APPS_API_TOKEN`)

6) Deploy da API (App Service) (se `api` mudou)

- `azure/webapps-deploy@v3`
- Publica pasta `publish/api` no App Service (`app-name` e `resource-group-name` do segredo)

7) Health checks (opcional)

- Se configurados, valida URLs de saúde do front-end e da API (5 tentativas com backoff)

8) Release e tag SemVer automática

- Determina a próxima tag (`vX.Y.Z`) incrementando `PATCH` da última tag existente (ou inicia em `v0.1.0`)
- Cria release no GitHub com `softprops/action-gh-release@v1`

---

## Pré-requisitos

### Recursos no Azure

- Azure Static Web Apps (SWA) para hospedar o front-end SSR do Next.js.
- Azure App Service (Linux) para hospedar a API .NET.
- Resource Group contendo os recursos acima.

### Identidade e Acesso (OIDC)

- Um App Registration (Microsoft Entra) com Service Principal para OIDC.
- Federated Credentials configuradas para o repositório/branch (`main`) usado no deploy.
- RBAC mínimo:
	- Para App Service: `Website Contributor` no recurso da WebApp OU `Contributor` no Resource Group.
	- Para cenários simples, `Contributor` no RG garante permissões de deploy.

### Segredos no GitHub (Repository Secrets)

Obrigatórios para deploy e build:

- `AZURE_CLIENT_ID` — Client ID do App Registration (OIDC)
- `AZURE_TENANT_ID` — Tenant ID (OIDC)
- `AZURE_SUBSCRIPTION_ID` — Subscription ID (OIDC)
- `AZURE_RESOURCE_GROUP` — Nome do Resource Group onde está a WebApp
- `AZURE_WEBAPP_NAME` — Nome do App Service (API)
- `AZURE_STATIC_WEB_APPS_API_TOKEN` — Token de implantação do SWA
- `NEXT_PUBLIC_API_BASE_URL` — Base URL da API usada pelo Next (ex.: `https://<app>.azurewebsites.net`)
- `NEXT_PUBLIC_AZURE_TENANT_ID` — Tenant ID para autenticação no front-end
- `NEXT_PUBLIC_AZURE_CLIENT_ID` — Client ID para autenticação no front-end
- `NEXT_PUBLIC_AZURE_REDIRECT_URI` — Redirect URI para autenticação
- `NEXT_PUBLIC_AZURE_API_SCOPES` — Scopes da API
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — Chave do ReCaptcha

Obrigatórios para testes (CI e CD check):

- `TEST_COSMOS_CONNECTION_STRING` — Connection string do Cosmos DB para testes
- `TEST_COSMOS_DATABASE_ID` — ID do banco de dados de teste
- `TEST_COSMOS_CONTAINER_ID` — ID do container de teste

Opcionais (para health check pós-deploy):

- `AZURE_API_HEALTHCHECK_URL` — URL de health da API (ex.: `https://<webapp>.azurewebsites.net`)
- `AZURE_STATIC_WEB_APP_HEALTHCHECK_URL` — URL do site do SWA (ex.: `https://<swa>.azurestaticapps.net`)

Permissões do repositório:

- “Workflow permissions” com acesso de conteúdo `read and write`. O workflow já declara `permissions` no job, mas se houver políticas restritivas, habilite em Settings → Actions → General.

### Estrutura e scripts

- `web/` com `package.json` contendo scripts `lint` e `build` compatíveis com Node 20.
- `api/` com solução `.sln` e projeto `.csproj` compiláveis em .NET 9; testes rodando em `dotnet test`.

---

## Passo a passo de configuração

1) Criar recursos no Azure

- Crie um Resource Group (ex.: `rg-unb-safe-zone`).
- Crie um Azure App Service (Linux) para .NET (Runtime .NET 8/9; o deploy por publish cuida do host). Anote o `app name`.
- Crie um Azure Static Web Apps para o front-end (qualquer plano aplicável). Anote o token de deployment.

2) Configurar identidade OIDC (recomendado)

- Crie um App Registration (Microsoft Entra) com Service Principal.
- Conceda RBAC no Resource Group ou no recurso da WebApp.
- Adicione Federated Credentials para o repositório:
	- Entity type: `Branch`
	- Branch: `main`
	- Audience: `api://AzureADTokenExchange`

3) Obter o Deployment Token do SWA

- No recurso do SWA, acesse “Manage deployment token”, copie o token e salve como segredo `AZURE_STATIC_WEB_APPS_API_TOKEN` no GitHub.

4) Criar os segredos no GitHub

- Em Settings → Security → Secrets and variables → Actions → New repository secret, crie:
	- `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
	- `AZURE_RESOURCE_GROUP`, `AZURE_WEBAPP_NAME`
	- `AZURE_STATIC_WEB_APPS_API_TOKEN`
	- `NEXT_PUBLIC_API_BASE_URL`
	- `NEXT_PUBLIC_AZURE_TENANT_ID`, `NEXT_PUBLIC_AZURE_CLIENT_ID`
	- `NEXT_PUBLIC_AZURE_REDIRECT_URI`, `NEXT_PUBLIC_AZURE_API_SCOPES`
	- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
	- `TEST_COSMOS_CONNECTION_STRING`, `TEST_COSMOS_DATABASE_ID`, `TEST_COSMOS_CONTAINER_ID`
	- (opcional) `AZURE_API_HEALTHCHECK_URL`, `AZURE_STATIC_WEB_APP_HEALTHCHECK_URL`

5) Verificar configurações do projeto

- `web/staticwebapp.config.json` presente e adequado às rotas/headers.
- `web/next.config.ts` e build `npm run build` funcionando localmente com Node 20.
- `api/` compila e testa localmente com .NET 9.

6) Fluxo de uso

- Abra PRs para `development`. O workflow de validação executa lint/build (web) e build/testes (.NET).
- Após aprovações, faça merge de `development` → `main`. O workflow de release executa o deploy no Azure e cria uma release com tag SemVer (auto `PATCH`).

---

## Versionamento e tags (SemVer)

- A release cria uma tag automática incrementando o `PATCH` da última tag compatível (`vX.Y.Z`).
- Se não existir tag, começamos em `v0.1.0`.
- Para mudanças `MINOR` ou `MAJOR`, crie manualmente a tag desejada antes do merge ou ajuste o processo (ex.: usar uma ação de conventional commits/semver). Conforme convenções, mantenha a disciplina de tags no `main`.

---

## Troubleshooting

Login no Azure (OIDC) falha

- Confirme `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.
- Verifique se há Federated Credential para o repositório/branch `main`.
- Garanta RBAC suficiente (mínimo `Website Contributor` na WebApp ou `Contributor` no RG).

Erro no deploy do SWA

- Verifique `AZURE_STATIC_WEB_APPS_API_TOKEN` e se ele corresponde ao SWA correto.
- Confira `app_location` (`web`), `app_artifact_location` (`web/.next`) e `skip_app_build: true` (o build já ocorreu antes).

Erro no deploy do App Service

- Verifique `AZURE_WEBAPP_NAME` e `AZURE_RESOURCE_GROUP`.
- Confirme permissões RBAC para o Service Principal.
- Veja logs de `azure/webapps-deploy@v3` e o Log Stream do App Service.

Falhas de build/lint no `web/`

- Garanta Node 20 em ambiente local e compatibilidade de deps.
- Rode `npm ci && npm run lint && npm run build` localmente para reproduzir.

Testes .NET falhando

- Execute localmente `dotnet restore && dotnet build && dotnet test` em `api/` para isolar.

Health check falha

- Revise URLs e endpoints. Considere expor `/health` na API e usar a URL pública do SWA para o front-end.

Conflito de tag na release

- Se a tag calculada já existir, ajuste manualmente as tags (apague a antiga ou crie uma nova versão coerente) e re-dispare o workflow.

---

## Resumo do fluxo

- Dev abre PR → CI valida (`web` lint/build e `api` build/test).
- Merge `development` → `main` → CD executa deploy no SWA + App Service, roda health checks e cria release com tag SemVer.