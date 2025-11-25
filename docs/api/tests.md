# Documentação de Testes - Safe Zone API

Esta documentação detalha a estratégia de testes, como executá-los, gerar relatórios de cobertura e descreve o propósito de cada conjunto de testes no projeto Safe Zone API.

## Visão Geral

O projeto utiliza **xUnit** como framework de testes principal. A suíte de testes é dividida em:
- **Testes Unitários**: Focados em testar componentes isolados (Controllers e Services) usando **Moq** para simular dependências.
- **Testes de Integração**: Focados em testar o fluxo completo da API usando `Microsoft.AspNetCore.Mvc.Testing`.

## Estrutura do Projeto de Testes

O projeto de testes (`tests/tests.csproj`) está organizado da seguinte forma:

- **ControllerTests/**: Testes unitários para o `ReportsController`. Verificam as respostas HTTP, validação de `ModelState` e chamadas corretas ao serviço.
- **Services/**: Testes unitários para o `ReportService` e `CosmosTelemetry`. Verificam a lógica de negócios, tratamento de exceções e interação com o Cosmos DB (mockado).
- **IntegrationTests/**: Testes de integração que sobem uma instância da API em memória para testar os endpoints reais.
- **Fakes/**: Contém objetos falsos e utilitários para auxiliar nos testes.

## Como Rodar os Testes

### Pré-requisitos
Certifique-se de ter o .NET 9.0 SDK instalado.

### Executando todos os testes
Para rodar todos os testes do projeto, execute o seguinte comando na raiz do repositório ou na pasta `tests/`:

```bash
dotnet test
```

### Executando testes específicos
Para rodar apenas um conjunto de testes específico (por exemplo, testes de criação de relatórios):

```bash
dotnet test --filter "FullyQualifiedName~CreateTests"
```

## Relatório de Cobertura de Código (HTML)

O projeto utiliza **Coverlet** para coletar dados de cobertura e **ReportGenerator** para criar relatórios HTML legíveis.

### 1. Gerar o arquivo de cobertura
Execute os testes com a coleta de cobertura habilitada. Isso gerará um arquivo `coverage.cobertura.xml` dentro de `tests/TestResults/{guid}/`.

```bash
dotnet test --collect:"XPlat Code Coverage"
```

### 2. Gerar o Relatório HTML
Para transformar o XML em um site HTML navegável, você precisa da ferramenta `dotnet-reportgenerator-globaltool`.

**Instalar a ferramenta (se ainda não tiver):**
```bash
dotnet tool install -g dotnet-reportgenerator-globaltool
```

**Gerar o relatório:**
Execute o comando abaixo na raiz do repositório:

```bash
reportgenerator -reports:tests/TestResults/*/coverage.cobertura.xml -targetdir:coverage-report -reporttypes:Html
```

O relatório estará disponível na pasta `coverage-report/index.html`. Abra este arquivo no navegador para visualizar a cobertura detalhada por classe e método.

## Detalhamento dos Testes

### 1. Testes de Controller (`ControllerTests`)
Estes testes garantem que os endpoints da API respondam com os códigos de status HTTP corretos e estruturas de dados esperadas.

- **ReportsControllerCreateTests**:
  - Valida se `CreateAsync` retorna `201 Created` com um payload válido.
  - Valida se retorna `400 BadRequest` (ValidationProblem) quando o `ModelState` é inválido (ex: campos obrigatórios faltando).
- **ReportsControllerGetTests**:
  - Valida se `GetByIdAsync` retorna o relatório correto.
  - Valida o tratamento de erros (ex: `500 Internal Server Error`) quando o serviço falha.
- **ReportsControllerUpdateTests** e **ReportsControllerDeleteTests**:
  - Validam as operações de atualização e remoção, garantindo os retornos `200 OK`, `204 No Content` ou erros apropriados.

### 2. Testes de Serviço (`Services`)
Focam na lógica de negócios e na interação com o banco de dados (simulado).

- **ReportServiceCreateTests**:
  - Verifica se todos os campos obrigatórios (`CrimeGenre`, `CrimeType`, `Description`, etc.) lançam `ArgumentException` se nulos.
  - Garante que a data do crime é normalizada para UTC.
  - Verifica se o ID é gerado corretamente.
- **ReportServiceQueryTests**:
  - Testa a construção de queries LINQ para o Cosmos DB.
- **CosmosTelemetryTests**:
  - Valida se a telemetria (Application Insights) é enviada apenas quando há consumo de RUs (Request Units) positivo.
  - Garante que métricas não são enviadas se o custo for zero ou negativo.
- **ReportServiceTestHelper**:
  - Classe utilitária que configura o `ReportService` com Mocks do `Container` do Cosmos DB e `ICosmosTelemetry`, facilitando a criação de cenários de teste.

### 3. Testes de Integração (`IntegrationTests`)
Utilizam o `CustomWebApplicationFactory` para criar um servidor de teste em memória.

- **Factory.cs**: Configura o ambiente de teste (`Testing`) e aponta para o diretório correto da API.
- **ReportsIntegrationCreateTests**:
  - Envia requisições HTTP POST reais para `/api/reports`.
  - Verifica se o registro é efetivamente criado e retornado.
  - Valida a serialização/deserialização JSON.
- **Outros testes de integração**: Cobrem GET, PUT e DELETE, garantindo que o contrato da API seja respeitado ponta a ponta.

## Validações Principais Cobertas

Os testes garantem as seguintes regras de negócio e validações:

1.  **Campos Obrigatórios**: `CrimeGenre`, `CrimeType`, `Description`, `Location`, `Region`, `Status` não podem ser nulos ou vazios.
2.  **Datas**: `CrimeDate` deve ser válida.
3.  **Integridade**: O sistema não deve falhar catastroficamente (exceções não tratadas) ao receber dados inválidos; deve retornar mensagens de erro adequadas.
4.  **Telemetria**: O consumo de recursos do banco de dados é monitorado corretamente.

---
**Nota**: Para manter a qualidade do código, recomenda-se rodar a suíte de testes completa antes de qualquer commit ou push para o repositório.
