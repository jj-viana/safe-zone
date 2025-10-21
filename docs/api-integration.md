# Integração da API com o Frontend

Este documento descreve como o frontend Next.js se integra com a API .NET para o envio de denúncias.

## Estrutura

A integração foi implementada seguindo as convenções do projeto:

### Arquivos Criados

```
web/
├── lib/
│   ├── api/
│   │   ├── index.ts              # Exportações centralizadas
│   │   ├── types.ts              # Tipos TypeScript da API
│   │   └── reports-client.ts     # Cliente HTTP para reports
│   └── utils/
│       ├── date-utils.ts         # Utilitários de data
│       └── form-mappers.ts       # Mapeamento formulário → API
└── .env.example                  # Variáveis de ambiente
```

### Componentes Modificados

- `web/app/components/denuncia/denuncia.tsx`: Integração do formulário com a API

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na pasta `web/` baseado no `.env.example`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e configure a URL da API:

```env
API_BASE_URL=https://localhost:5206
```

**Importante**: 
- Para desenvolvimento local, use `https://localhost:5206`
- Para produção, use a URL do Azure App Service

### 2. CORS na API

A API .NET precisa permitir requisições do domínio do frontend. Adicione ao `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",  // Dev local
            "https://your-swa-domain.azurestaticapps.net"  // Produção
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// Antes de app.MapControllers():
app.UseCors("AllowFrontend");
```

## Uso

### Cliente de Reports

O cliente HTTP está disponível em `@/lib/api`:

```typescript
import { reportsClient } from '@/lib/api';

// Criar uma denúncia
const response = await reportsClient.createReport({
  crimeGenre: 'crime',
  crimeType: 'robbery',
  description: 'Descrição do incidente',
  location: 'Brasília, DF',
  crimeDate: '2025-01-15T10:30:00.000Z',
  reporterDetails: {
    ageGroup: '18-29',
    ethnicity: 'mixed',
    genderIdentity: 'cisgender-man',
    sexualOrientation: 'heterosexual'
  },
  resolved: false
});

// Listar todas as denúncias
const reports = await reportsClient.getAllReports();

// Buscar por ID
const report = await reportsClient.getReportById('some-id');

// Buscar por gênero de crime
const crimeReports = await reportsClient.getReportsByCrimeGenre('crime');
```

### Tratamento de Erros

O cliente lança `ApiResponseError` para erros da API:

```typescript
import { ApiResponseError } from '@/lib/api';

try {
  await reportsClient.createReport(data);
} catch (error) {
  if (error instanceof ApiResponseError) {
    console.error('Status:', error.statusCode);
    console.error('Mensagem:', error.message);
    
    // Erros de validação
    if (error.apiError?.errors) {
      error.apiError.errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
  } else {
    console.error('Erro desconhecido:', error);
  }
}
```

## Mapeamento de Dados

### Formulário → API

O arquivo `form-mappers.ts` contém os mapeamentos entre valores do formulário (em português) e valores da API (em inglês):

| Campo do Form | Valor API | Tipo |
|--------------|-----------|------|
| Crime | crime | crimeGenre |
| Sensação de insegurança | insecurity | crimeGenre |
| Assalto ou tentativa de assalto | robbery | crimeType |
| Violência Verbal | verbal-violence | crimeType |
| Violência Física | physical-violence | crimeType |
| Furto | theft | crimeType |
| Vandalismo | vandalism | crimeType |
| Assédio | harassment | crimeType |
| Iluminação Precária | poor-lighting | crimeType |
| Abandono de local público | public-abandonment | crimeType |

### Datas

As datas são convertidas de `DD/MM/YYYY` para ISO 8601:

```typescript
import { convertToIsoDate } from '@/lib/utils/date-utils';

const isoDate = convertToIsoDate('15/01/2025');
// Resultado: '2025-01-15T00:00:00.000Z'
```

## Fluxo de Envio

1. Usuário preenche o formulário (5 etapas)
2. Ao clicar em "Enviar" (etapa 5):
   - Valida a data de ocorrência
   - Mapeia os dados do formulário para o formato da API
   - Envia POST para `/api/reports`
   - Em caso de sucesso: avança para tela de confirmação
   - Em caso de erro: exibe mensagem de erro na tela

## Validações

### Cliente (Frontend)

- Data de ocorrência: formato DD/MM/YYYY e data válida
- Campos obrigatórios: tipo de relato, natureza, data, localização

### Servidor (API)

A API .NET valida:
- Campos obrigatórios (crimeGenre, crimeType, description, location, crimeDate, resolved)
- Tamanho máximo dos campos
- Formato da data (ISO 8601)

## Tipos TypeScript

Os tipos em `types.ts` refletem os modelos C# da API:

```typescript
// Correspondência com Report.cs
interface ReportResponse {
  id: string;                    // Report.Id
  crimeGenre: string;            // Report.CrimeGenre
  crimeType: string;             // Report.CrimeType
  description: string;           // Report.Description
  location: string;              // Report.Location
  crimeDate: string;             // Report.CrimeDate (ISO 8601)
  reporterDetails?: ReporterDetailsResponse | null;  // Report.ReporterDetails
  createdDate: string;           // Report.CreatedDate (ISO 8601)
  resolved: boolean;             // Report.Resolved
}
```

## Próximos Passos

### Melhorias Sugeridas

1. **Integração do Mapa**: 
   - Capturar coordenadas do componente MapaDepoimentos
   - Enviar latitude/longitude ou endereço preciso

2. **Feedback Visual**:
   - Loading spinner durante envio
   - Animações de sucesso/erro
   - Toast notifications

3. **Validação em Tempo Real**:
   - Validar campos conforme usuário digita
   - Destacar erros de validação

4. **Retry Logic**:
   - Tentar reenviar automaticamente em caso de falha de rede
   - Salvar rascunho localmente

5. **Upload de Imagens**:
   - Permitir anexar fotos da ocorrência
   - Integrar com Azure Blob Storage

## Troubleshooting

### Erro de CORS

Se você receber erros de CORS no console:

```
Access to fetch at 'https://localhost:5001/api/reports' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solução**: Configure CORS na API .NET (veja seção "CORS na API")

### Erro de Certificado SSL

Em desenvolvimento local, se a API usa HTTPS auto-assinado:

```
net::ERR_CERT_AUTHORITY_INVALID
```

**Solução**: 
- Aceite o certificado acessando `https://localhost:5001` no navegador
- Ou desabilite verificação SSL em desenvolvimento (não recomendado para produção)

### API não responde

```
Failed to fetch
```

**Verifique**:
1. A API está rodando? (`dotnet run` na pasta `api/`)
2. A URL está correta no `.env.local`?
3. Firewall está bloqueando a porta 5001?

## Referências

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Azure Cosmos DB .NET SDK](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/sdk-dotnet-v3)
