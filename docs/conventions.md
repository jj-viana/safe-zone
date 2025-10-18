# Convenções de Desenvolvimento

Este documento define padrões e boas práticas para desenvolvimento do projeto, cobrindo frontend (Next.js/React/Tailwind), servidor web com Next.js (deploy em Azure Static Web Apps), APIs em C#/.NET (deploy em Azure App Service), banco de dados (Azure Cosmos DB), e infraestrutura (serviços gerenciados em Azure), além de fluxo Git, nomenclaturas, idioma e qualidade.

## Sumário
- [Objetivos e Escopo](#objetivos-e-escopo)
- [Estrutura de Pastas do Repositório](#estrutura-de-pastas-do-repositório)
- [Idioma do Código e Commits](#idioma-do-código-e-commits)
- [Comentários](#comentários)
- [Fluxo de Git e Versionamento](#fluxo-de-git-e-versionamento)
  - [Branches](#branches)
  - [Commits](#commits)
  - [Versionamento (SemVer)](#versionamento-semver)
- [Nomenclatura](#nomenclatura)
  - [Arquivos e Pastas](#arquivos-e-pastas)
  - [Variáveis e Constantes (JS)](#variáveis-e-constantes-js)
  - [Funções](#funções)
- [Web: Next.js, React e Tailwind](#web-nextjs-react-e-tailwind)
  - [Next.js (App Router, SSR/SSG/ISR)](#nextjs-app-router-ssrssgisr)
  - [React (componentes, hooks, estado)](#react-componentes-hooks-estado)
  - [Tailwind CSS](#tailwind-css)
- [Web: Next.js em Azure Static Web Apps (SSR/Proxy para API .NET)](#web-nextjs-em-azure-static-web-apps-ssrproxy-para-api-net)
- [APIs: C#/.NET](#apis-cnet)
  - [Estrutura de Pastas](#estrutura-de-pastas)
  - [Padrões de Código](#padrões-de-código)
  - [Boas Práticas de API](#boas-práticas-de-api)
- [Banco de Dados: Azure Cosmos DB](#banco-de-dados-azure-cosmos-db)
  - [Nomenclatura](#nomenclatura-1)
  - [Migrations e Seeds](#migrations-e-seeds)
  - [Boas Práticas SQL](#boas-práticas-sql)
- [Infraestrutura: Azure](#infraestrutura-azure)
  - [Padrões Gerais](#padrões-gerais)
- [Qualidade: Lint, Formatação, Testes e Hooks](#qualidade-lint-formatação-testes-e-hooks)
  - [Lint e Formatação](#lint-e-formatação)
  - [Testes](#testes)
  - [Hooks](#hooks)
- [Segurança e Configurações](#segurança-e-configurações)
- [Documentação](#documentação)

---

## Objetivos e Escopo
- Padronizar o código e o fluxo de trabalho para aumentar legibilidade, qualidade e velocidade de entrega.
- Reduzir retrabalho, conflitos e divergências entre equipes.
- Cobrir o ciclo de desenvolvimento: codificação, revisão, integração, deploy e documentação.

## Estrutura de Pastas do Repositório
A estrutura padrão do repositório é a seguinte. Use-a como referência para onde criar arquivos e como organizar módulos:

```
.
├─ docs/                      # diagramas, decisões (ADRs) e notas
│  ├─ conventions.md
├─ web/                       # Next.js (App Router) + Tailwind
│  ├─ app/
│  ├─ components/
│  ├─ features/
│  ├─ lib/
│  ├─ public/
│  ├─ styles/
│  ├─ middleware.ts
│  ├─ next.config.mjs
│  ├─ package.json
│  ├─ staticwebapp.config.json
│  ├─ jest.config.ts
│  └─ playwright.config.ts
├─ api/                       # .NET 9 (App Service)
│  ├─ src/
│  │  ├─ Controllers/
│  │  ├─ Services/
│  │  ├─ Middleware/
│  │  ├─ Configuration/
│  │  ├─ Models/
│  │  ├─ Interface/
│  │  ├─ Validators/          # opcional (FluentValidation)
│  │  ├─ Program.cs
│  │  └─ Api.csproj
│  └─ tests/
│     ├─ Unit/
│     ├─ Integration/
│     ├─ Contract/
│     └─ Api.Tests.csproj
├─ .github/
│  └─ workflows/
│     ├─ web-swa.yml          # build/deploy SWA (Next SSR)
│     └─ api-appservice.yml   # build/test/deploy API com slot
├─ .vscode/
│  ├─ extensions.json
│  ├─ settings.json
│  ├─ launch.json             # debug API
│  └─ tasks.json
├─ .editorconfig
├─ .gitattributes
├─ .gitignore
├─ .husky/                    # hooks (com lint-staged/commitlint)
├─ package.json               # se usar workspaces para utilitários JS compartilhados
├─ commitlint.config.cjs
├─ README.md
└─ .env.example               # sem segredos (variáveis padrão)
```

Notas:
- O front-end fica em `web/`. O back-end (.NET) fica em `api/` com `src/` e `tests/` separados.
- Documentação adicional (diagramas, ADRs) fica em `docs/architecture/`.
- Pipelines vivem em `.github/workflows/` com nomes padronizados: `web-swa.yml` e `api-appservice.yml`.
- Arquivos de configuração do VS Code estão em `.vscode/`. Use-os para depuração da API e tarefas comuns.
- Use `.env.example` como referência das variáveis necessárias; não comitar `.env` com segredos.

## Idioma do Código e Commits
- Código e identificadores: devem ser escritos em inglês. Inclui nomes de arquivos e pastas, variáveis, funções, classes, enums, constantes, interfaces/tipos, chaves de objetos/JSON, rotas, nomes de migrations, além de nomes de branches e tags.
- Documentação do projeto: deve ser escrita em português (ex.: `README`, arquivos em `docs/` e guias).
- Comentários podem ser escritos em português.
- Commits: a mensagem de commit (título, corpo e rodapé) pode ser em português, mantendo o padrão de Commits para o tipo (em inglês) e, preferencialmente, o escopo alinhado ao nome do módulo em inglês.
  - Ex.: `feat(api): adiciona rota de login` (tipo/scope em inglês; resumo em português).
  - Corpo do commit: pode detalhar em português; referencie issues quando aplicável.

## Comentários
  - JavaScript/Node.js: use `//` (linha) ou `/* ... */` (bloco). Para funções públicas/módulos, prefira JSDoc `/** ... */` com descrições em português.
  - SQL (Cosmos DB consultas / scripts auxiliares): `--` (linha) e `/* ... */` (bloco) quando aplicável a consultas analíticas exportadas.
  - YAML (pipelines ou manifests IaC): `#`.
  - HTML/CSS: `<!-- ... -->` (HTML) e `/* ... */` (CSS).
- Diretrizes gerais:
  - Explique o porquê nos comentários; evite comentar o óbvio.
  - Mantenha comentários atualizados; remova os obsoletos.
  - Use `TODO:` e `FIXME:` com referência (ex.: `TODO: tratar erro X - #123`).
  - Comentários de função: escreva um comentário geral acima do nome da função explicando claramente o que ela faz, seus parâmetros, retorno e efeitos colaterais. Evite comentários de linha dispersos; prefira um bloco de comentário por função. Em JavaScript/Node.js, utilize JSDoc (`/** ... */`).

Exemplo (comentário em português; código e identificadores em inglês):

```js
/**
 * Cria um novo usuário no sistema.
 * @param {Object} payload - Dados do usuário.
 * @param {string} payload.email - E-mail do usuário.
 * @param {string} payload.password - Senha em texto plano (será hasheada).
 * @returns {Promise<User>} Usuário criado.
 * @throws {ValidationError} Quando os dados são inválidos.
 */
async function createUser(payload) {
  ...
}
```

## Fluxo de Git e Versionamento
### Branches
- `main`: produção (imutável, protegida).
- `development`: integração contínua de features (base para PRs de feature).
- `feature/<short-description>`: novas funcionalidades. Ex.: `feature/oauth-authentication`.
- `fix/<short-description>`: correções de bugs. Ex.: `fix/db-timeout-error`.
- `chore/<short-description>`: tarefas de manutenção (deps, configs, etc.).
- `docs/<short-description>`: documentação (sem alterar código de produto).

Regras:
- Sempre criar branch a partir de `development`.
- Abrir PR de `feature/*` → `development`. Releases são mescladas de `development` → `main`.
- Branches protegidas: exigem revisão, checks e histórico linear.

### Commits
Formato:
```
<type>[optional scope]!: <short summary>

[body]
```

Tipos comuns: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
Ex.: `feat(api): adiciona rota de login`.

### Versionamento (SemVer)
- Utilizar SemVer no formato `MAJOR.MINOR.PATCH` (ex.: `v1.4.2`).
- Criar tags de release na branch `main`: `git tag vX.Y.Z && git push --tags`.
- Incrementos:
  - `MAJOR`: mudanças incompatíveis com versões anteriores (breaking changes).
  - `MINOR`: novas funcionalidades retrocompatíveis.
  - `PATCH`: correções e pequenas melhorias sem quebra.

---

## Nomenclatura
### Arquivos e Pastas
- Pastas: `kebab-case`. Ex.: `user-profile`, `data-access`.
- Arquivos: `kebab-case`. Ex.: `user-service.js`.
- SQL/Migrations: `YYYYMMDDHHMMSS_description.sql`. Ex.: `20250920150000_create_users.sql`.

### Variáveis e Constantes (JS)
- Variáveis e funções: `camelCase`. Ex.: `totalPrice`, `getUserById`.
- Classes/Construtores: `PascalCase`. Ex.: `UserService`.
- Constantes: `UPPER_SNAKE_CASE`. Ex.: `MAX_RETRY_COUNT`.
- Seletores CSS: `kebab-case` com BEM (ver seção [CSS](#css)).

### Funções
- Nomear com verbo de ação claro: `createUser`, `validateToken`, `formatDate`.
- Funções puras preferidas para utilitários; side effects isolados em serviços/camadas apropriadas.

 

## Web: Next.js, React e Tailwind
Esta define os padrões para o front-end com Next.js (App Router), React e Tailwind CSS. HTML e CSS puros podem ser usados pontualmente, mas a base deve ser componentes React com utilitários Tailwind.

### Next.js (App Router, SSR/SSG/ISR)
- App Router (`/app`). Preferir Server Components; usar Client Components quando houver interação de estado ou efeitos do browser.
- Data fetching: usar `fetch` no servidor com opções de cache/revalidate, ou `Route Handlers` quando for preciso compor dados. Nunca replicar regra de negócio — sempre chamar a API .NET.
- Estratégias de renderização:
  - SSR: páginas com dados sensíveis ao usuário ou variáveis por request.
  - SSG: conteúdo estático por build.
  - ISR: páginas estáticas com revalidação (`revalidate: <segundos>`).
- Rotas e organização sugeridas:
  - `app/(public)/...` para rotas públicas; `app/(private)/...` para áreas autenticadas.
  - `app/api/*` reservado para handlers utilitários do próprio Next apenas quando necessário (não substituir a API .NET).
  - `lib/` para helpers de fetch, schemas de validação, utilitários puros.
  - `components/` para UI reutilizável; `features/<domínio>/` para componentes orientados a casos de uso.
- Integração com API .NET: preferir proxy via rewrites do Next para `/api/v1/*` (ver seção de servidor/proxy), evitando CORS no browser. Alternative: usar `API_BASE_URL` apenas quando o proxy não for possível.

### React (componentes, hooks, estado)
- Componentes funcionais com hooks; evitar classes.
- Estado: preferir `useState`/`useReducer` local. Para dados do servidor, considerar `SWR` ou `TanStack Query` quando houver cache/reatividade; no básico, `fetch` em Server Components ou `useEffect` em Client Components.
- Padrões de composição: components pequenos, semânticos, com props tipadas. Evitar lógica de negócio; apenas orquestração de UI e chamadas à API.
- Acessibilidade: utilizar atributos `aria-*`, `role` e semântica HTML dentro dos componentes. Testar com React Testing Library.
- Convenções:
  - Nomes de componentes: `PascalCase`.
  - Nomes de hooks: `useXxx`.
  - Evitar estado global até haver necessidade concreta; se necessário, `Context` leve por domínio.

### Tailwind CSS
- Configuração: `tailwind.config.{js,ts}` com preset corporativo quando aplicável. Manter tokens no `theme.extend` (cores, spacing, fontSize).
- Estilo: utilitário-first. Evitar CSS global; preferir classes Tailwind. Quando estilos se repetirem, usar `@apply` em `globals.css` ou criar componentes estilizados.
- Nomeação: classes utilitárias do Tailwind substituem BEM. Quando usar CSS modular, preferir nomes semânticos curtos em `*.module.css`.
- Plugins recomendados: `@tailwindcss/forms`, `@tailwindcss/typography`, `eslint-plugin-tailwindcss` para lint de classes.

Estrutura sugerida (web):
```
web/
  app/
    layout.tsx
    page.tsx
    (public)/...
    (private)/...
  components/
  features/
  lib/
  public/
  styles/
    globals.css
  middleware.ts
  next.config.mjs
  package.json
```

## Web: Next.js em Azure Static Web Apps (SSR/Proxy para API .NET)
Next.js é responsável por SSR/SSG/ISR, servir estáticos e orquestrar chamadas à API em C#/.NET. O deploy será feito em Azure Static Web Apps (SWA) com suporte a SSR via Functions gerenciada. Não há regra de negócio no Next — toda regra permanece nos `Services/` da API.

### Responsabilidades do servidor Next.js
- Renderização SSR/SSG/ISR e entrega de assets.
- Integração com backend .NET: chamadas server-side (SSR/Route Handlers) usando `process.env.API_BASE_URL` para evitar CORS; chamadas client-side usando `API_BASE_URL` com CORS habilitado na API.
- Observabilidade mínima: gerar/propagar `x-correlation-id` e logging de acesso (via middleware ou integração Application Insights no App Service).
- Headers de segurança (CSP, no-store quando necessário). Em produção, manter HTTPS-only.

### Configuração sugerida
- SWA config: utilizar `staticwebapp.config.json` (de preferência gerado pelo SWA CLI) para rotas, fallback e headers globais (CSP, HSTS, cache). Evitar criar manualmente sem `swa init`.
- Middleware Next: `middleware.ts` pode garantir `x-correlation-id` (gera se ausente) e passar adiante para a API via header.
- Variáveis de ambiente: definir em Azure Static Web Apps (Configuration). Privadas: `API_BASE_URL`; públicas: `NEXT_PUBLIC_*`. Evitar `.env` commitado; fornecer `.env.example` sem segredos.

### Boas Práticas
- Nunca expor chaves/segredos — usar App Settings/Key Vault.
- Não criar rotas `app/api/*` para regras de negócio; use somente para adaptações pontuais da UI.
- Tratar indisponibilidade da API com mensagens amigáveis e status adequados (ex.: 503) na UI.

---

## APIs: C#/.NET
As APIs de negócio serão desenvolvidas em C# utilizando .NET 9. O design segue princípios de Clean Architecture e RESTful.

### Estrutura de Pastas (Organização Adotada)
```
src/
  Controllers/      # Endpoints HTTP (Controllers ou Minimal Handlers agrupados)
  Services/         # Regras de negócio, orquestração, validações, integrações
  Middleware/       # Componentes de pipeline (logging, error handling, correlation)
  Configuration/    # Extensões e registro de serviços (ex: Cosmos, Auth, Swagger)
  Models/           # Modelos de domínio simplificados, DTOs (request/response), payloads externos
  Interface/        # Interfaces de serviços, ports, abstrações para infraestrutura
```

Tests:
```
tests/
  Unit/             # Testes de serviços isolados (mocks/stubs)
  Integration/      # Testes com servidor em memória / Cosmos emulador
  Contract/         # Validação de OpenAPI / compatibilidade
```

Notas:
- Qualquer lógica de persistência (ex.: chamadas ao SDK do Cosmos) residirá em Services ou em adaptadores específicos dentro de `Services/` (ex.: `Services/Data/`), desde que mantendo separação clara de responsabilidades.
- Evitar proliferar pastas; somente criar subpastas quando volume de arquivos justificar.

### Convenções de Código C#
- Nomes de namespaces: `Company.Project.Context` (PascalCase).
- Classes, interfaces, enums: `PascalCase` (interfaces com prefixo `I`, manter consistente).
- Métodos e propriedades: `PascalCase`.
- Campos privados: `_camelCase`.
- Variáveis locais e parâmetros: `camelCase`.
- Constantes: `PascalCase`.
- Async: sufixar métodos async com `Async` (`GetUserAsync`).
- Imutabilidade preferida em value objects.

### Organização de Pastas na API
- `Controllers/`: Pontos de entrada HTTP. Apenas coordenação (chama service, traduz resultado). Sem regra de negócio.
- `Services/`: Lógica de negócio, orquestração, acesso a Cosmos (direto ou via helper), integrações externas.
- `Middleware/`: Pipeline transversal (erro, logging, correlation-id, auth adicional se necessário).
- `Configuration/`: Extensões estáticas (`IServiceCollection`, `WebApplicationBuilder`) para registro modular.
- `Models/`: DTOs de entrada/saída, modelos de integração, record structs e tipos value simples.
- `Interface/`: Interfaces e abstrações (ex.: `IUserService`, `ICosmosUserRepository`), sem DTOs.
- (Opcional) `Mappings/`: Perfis AutoMapper ou mapeamentos manuais concentrados.
- (Opcional) `Validators/`: Classes FluentValidation se volume justificar separar de Services.

Decisões:
- Evitar controllers “gordos”: regra sempre em Services.
- Preferir retorno uniforme (ex.: `Result<T>` ou ProblemDetails) convertendo no controller.
- Criar subpastas em `Services/` por domínio funcional apenas após 3+ arquivos relacionados.

### Padrões REST e Versão
- Prefixo: `/api/v1`.
- Usar substantivos plurais (`/users`, `/orders/{id}`), relacionamentos em sub-recursos (`/users/{id}/roles`).
- Códigos de status: 200 OK, 201 Created (com `Location`), 204 No Content para deleção/updates sem body, 400 validação, 404 não encontrado, 409 conflitos de estado, 422 regras de domínio, 500 erros não tratados.

### Validação
- FluentValidation em nível de DTO de entrada.
- Erros retornam payload padronizado:
```json
{
  "traceId": "<id>",
  "errors": [ { "field": "email", "message": "Email inválido" } ]
}
```

### Tratamento de Erros
- Middleware global captura exceções e converte em resposta estruturada.
- Exceções de domínio específicas (ex.: `DomainException`) resultam em 422.

### Logging e Observabilidade
- `ILogger<T>` para logging contextual.
- Correlation/Trace Id via header `x-correlation-id` (gerar se ausente).
- Telemetria: Application Insights (traces, métricas, dependências, requests).

### Acesso a Dados (Cosmos DB)
- Repositórios assíncronos usando SDK oficial.
- Operações idempotentes quando aplicável.
- Otimizar partição e índice (ver seção Cosmos DB).

### Testes
- Unit: testar `Services/` isolando dependências (mocks de interfaces em `Interface/`). DTOs referenciados de `Models/`.
- Integration: `WebApplicationFactory` cobrindo fluxo completo e Cosmos (emulador ou conta isolada).
- Contract: snapshot/schema OpenAPI para detectar breaking changes em endpoints públicos.

### Documentação e Contratos
- OpenAPI gerado automaticamente (`/swagger` em ambiente de dev/test).
- Versionamento de contratos via múltiplos grupos se necessário (`v1`, `v2`).

### Boas Práticas Gerais
- Fail fast em configuração inválida (lançar na inicialização).
- Evitar lógica em Controllers — delegar sempre a Services.
- Retornar tipos `Result<T>` ou ProblemDetails para consistência.

---

## Banco de Dados: Azure Cosmos DB
### Modelo e Organização
- API alvo: `Core (SQL)`.
- Cada agregado principal do domínio deve corresponder a um container quando justificável por padrão de acesso. Evitar proliferar containers — custo e throughput fragmentam.
- Consolidar entidades com forte relação de acesso em um mesmo container usando `type` (discriminador) quando leitura conjunta for frequente.

### Nomenclatura
- Database: `app-core` (kebab-case; usar sufixos por ambiente: `app-core-dev`, `app-core-stg`, `app-core-prd`).
- Containers: `kebab-case` singular ou plural coerente (manter consistente). Ex.: `users`, `orders`, `audit-logs`.
- Propriedades JSON: `camelCase` (alinhado ao C# via `JsonNamingPolicy.CamelCase`).
- Discriminador de tipo (quando multi-modelo no container): campo `type` com valores `user`, `order`, etc.

### Particionamento
- Definir `partitionKey` visando distribuição uniforme e padrões de consulta conhecidos.
- Preferir chaves de alta cardinalidade e acesso balanceado: exemplos: `/userId`, `/tenantId`.
- Evitar partição baseada em status ou datas que concentrem carga (`/status`).
- Para entidades raiz (ex.: usuários) usar o próprio `id` como partição quando acesso primariamente for por id (`/id`).

### Indexação
- Usar política automática inicialmente; otimizar removendo paths não usados para reduzir RU.
- Remover indexação de campos grandes (ex.: descrições longas) se não houver busca por eles.
- Indexação consistente para campos de filtros/paginação (`createdAt`, `email`).

### Consistência
- Nível padrão: Session (equilíbrio entre performance e garantia por usuário autenticado).
- Elevar para Strong somente quando requisito crítico de leitura imediata após escrita (custo maior). Avaliar por caso.

### Versionamento e Evolução de Esquema
- Itens são flexíveis — adicionar novos campos sem migração.
- Remover campos somente após período de compatibilidade (feature flag de leitura tolerante).
- Manter testes de contrato para validar forma mínima esperada do documento.

### Acesso e Repositórios
- Abstrair acesso via repositórios ou `IDocumentStore` central.
- Operações de leitura usando `QueryDefinition` parametrizada para evitar injeção.
- Paginação com `ContinuationToken` — encapsular em serviço utilitário.

### Custos e Throughput
- Preferir autoscale (picos imprevisíveis) em ambientes produtivos.
- Monitorar RU/s consumidas e identificar queries com `cross-partition` excessivo — ajustar partição ou adicionar campos de filtro.
- Agregar métricas no Application Insights (dependências Cosmos).

### Segurança
- Nunca expor a Primary Key.
- Segregar permissões; mínimo necessário para ambientes de teste.

### Anti-padrões a Evitar
- Container para cada entidade pequena sem necessidade de isolamento.
- Queries `SELECT *` sem projeção — aumenta RU.
- Partição que concentra >70% do tráfego.
- Uso de Strong Consistency global sem necessidade real.

---

## Infraestrutura: Azure
A aplicação é implantada inteiramente em serviços gerenciados Azure. Infra como código (futuro) poderá usar Bicep ou Terraform.

### Serviços Principais
- Azure Static Web Apps para hospedar: 
  - Next.js (SSR/SSG/ISR com Functions gerenciada pelo SWA)
- Azure App Service para hospedar:
  - APIs .NET (separar em apps distintas conforme domínios)
- Azure Cosmos DB (Core SQL) para persistência.
- Azure Key Vault para segredos e chaves.
- Azure Application Insights para telemetria e Logs para observabilidade.

### Ambientes
- `dev`, `stg`, `prd` — isolamento por Resource Group.
- Nome de Resource Group: `rg-app-<env>` (ex.: `rg-app-dev`).
- Nome de Static Web App: `swa-web-next-<env>` (Next.js).
- Nome de App Service: `app-api-core-<env>` (.NET).
- Cosmos DB: `cosmos-app-core-<env>`.
- Key Vault: `kv-app-core-<env>`.

### Naming Guidelines (Geral)
- Seguir padrão: `<context>-<role>-<env>`.
- Usar somente minúsculas e hifens onde o recurso permitir.

### Configuração e Segredos
- Variáveis de aplicação definidas em App Service (Application Settings) com prefixos por domínio (`COSMOS__CONNECTION`, `AUTH__ISSUER`).
- Segredos sensíveis armazenados no Key Vault e referenciados em App Settings via `@Microsoft.KeyVault(SecretUri=...)`.

### Deploy e CI/CD
- Pipelines (GitHub Actions):
  - Web (SWA): usar `azure/static-web-apps-deploy` action ou `swa deploy`. O build deve rodar `next build` (SSR) e publicar o `outputLocation` padrão do Next. Validar preview environments por PR.
  - API (.NET): build/test/publish → Deploy para App Service (slot staging) → Swap para produção quando necessário.
- Usar slots (`staging`) para APIs críticas.
- Validar integridade (health endpoint `/health` ou `/ready`) pós-deploy antes de swap.

### Observabilidade
- Application Insights: 
  - Correlation entre serviços configurando `Request-Id` e `traceparent`.
  - Custom Metrics para RU Cosmos, latência externa, filas pendentes (se houver).
- Logs retidos conforme política (ex.: 30 dias em dev, 90 em prd).

### Segurança
- HTTPS only e TLS 1.2+.
- Restrição de acesso a App Service (Access Restrictions) para endpoints de administração.
- Key Vault Firewall habilitado (permitindo somente redes necessárias + serviços confiáveis).

### Anti-padrões a Evitar
- Segredos commitados em repositório.
- Deploy direto em produção sem slot / sem validação automática.

---

## Qualidade: Lint, Formatação, Testes e Hooks
### Lint e Formatação
- Web (Next/React/Tailwind):
  - ESLint + Prettier.
    - Extensões: `next/core-web-vitals`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:tailwindcss/recommended`.
    - Prettier: 2 espaços, `semi: true`, `singleQuote: true`, `trailingComma: all`.
  - `editorconfig` para padronizar indentação e finais de linha.
 

### Testes
- Web:
  - Unit/Integration (UI): `Jest` + `@testing-library/react`.
  - E2E: `Playwright`.
  - Mocks de fetch: `whatwg-fetch`/`msw` quando necessário.
- APIs .NET: manter estratégia anterior (unit, integration, contract).
- Cobertura mínima sugerida: 80% linhas/branches.

### Hooks
- `husky` + `lint-staged` para validar código antes de commits.
- `commitlint` para impor padronização de Commits.

---

## Segurança e Configurações
### Gerenciamento de Segredos
- Segredos armazenados no Azure Key Vault (connection strings, tokens externos). Nenhum segredo versionado.
- App Settings referenciam segredos via sintaxe: `@Microsoft.KeyVault(SecretUri=...)`.

### Variáveis e Configuração
- `.env` local apenas para desenvolvimento isolado (não commitado); fornecer `.env.example` mínimo sem valores sensíveis.

### Entrada e Validação
- Sanitização e validação em boundary layer: FluentValidation (C#) e checagens mínimas no Next (apenas estrutura de request/middleware quando necessário).
- Rejeitar payloads com tamanho excessivo (`MaxRequestBodySize`).

### Segurança HTTP
- Front (SWA): usar `staticwebapp.config.json` para `globalHeaders` (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) e políticas de cache. TLS é gerenciado pelo Azure.
- APIs .NET: usar `UseHttpsRedirection`, `UseHsts` (exceto dev), CSP e headers de segurança. Habilitar CORS explicitamente para o domínio do SWA quando houver chamadas client-side (`API_BASE_URL`).

### Proteção de Dados Sensíveis
- Logs sem PII; se necessário, mascarar (`email`, `documentId`).
- Telemetria customizada filtrando payloads antes de enviar.

### Dependências e Vulnerabilidades
- Auditoria periódica: `dotnet list package --vulnerable` e `npm audit --production`.
- Renovar dependências críticas em janela controlada.

### Monitoramento
- Application Insights alertas: taxa de erro > 2%, latência p95 acima do SLO, RU Cosmos próxima do limite.

### Anti-padrões
- Hardcode de chaves ou connection strings no código.
- Logs de stack trace completos em produção sem filtragem.

---

## Anexos práticos (Next.js + SWA)
- Inicialização local: preferir usar o SWA CLI para gerar a configuração base (rotas, headers, fallback) e testar SSR/ISR localmente.
- Configuração: definir `staticwebapp.config.json` para `navigationFallback`, `globalHeaders` (CSP/HSTS/etc.) e regras de cache. Evitar criar manualmente sem `swa init`.
- Variáveis de ambiente: `API_BASE_URL` (privada) e `NEXT_PUBLIC_*` (pública). Não versionar `.env`.
- Padrão de fetch server-side com correlação:
  - Enviar `x-correlation-id` nas chamadas à API .NET e propagar IDs recebidos para logs/telemetria.

## Documentação
- Manter este arquivo atualizado conforme o projeto evolui.

---

## Checklist Rápido (para PR)
- [ ] Seguiu convenções de branch e commits
- [ ] Código lintado e formatado
- [ ] Testes passaram e cobertura ok
- [ ] Migrations/Seeds (se aplicável) revisados
- [ ] Configurações de App Service / Slots revisadas
- [ ] Segredos referenciados via Key Vault
- [ ] Documentação ajustada
