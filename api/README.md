# Incident Reports API

API ASP.NET Core que expõe operações de CRUD para incident reports armazenados em uma conta Azure Cosmos DB (modo NoSQL). O projeto utiliza o `Microsoft.Azure.Cosmos` SDK v3 com as melhores práticas descritas na [documentação oficial](https://learn.microsoft.com/en-us/azure/cosmos-db/partial-document-update) para atualizações parciais.

## Pré-requisitos

- .NET SDK 9.0 ou superior instalado.
- Conta Azure Cosmos DB (API for NoSQL) com um banco de dados e contêiner configurados.
- Para uso com identidade gerenciada, garanta que a identidade tenha permissões de *Cosmos DB Built-in Data Contributor* ou superior.

## Configuração

As definições ficam na seção `CosmosDB` dos arquivos `appsettings.json` ou variáveis de ambiente:

```json
"CosmosDB": {
  "ConnectionString": "AccountEndpoint=https://your-account.documents.azure.com:443/;AccountKey=YOUR_ACCOUNT_KEY;",
  "DatabaseId": "IncidentReportsDb",
  "ContainerId": "incidentReports",
  "EnableContentResponseOnWrite": false
}
```

> **Segurança:** Não versionar a `AccountKey`. Utilize `dotnet user-secrets` ou variáveis de ambiente (`COSMOS__ACCOUNTKEY`) durante o desenvolvimento local.

O contêiner é criado automaticamente se não existir, com chave de partição `/id`.
Os campos `id` e `createdDate` são atribuídos automaticamente pela API; os demais campos devem ser informados na requisição de criação. O bloco `reporterDetails` é opcional e todos os seus atributos também são opcionais.

### Application Insights

Para habilitar telemetria, defina a connection string do Application Insights via configuração:

```json
"ApplicationInsights": {
  "ConnectionString": "InstrumentationKey=xxxx;IngestionEndpoint=https://..."
}
```

Em ambientes Azure App Service, utilize a variável `APPLICATIONINSIGHTS_CONNECTION_STRING` ou um segredo no Key Vault referenciado via App Settings.

#### Métricas de RUs (Cosmos DB)

A API publica a métrica personalizada `cosmos.request.units` no Application Insights para cada operação executada no Cosmos DB. As dimensões incluem:

- `operation`: nome lógico da operação (ex.: `ReportCreate`, `ReportQueryByGenreTotal`).
- `databaseId` / `containerId`: alvo no Cosmos DB.
- `statusCode`: resposta HTTP retornada pelo Cosmos (quando disponível).
- Filtros específicos (`crimeGenre`, `crimeType`, `pages`, etc.), quando aplicável.

Use o recurso **Metrics** do Application Insights para monitorar o consumo de RUs por operação e criar alertas conforme necessário.

## Executando o projeto

```bash
cd teste
dotnet restore
dotnet run
```

A aplicação iniciará em `https://localhost:5001` (ou porta configurada). A UI do Swagger estará disponível em `https://localhost:5001/swagger`.

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/reports` | Cria um report. |
| `GET` | `/api/reports` | Lista todos os reports. |
| `GET` | `/api/reports/{id}` | Obtém um report por ID. |
| `GET` | `/api/reports/crime-genre/{crimeGenre}` | Lista reports filtrando pelo gênero do crime. |
| `PATCH` | `/api/reports/{id}` | Atualiza parcialmente um report. |
| `DELETE` | `/api/reports/{id}` | Remove um report. |

### Exemplo de criação

```bash
curl -X POST https://localhost:5001/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "crimeGenre": "theft",
    "crimeType": "burglary",
    "description": "Bike stolen from the garage",
    "location": "SHIGS 713",
    "crimeDate": "2025-10-09T18:25:43Z",
    "reporterDetails": {
      "ageGroup": "18-30",
      "ethnicity": "mixed",
      "genderIdentity": "male",
      "sexualOrientation": "heterosexual"
    },
    "resolved": false
  }'
```

### Exemplo de atualização parcial

```bash
curl -X PATCH https://localhost:5001/api/reports/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "resolved": true,
    "reporterDetails": {
      "ageGroup": "30-45",
      "ethnicity": "mixed",
      "genderIdentity": "male",
      "sexualOrientation": "heterosexual"
    }
  }'
```

## Testes rápidos

Para validar a compilação execute:

```bash
dotnet build
```

## Referências

- [Azure Cosmos DB .NET SDK - melhores práticas](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/best-practice-dotnet)
- [Atualização parcial de documentos (Patch API)](https://learn.microsoft.com/en-us/azure/cosmos-db/partial-document-update)
