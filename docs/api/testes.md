# Documentação de Testes da API

## Índice de Navegação

1. [Visão Geral](#1-visão-geral)
   - [Objetivo](#objetivo)
   - [Fluxo de Funcionamento](#fluxo-de-funcionamento)
2. [Configuração](#2-configuração)
   - [Integração com GitHub Actions](#integração-com-github-actions)
3. [Deploy](#3-deploy)
   - [Passo a Passo](#passo-a-passo)
4. [Funcionamento Técnico (métodos testados)](#4-funcionamento-técnico-métodos-testados)
   - [Controller](#controller)
     - [1. Funções Create](#1-funções-create)
     - [2. Funções Delete](#2-funções-delete)
     - [3. Funções Get](#3-funções-get)
     - [4. Funções Update](#4-funções-update)
   - [Service](#service)

---

## 1. Visão Geral

### Objetivo

O objetivo principal é garantir a confiabilidade e a estabilidade contínuas da API, transformando a validação de código em um processo rápido, repetível e automático. Especificamente, os testes automatizados visam:

* **Assegurar a Qualidade Funcional:** Validar o comportamento completo dos endpoints (controllers) e da lógica de negócio (services), garantindo que o sistema atenda às especificações esperadas.
* **Proteger Contra Regressões:** Criar uma rede de segurança que previne que novas alterações no código introduzam falhas (bugs) ou quebrem funcionalidades já existentes.
* **Mitigar Riscos na Integração:** Verificar a comunicação correta com dependências externas críticas (ex.: Cosmos DB), reduzindo o risco de falhas de ambiente em produção.
* **Acelerar o CI/CD (Integração e Entrega Contínuas):** Automatizar a verificação de código antes de merges para a branch principal e deploys, reduzindo o tempo de entrega e o risco de erros chegarem ao ambiente de produção.

Os testes de integração e unidade focam em aspectos técnicos cruciais como:

* Retorno dos códigos HTTP adequados.
* Tratamento robusto e correto de exceções.
* Integração fluida entre as camadas Controller e Service.

Para atingir esse objetivo utilizamos os Frameworks xUnit e Moq do próprio .NET, que oferecem uma base sólida para a criação de testes automatizados eficazes.

### Fluxo de Funcionamento

O fluxo de trabalho de CI/CD é baseado nas branches (`feature`, `development` e `main`) e é totalmente orquestrado pelo **GitHub Actions**. O processo é dividido em dois momentos de validação e um de entrega final:

### 1. Validação em Feature (Integração Contínua - CI)

Este fluxo é acionado sempre que um desenvolvedor abre ou atualiza um **Pull Request (PR)** com destino à branch `development`.

**Execução Concorrente:**  
O GitHub Actions executa dois workflows em paralelo: um para o **Web (Front-end)** e outro para a **API (Back-end)**.

**Comandos da API (.NET)**

- `dotnet restore` : Garante que os pacotes estão sendo instalados.  
- `dotnet build` : Garante que a aplicação consegue ser compilada e que não há erros.  
- `dotnet test` : Roda os testes e verifica a porcentagem de cobertura.  

**Comandos da Web (Front-end)**

- `npm ci` : Instala as dependências.  
- `npm run build` : Garante que o Front-end compile.  
- `npm run lint` : Garante que não há problemas de sintaxe ou estilo de código.  

**Portão de Qualidade:**  
Se todos esses comandos de ambos os workflows passarem, o teste é aprovado e o merge para `development` é liberado.

### 2. Lançamento e Implantação Contínua (CD)

Esta fase é acionada pelo PR de `development` para `main`, que indica a criação de uma nova release e sua implantação em produção.

**Validação Final (CI no PR para main):**  
O PR de `development` para `main` aciona novamente os mesmos workflows de **build** e **teste** para Web e API, garantindo que todas as mudanças acumuladas em `development` funcionem em conjunto.

**Gatilho do Deploy (CD):**  
Após a aprovação e o merge do PR para `main`, uma **action separada** dedicada ao **Deploy** é iniciada.

---

## 2. Configuração

### Integração com GitHub Actions

O GitHub Actions é a plataforma escolhida para hospedar e executar os pipelines de CI/CD (descritos na seção anterior). A configuração dos fluxos de trabalho é definida em arquivos YAML localizados no diretório `.github/workflows/` do repositório.

A integração e execução do processo são garantidas pelos seguintes mecanismos:

* **Arquivos YAML:** Definem os workflows que especificam os eventos de acionamento (ex.: `pull_request`, `push` para `main`), os jobs e os passos de execução dos comandos (`dotnet test`, `npm run build`, etc.).
* **Runners e Ambiente:** O GitHub utiliza máquinas virtuais (*runners*) gerenciadas para executar os jobs de forma isolada, onde são instaladas as dependências e executados os builds da API (.NET) e da Web (Node/npm).
* **Secrets para Azure:** As credenciais e chaves de acesso necessárias para que o GitHub Actions se conecte e publique nos serviços da Azure (App Service e Static Web Apps) são armazenadas de forma segura nas configurações de *Secrets* do repositório.

---

## 3. Deploy

### Passo a Passo

O workflow de Deploy (Implantação Contínua – CD) move o código validado de `main` para os ambientes de produção na **Azure**.

1. **Pré-Deploy (Revalidação):**  
   Executa novamente comandos para instalar dependências, testar e fazer o build.

2. **Preparação da Web:**  
   O Front-end (Web) é compilado com as variáveis de ambiente.

3. **Autenticação na Azure:**  
   O workflow utiliza segredos do repositório para acessar as chaves e fazer login no Azure.

4. **Execução do Deploy:**  
   - **Deploy da Web:** O Front-end é implantado no recurso **Static Web App** da Azure.  
   - **Deploy da API:** O Back-end é implantado no **App Service** da Azure.  

5. **Health Check (Verificação de Saúde):**  
   Após o deploy, são realizadas verificações para garantir que a aplicação está acessível e rodando:  
   - **API:** Check no endpoint base (`/`) que deve retornar que a API está *healthy*.  
   - **Web:** Check na página principal que deve retornar o HTML.  

6. **Criação da Release:**  
   Se ambos os health checks retornarem resposta positiva, o workflow consulta a tag da última release e a incrementa.

7. **Finalização:**  
   Uma nova release é liberada no GitHub com a tag de versão atualizada.

---

## 4. Funcionamento Técnico (Métodos Testados)

- [Controller](#controller)
  - [1. Funções Create](#1-funções-create)
  - [2. Funções Delete](#2-funções-delete)
  - [3. Funções Get](#3-funções-get)
  - [4. Funções Update](#4-funções-update)
- [Service](#service)

---

## Controller

Nesta seção, detalhamos os testes automatizados implementados para as funções **Create**, **Delete**, **Get** e **Update** do `ReportsController`, com foco no comportamento esperado em diferentes respostas da camada de *Service*.

---

### 1. Funções Create

**Endpoint:** `POST /api/reports`

**Objetivo:** Validar se o *endpoint* de criação se comunica corretamente com a camada de *Service*, garantindo que o modelo de entrada seja válido, que exceções sejam tratadas adequadamente e que o código HTTP retornado reflita o resultado da operação.

**Cenários Testados (Baseado em `ReportsControllerCreateTests`):**

| Cenário | Comportamento Esperado | Código HTTP |
| :--- | :--- | :--- |
| **Modelo Inválido (ModelState)** | O controller valida o `ModelState` antes de processar. Se inválido, retorna um objeto de validação. | **400 Bad Request** |
| **Criação com Sucesso** | O *Service* processa o `CreateReportRequest` e retorna um `ReportResponse` válido. | **201 Created** |
| **Dados Inválidos (ArgumentException)** | O *Service* lança `ArgumentException` ao detectar dados inconsistentes ou inválidos no payload. | **400 Bad Request** |
| **Operação Inválida (InvalidOperationException)** | O *Service* lança `InvalidOperationException` ao encontrar uma condição de negócio que impede a criação. | **400 Bad Request** |
| **Erro Inesperado do Service** | O *Service* lança uma exceção genérica durante o processamento. | **500 Internal Server Error** |

**Observações Técnicas:**
- O controller valida o `ModelState` antes de invocar o *service* e utiliza `ValidationProblem(ModelState)` para reportar erros de validação de entrada.
- Exceções específicas de validação/regras de negócio (`ArgumentException`, `InvalidOperationException`) são convertidas em `BadRequest` com detalhes do erro.
- Exceções não tratadas são convertidas para `Problem` com status 500, sinalizando erro interno.
- Em caso de sucesso, o *endpoint* retorna `CreatedAtAction` com o `ReportResponse` no body e referência ao método `GetByIdAsync`.


---

### 2. Funções Delete

**Endpoint:** `DELETE /api/reports/{id}`

**Objetivo:** Validar se o *endpoint* de exclusão se comunica corretamente com a camada de *Service*, retornando o código HTTP apropriado conforme o resultado da operação.

**Cenários Testados (Baseado em `ReportsControllerDeleteTests`):**

| Cenário | Comportamento Esperado | Código HTTP |
| :--- | :--- | :--- |
| **Exclusão com Sucesso** | O *Service* confirma a exclusão (retorna `true`). | **204 No Content** |
| **Recurso Não Encontrado** | O *Service* informa que o ID não existe para exclusão (retorna `false`). | **404 Not Found** |
| **Erro Inesperado do Service** | O *Service* lança uma exceção inesperada durante o processo. | **500 Internal Server Error** |

---

### 3. Funções Get

**Endpoints:**  
`GET /api/reports`  
`GET /api/reports/{id}`  
`GET /api/reports/crime-genre/{crimeGenre}`  
`GET /api/reports/crime-type/{crimeType}`

**Objetivo:** Garantir que a API recupere corretamente os dados sob diferentes critérios de busca (ID, gênero do crime, tipo do crime ou todos), e que trate adequadamente os casos de ausência de resultados e falhas internas.

**Cenários Testados (Baseado em `ReportsControllerGetTests`):**

#### Get por ID (`GET /api/reports/{id}`):

| Cenário | Comportamento Esperado | Código HTTP |
| :--- | :--- | :--- |
| **Busca com Sucesso** | O *Service* retorna um objeto válido (`ReportResponse`). | **200 OK** |
| **Recurso Não Encontrado** | O *Service* retorna `null` (ausência do recurso). | **404 Not Found** |
| **Erro no Service** | O *Service* lança uma exceção durante a busca. | **500 Internal Server Error** |

#### Get por Gênero, Tipo e Todos (`/api/reports/crime-genre/{crimeGenre}`, `/api/reports/crime-type/{crimeType}`, `/api/reports`):

| Cenário | Comportamento Esperado | Código HTTP |
| :--- | :--- | :--- |
| **Busca com Resultados** | O *Service* retorna uma lista de relatórios (1 ou mais itens). | **200 OK** com a lista preenchida |
| **Lista Vazia (Nenhum Resultado)** | O *Service* retorna uma lista vazia (`new List<ReportResponse>()`). | **200 OK** com um *array* JSON vazio |
| **Erro no Service (Geral)** | O *Service* lança uma exceção durante o processamento da busca. | **500 Internal Server Error** |

---

### 4. Funções Update
**Endpoint:** `PATCH /api/reports/{id}`

**Objetivo:** Garantir que o endpoint de atualização (`UpdateAsync`) valide entrada, trate exceções e traduza corretamente os resultados do *service* em respostas HTTP apropriadas.

**Cenários testados (baseado em `api/test/ControllerTests/ReportsControllerUpdateTests.cs`):**

| Cenário | Comportamento esperado | Código HTTP | Teste (nome) |
| :--- | :--- | :---: | :--- |
| Modelo inválido (ModelState) | Retorna payload de validação (ValidationProblemDetails). | 400 Bad Request | UpdateAsync_WhenModelStateInvalid_ReturnsValidationProblem |
| `ArgumentException` lançado pelo service | Converte para BadRequest com detalhe do erro. | 400 Bad Request | UpdateAsync_WhenServiceThrowsArgumentException_ReturnsBadRequest |
| `InvalidOperationException` lançado pelo service | Converte para BadRequest com detalhe do erro. | 400 Bad Request | UpdateAsync_WhenServiceThrowsInvalidOperationException_ReturnsBadRequest |
| Exceção genérica lançada pelo service | Converte para Problem (500) sinalizando erro inesperado. | 500 Internal Server Error | UpdateAsync_WhenServiceThrowsException_ReturnsProblem |
| Atualização não encontrada (service retorna `null`) | Retorna NotFound quando o relatório a atualizar não existe. | 404 Not Found | UpdateAsync_WhenUpdateNotFound_ReturnsNotFound |
| Atualização bem-sucedida (service retorna `ReportResponse`) | Retorna 200 OK com o `ReportResponse` no body.
 | 200 OK | UpdateAsync_WhenUpdateSucceeds_ReturnsOk |

Observações técnicas:
- O controller valida `ModelState` antes de chamar o service e usa `ValidationProblem(ModelState)` para reportar erros de validação.
- Exceções específicas de validação/negócio (ex.: `ArgumentException`, `InvalidOperationException`) são tratadas como `BadRequest` com payload de erro; exceções não tratadas são convertidas para `Problem` com status 500.
- Os testes unitários usam *mocks* (Moq) para simular o comportamento do `IReportService` e assertam os tipos de `IActionResult` retornados.



---

## Service


