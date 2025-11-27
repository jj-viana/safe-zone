# Gerência de Configuração de Software

Este documento detalha as práticas, políticas e ferramentas utilizadas para a Gerência de Configuração do projeto **Amaterasu - Safe Zone**. Ele serve como guia para a manutenção da integridade do produto ao longo do seu ciclo de vida.

## 1. Repositórios de Código

O projeto adota uma estratégia de **Monorepo**, onde tanto o código-fonte do *frontend* (Web) quanto do *backend* (API) residem no mesmo repositório.

- **Plataforma**: GitHub
- **URL**: [https://github.com/jj-viana/safe-zone](https://github.com/jj-viana/safe-zone)
- **Estrutura**:
  - `/web`: Aplicação Frontend (Next.js)
  - `/api`: Aplicação Backend (.NET 9)
  - `/docs`: Documentação do projeto
  - `/.github`: Workflows de CI/CD
  - `/tests`: Testes automatizados (integração/unidade)

## 2. Políticas de Branches

O projeto utiliza um fluxo de trabalho baseado em **Git Flow Simplificado**.

### 2.1. Branches Principais
- **`main`**: Branch de produção. Contém o código estável e implantado. É a fonte da verdade para o ambiente de produção.
- **`development`**: Branch de integração. Todo o desenvolvimento de novas funcionalidades é mesclado aqui primeiro para testes integrados.

### 2.2. Branches de Apoio
- **`feature/*`**: Para desenvolvimento de novas funcionalidades. Nascem de `development` e morrem em `development`.
- **`fix/*`**: Para correção de bugs. Nascem de `development` e morrem em `development`.
- **`chore/*`**: Para tarefas de manutenção (configurações, dependências).
- **`docs/*`**: Para alterações apenas em documentação.

### 2.3. Regras de Proteção (Branch Protection Rules)
As branches `main` e `development` são protegidas e possuem as seguintes restrições:
- **Require pull request reviews before merging**: É obrigatória a aprovação de pelo menos 1 revisor.
- **Require status checks to pass before merging**: Os checks de CI (Lint, Build, Testes) devem passar obrigatoriamente.
- **Require review from Code Owners**: Não é obrigatória a aprovação do Code Owner.
- **Restrição de Origem**: A branch `main` aceita Pull Requests exclusivamente vindos da branch `development`.
- **Do not allow bypassing the above settings**: Desabilitado. Administradores podem ignorar as regras em casos de emergência.

## 3. Políticas de Contribuição

### 3.1. Fluxo de Pull Request (PR)
1.  Crie uma branch a partir de `development`.
2.  Realize as alterações locais.
3.  Abra um Pull Request (PR) apontando para `development`.
4.  O CI será disparado automaticamente (`pr-validation`).
5.  Solicite revisão de pares.
6.  Após aprovação e CI verde, o PR é mesclado.

### 3.2. Padrão de Commits
O projeto segue a convenção **Conventional Commits** para padronizar as mensagens e facilitar a automação de releases.

**Formato**: `<tipo>(<escopo opcional>)!: <descrição curta>`

**Tipos permitidos**:
- `feat`: Nova funcionalidade.
- `fix`: Correção de bug.
- `docs`: Documentação.
- `style`: Formatação, falta de ponto e vírgula, etc. (sem alteração de código).
- `refactor`: Refatoração de código (sem fix ou feat).
- `test`: Adição ou correção de testes.
- `chore`: Atualização de build, ferramentas, etc.

**Exemplo**: `feat(api): adiciona endpoint de relatórios`

## 4. Versionamento

O projeto adota o **Semantic Versioning (SemVer) 2.0.0** (`MAJOR.MINOR.PATCH`).

- **MAJOR**: Mudanças incompatíveis na API ou quebras de contrato.
- **MINOR**: Funcionalidades novas compatíveis com versões anteriores.
- **PATCH**: Correções de bugs compatíveis com versões anteriores.
**Automação e Releases**:
- **PATCH (vX.X.Z)**: O pipeline de CD gera automaticamente tags de versão ao realizar o deploy em produção, incrementando o `PATCH` da última versão encontrada.
- **MAJOR e MINOR (vX.0.0, vX.Y.0)**: Para grandes lançamentos ("Big Releases"), a tag de versão deve ser criada manualmente no repositório. O workflow respeitará a tag existente.

## 5. Integração Contínua (CI)

A Integração Contínua é realizada via **GitHub Actions**.

- **Workflow**: `.github/workflows/pr-validation.yml`
- **Gatilhos**:
  - Pull Requests para `development`.
  - Pull Requests de `development` para `main`.
- **Etapas (Jobs)**:
  1.  **Web Quality**: Instala dependências, executa Lint (`npm run lint`) e Build (`npm run build`) do frontend.
  2.  **API Quality**: Restaura pacotes, compila (`dotnet build`) e executa testes automatizados (`dotnet test`) do backend.
- **Política**: O merge do PR é bloqueado se qualquer etapa do CI falhar.
- **Retenção**: Logs de execução e artefatos são mantidos por 90 dias (padrão do GitHub).

## 6. Entrega Contínua (CD)

A Entrega Contínua automatiza o deploy para os ambientes Azure.
- **Workflow**: `.github/workflows/release-deploy.yml`
- **Gatilho**: Push na branch `main` (geralmente via merge de PR).
- **Otimização**: O workflow verifica quais pastas sofreram alterações (`web/` ou `api/` e/ou `tests/`) e executa apenas as etapas de build e deploy necessárias para os componentes modificados.
- **Etapas**:
  1.  **Build**: Gera os artefatos de produção para Web e API (se houver mudanças).
  2.  **Deploy Web**: Publica o frontend no **Azure Static Web Apps** (se houver mudanças em `web/`).
  3.  **Deploy API**: Publica o backend no **Azure App Service** (se houver mudanças em `api/`).
  4.  **Release**: Cria uma Release no GitHub e gera uma tag de versão.

## 7. Licença

O projeto é distribuído sob a licença **GNU Affero General Public License v3.0 (AGPL-3.0)**.
Isso implica que o código é aberto e qualquer modificação distribuída ou disponibilizada via rede deve ter seu código-fonte também disponibilizado sob a mesma licença.
