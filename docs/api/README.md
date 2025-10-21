# API - Safe Zone

API REST desenvolvida em ASP.NET Core 9.0 para gerenciamento de denúncias de incidentes. A aplicação fornece endpoints para operações de CRUD, integra-se com Azure Cosmos DB (API NoSQL) para persistência de dados e utiliza Application Insights para observabilidade.

## Visão Geral

Este projeto segue os princípios de Clean Architecture, separando responsabilidades em camadas distintas:

- **Controllers**: Coordenação de requisições HTTP e mapeamento de respostas
- **Services**: Lógica de negócio e orquestração de operações
- **Models**: DTOs e entidades de domínio
- **Interfaces**: Abstrações e contratos de serviços
- **Configuration**: Configuração de injeção de dependências e opções

A API utiliza o SDK `Microsoft.Azure.Cosmos` v3 com boas práticas de performance e consistência, incluindo suporte a operações de patch para atualizações parciais eficientes.

## Tecnologias

- **.NET 9.0**: Framework principal
- **ASP.NET Core**: Web API
- **Azure Cosmos DB**: Banco de dados NoSQL (API SQL)
- **Application Insights**: Telemetria e monitoramento
- **Swagger/OpenAPI**: Documentação de API

## Pré-requisitos

Antes de executar a aplicação, certifique-se de ter:

- [.NET SDK 9.0](https://dotnet.microsoft.com/download/dotnet/9.0) ou superior instalado
- Conta Azure ativa com:
  - Azure Cosmos DB (API for NoSQL) provisionado
  - Application Insights (opcional, para telemetria)
- Editor de código (recomendado: Visual Studio Code com extensão C# Dev Kit)

## Configuração

### 1. Variáveis de Ambiente

A aplicação pode ser configurada através do arquivo `appsettings.json` ou variáveis de ambiente. Para desenvolvimento local, utilize **User Secrets** para armazenar credenciais sensíveis.

#### Estrutura do `appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "CosmosDB": {
    "ConnectionString": "<sua-connection-string>",
    "DatabaseId": "ReportsDb",
    "ContainerId": "Reports"
  },
  "ApplicationInsights": {
    "ConnectionString": "<sua-connection-string>"
  },
  "Cors": {
    "AllowedOrigins": [
      "https://localhost:3000",
      "https://seu-dominio-frontend.com"
    ]
  }
}
```

> **⚠️ Segurança:** Nunca versione credenciais no `appsettings.json`. Use User Secrets localmente e variáveis de ambiente via App Settings (App Service/SWA Configuration) em produção.

### 2. Configuração do Cosmos DB

A aplicação cria automaticamente o banco de dados e contêiner se não existirem. A configuração padrão utiliza:

- **Partition Key**: `/id`
- **Naming Policy**: camelCase
- **Connection Mode**: Gateway (recomendado para desenvolvimento)

Para ambientes de produção, considere:
- Ajustar o throughput (RU/s) conforme demanda
- Habilitar modo Direct para melhor performance
- Configurar políticas de indexação otimizadas

### 3. Configuração do CORS

Por padrão, a API aceita requisições do front-end local (`https://localhost:3000`). Para adicionar outros domínios, atualize a seção `Cors:AllowedOrigins` no `appsettings.json` ou via variáveis de ambiente.

## Executando a Aplicação

### Desenvolvimento Local

1. **Clone o repositório** (se ainda não o fez):
   ```bash
   git clone <url-do-repositorio>
   cd safe-zone/api
   ```

2. **Restaure as dependências**:
   ```bash
   dotnet restore
   ```

3. **Configure os appsettings** (veja seção de Configuração acima)

4. **Execute a aplicação**:
   ```bash
   dotnet run
   ```

5. **Acesse a documentação Swagger**:
   - URL: `https://localhost:5001/swagger`
   - Use a interface interativa para testar os endpoints

### Executando os Testes

Para executar os testes unitários e de integração:

```bash
dotnet test
```

## Estrutura do Projeto

```
api/
├── Controllers/        # Endpoints HTTP
├── Services/          # Lógica de negócio
├── Models/            # DTOs e modelos
├── Interfaces/        # Contratos e abstrações
├── Configuration/     # Classes de configuração
├── Properties/        # Configurações de launch
├── test/             # Testes (unit/integration)
├── Program.cs        # Ponto de entrada
└── appsettings.json  # Configurações (sem secrets)
```

## Observabilidade

A API integra-se com Azure Application Insights para monitoramento e telemetria:

### Métricas Customizadas

- **cosmos.request.units**: Consumo de RUs por operação no Cosmos DB
  - Dimensões: `operation`, `databaseId`, `containerId`, `statusCode`

### Logs Estruturados

Todos os serviços utilizam `ILogger<T>` para logging contextual. Logs são enviados automaticamente para Application Insights quando configurado.

### Correlation ID

Requisições podem incluir o header `x-correlation-id` para rastreamento distribuído. Se ausente, um ID será gerado automaticamente.