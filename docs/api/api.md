# Documentação da API Safe Zone

Esta API permite o gerenciamento de relatórios de incidentes de segurança.

## Endpoints

### Relatórios

#### Criar um novo relatório

Cria um novo relatório de incidente.

- **URL:** `/api/Reports`
- **Método:** `POST`
- **Corpo da Requisição:** `CreateReportRequest`
- **Respostas:**
  - `201 Created`: Relatório criado com sucesso. Retorna o objeto `ReportResponse`.
  - `400 Bad Request`: Dados inválidos fornecidos.
  - `500 Internal Server Error`: Erro inesperado no servidor.

#### Listar todos os relatórios

Retorna uma lista de todos os relatórios de incidentes, opcionalmente filtrados por status.

- **URL:** `/api/Reports`
- **Método:** `GET`
- **Parâmetros de Consulta:**
  - `status` (opcional): Filtra os relatórios pelo status fornecido.
- **Respostas:**
  - `200 OK`: Lista de relatórios retornada com sucesso. Retorna uma lista de `ReportResponse`.
  - `500 Internal Server Error`: Erro inesperado no servidor.

#### Listar relatórios por gênero de crime

Retorna uma lista de relatórios filtrados por um gênero de crime específico.

- **URL:** `/api/Reports/crime-genre/{crimeGenre}`
- **Método:** `GET`
- **Parâmetros de Rota:**
  - `crimeGenre`: O gênero do crime para filtrar.
- **Respostas:**
  - `200 OK`: Lista de relatórios retornada com sucesso.
  - `400 Bad Request`: Requisição inválida.
  - `500 Internal Server Error`: Erro inesperado no servidor.

#### Listar relatórios por tipo de crime

Retorna uma lista de relatórios filtrados por um tipo de crime específico.

- **URL:** `/api/Reports/crime-type/{crimeType}`
- **Método:** `GET`
- **Parâmetros de Rota:**
  - `crimeType`: O tipo do crime para filtrar.
- **Respostas:**
  - `200 OK`: Lista de relatórios retornada com sucesso.
  - `400 Bad Request`: Requisição inválida.
  - `500 Internal Server Error`: Erro inesperado no servidor.

#### Obter relatório por ID

Retorna os detalhes de um relatório específico pelo seu ID.

- **URL:** `/api/Reports/{id}`
- **Método:** `GET`
- **Parâmetros de Rota:**
  - `id`: O identificador único do relatório.
- **Respostas:**
  - `200 OK`: Relatório encontrado. Retorna o objeto `ReportResponse`.
  - `404 Not Found`: Relatório não encontrado.
  - `500 Internal Server Error`: Erro inesperado no servidor.

#### Atualizar relatório

Atualiza as informações de um relatório existente.

- **URL:** `/api/Reports/{id}`
- **Método:** `PATCH`
- **Parâmetros de Rota:**
  - `id`: O identificador único do relatório a ser atualizado.
- **Corpo da Requisição:** `UpdateReportRequest`
- **Respostas:**
  - `200 OK`: Relatório atualizado com sucesso. Retorna o objeto `ReportResponse` atualizado.
  - `400 Bad Request`: Dados inválidos ou operação inválida.
  - `404 Not Found`: Relatório não encontrado.
  - `500 Internal Server Error`: Erro inesperado no servidor.

#### Deletar relatório

Remove um relatório do sistema.

- **URL:** `/api/Reports/{id}`
- **Método:** `DELETE`
- **Parâmetros de Rota:**
  - `id`: O identificador único do relatório a ser removido.
- **Respostas:**
  - `204 No Content`: Relatório deletado com sucesso.
  - `404 Not Found`: Relatório não encontrado.
  - `500 Internal Server Error`: Erro inesperado no servidor.

## Modelos

### CreateReportRequest

Objeto utilizado para criar um novo relatório.

| Propriedade | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `crimeGenre` | string | Sim | Gênero do crime (máx. 256 caracteres). |
| `crimeType` | string | Sim | Tipo do crime (máx. 256 caracteres). |
| `description` | string | Sim | Descrição detalhada do incidente (máx. 2048 caracteres). |
| `location` | string | Sim | Localização do incidente (máx. 512 caracteres). |
| `region` | string | Sim | Região do incidente (máx. 128 caracteres). |
| `crimeDate` | string ($date-time) | Sim | Data e hora do crime. |
| `reporterDetails` | ReporterDetailsRequest | Não | Detalhes opcionais sobre o relator. |
| `status` | string | Sim | Status inicial do relatório (máx. 64 caracteres). |
| `resolved` | boolean | Sim | Indica se o incidente foi resolvido. |

### UpdateReportRequest

Objeto utilizado para atualizar um relatório existente. Todos os campos são opcionais.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `crimeGenre` | string | Gênero do crime. |
| `crimeType` | string | Tipo do crime. |
| `description` | string | Descrição do incidente. |
| `location` | string | Localização do incidente. |
| `region` | string | Região do incidente. |
| `crimeDate` | string ($date-time) | Data e hora do crime. |
| `reporterDetails` | ReporterDetailsRequest | Detalhes sobre o relator. |
| `resolved` | boolean | Indica se o incidente foi resolvido. |
| `status` | string | Status do relatório. |

### ReportResponse

Objeto retornado contendo os detalhes do relatório.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador único do relatório. |
| `crimeGenre` | string | Gênero do crime. |
| `crimeType` | string | Tipo do crime. |
| `description` | string | Descrição do incidente. |
| `location` | string | Localização do incidente. |
| `region` | string | Região do incidente. |
| `crimeDate` | string ($date-time) | Data e hora do crime. |
| `reporterDetails` | ReporterDetailsResponse | Detalhes sobre o relator. |
| `status` | string | Status atual do relatório. |
| `createdDate` | string ($date-time) | Data de criação do registro. |
| `resolved` | boolean | Indica se o incidente foi resolvido. |

### ReporterDetailsRequest / ReporterDetailsResponse

Detalhes demográficos do relator.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `ageGroup` | string | Faixa etária. |
| `ethnicity` | string | Etnia. |
| `genderIdentity` | string | Identidade de gênero. |
| `sexualOrientation` | string | Orientação sexual. |