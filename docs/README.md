# 🔗 Integração Frontend-Backend - SafeZone

## 📖 Visão Geral

Esta pasta contém toda a documentação da integração entre o frontend Next.js e a API .NET do projeto SafeZone, incluindo guias, checklists e exemplos de código.

## 📚 Documentos Disponíveis

### 1. **INTEGRATION_SUMMARY.md** - Visão Geral Completa
- 📋 O que foi implementado
- 🎯 Fluxo completo de envio
- 📁 Estrutura de arquivos
- 🔧 Configuração necessária
- 📊 Mapeamento de dados
- 🎨 Padrões seguidos

**👉 Comece por aqui para entender a arquitetura da integração**

### 2. **QUICK_START.md** - Guia de Início Rápido
- ⚡ Setup em 5 minutos
- 🚀 Como testar localmente
- 🔍 Troubleshooting rápido
- 📊 Exemplos de testes via Swagger, PowerShell e curl

**👉 Use este para configurar e testar rapidamente**

### 3. **api-integration.md** - Documentação Técnica Detalhada
- 🔧 Configuração passo a passo
- 💻 Uso do cliente HTTP
- 🗺️ Tabelas de mapeamento completas
- ⚠️ Tratamento de erros
- 🚀 Deploy em produção
- 🐛 Troubleshooting detalhado

**👉 Referência técnica completa para desenvolvedores**

### 4. **INTEGRATION_CHECKLIST.md** - Lista de Verificação
- ✅ Checklist completo de setup
- 🧪 Testes passo a passo
- 🐛 Testes de erro
- 📝 Status de conclusão

**👉 Use para garantir que tudo foi configurado corretamente**

## 🎯 Qual Documento Usar?

```
┌─────────────────────────────────────────────┐
│  Você quer...                               │
├─────────────────────────────────────────────┤
│                                             │
│  📖 Entender a arquitetura?                 │
│     → INTEGRATION_SUMMARY.md                │
│                                             │
│  ⚡ Testar rapidamente?                     │
│     → QUICK_START.md                        │
│                                             │
│  📚 Referência técnica completa?            │
│     → api-integration.md                    │
│                                             │
│  ✅ Verificar configuração?                 │
│     → INTEGRATION_CHECKLIST.md              │
│                                             │
└─────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- ✅ .NET SDK 9.0+
- ✅ Node.js 18+
- ✅ Azure Cosmos DB (ou emulador local)

### Configuração em 3 Passos

#### 1️⃣ Backend

```powershell
cd api
dotnet restore
# Configure appsettings.Development.json
dotnet run
```

#### 2️⃣ Frontend

```powershell
cd web
npm install
copy .env.example .env.local
# Configure .env.local
npm run dev
```

#### 3️⃣ Teste

1. Acesse `http://localhost:3000`
2. Clique em "Fazer Denúncia"
3. Preencha o formulário
4. Envie e verifique o sucesso!

📖 **Detalhes completos**: Veja `QUICK_START.md`

## 📊 Arquitetura da Integração

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Usuário   │────────▶│  Next.js     │───────▶│   .NET API  │
│  (Browser)  │         │  (Frontend)  │         │  (Backend)  │
└─────────────┘         └──────────────┘         └─────────────┘
                              │                         │
                              │                         │
                        ┌─────▼─────┐            ┌──────▼──────┐
                        │  lib/api/ │            │  Cosmos DB  │
                        │   types   │            │  (Storage)  │
                        │  client   │            └─────────────┘
                        │  mappers  │
                        └───────────┘
```

## 🔑 Conceitos-Chave

### Mapeamento de Dados

O formulário usa valores em **português**, mas a API espera valores em **inglês**:

```typescript
// Formulário (UI)
"Crime" → "crime"                    // crimeGenre
"Assalto" → "robbery"                // crimeType
"18 - 29" → "18-29"                  // ageGroup
"Homem Cisgênero" → "cisgender-man"  // genderIdentity
```

📖 **Tabelas completas**: Veja `api-integration.md` ou `form-mappers.ts`

### Validação em Camadas

1. **Frontend**: Formato de data, campos obrigatórios
2. **API**: Validação de negócio, tamanhos de campo
3. **Cosmos DB**: Constraints de schema

### Tratamento de Erros

```typescript
try {
  await reportsClient.createReport(data);
} catch (error) {
  if (error instanceof ApiResponseError) {
    // Erro da API (400, 500, etc.)
    console.error(error.statusCode, error.message);
  } else {
    // Erro de rede
    console.error('Falha de conexão');
  }
}
```

## 📁 Estrutura de Arquivos

### Backend (API)
```
api/
├── appsettings.json              # Config de produção
├── appsettings.Development.json  # Config de dev
├── Program.cs                    # CORS configurado
├── Controllers/
│   └── ReportsController.cs      # Endpoints
├── Services/
│   └── ReportService.cs          # Lógica de negócio
└── Models/
    └── Report.cs                 # Modelos de dados
```

### Frontend (Web)
```
web/
├── .env.local                    # Variáveis de ambiente
├── lib/
│   ├── api/
│   │   ├── types.ts             # Tipos TypeScript
│   │   ├── reports-client.ts    # Cliente HTTP
│   │   └── index.ts             # Exportações
│   └── utils/
│       ├── date-utils.ts        # Conversão de datas
│       └── form-mappers.ts      # Mapeamento PT→EN
└── app/
    └── components/
        └── denuncia/
            └── denuncia.tsx     # Formulário integrado
```

## 🎨 Padrões Utilizados

✅ **Nomenclatura**:
- Código: inglês
- Comentários: português
- Variáveis: `camelCase`
- Classes/Tipos: `PascalCase`
- Arquivos: `kebab-case`

✅ **Separação de Responsabilidades**:
- Cliente HTTP separado (`reports-client.ts`)
- Utilitários isolados (`date-utils.ts`, `form-mappers.ts`)
- Tipos centralizados (`types.ts`)

✅ **Tratamento de Erros**:
- Classes de erro customizadas
- Try-catch em todas as operações assíncronas
- Mensagens de erro amigáveis ao usuário

## 🧪 Como Testar

### Teste Manual

```powershell
# Terminal 1: Backend
cd api
dotnet run

# Terminal 2: Frontend
cd web
npm run dev

# Browser: http://localhost:3000
# Preencha formulário e envie
```

### Teste via API Direta

```powershell
# Swagger UI
https://localhost:5001/swagger

# PowerShell
Invoke-WebRequest -Uri "https://localhost:5001/api/reports" `
    -Method POST -Headers @{"Content-Type"="application/json"} `
    -Body $jsonBody -SkipCertificateCheck
```

📖 **Mais exemplos**: Veja `QUICK_START.md`

## 🐛 Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| CORS blocked | API não permite origem | Configure `Cors:AllowedOrigins` |
| Failed to fetch | API offline | Inicie a API: `dotnet run` |
| Date invalid | Formato incorreto | Use DD/MM/YYYY |
| 400 Bad Request | Validação falhou | Preencha todos os campos obrigatórios |

📖 **Troubleshooting completo**: Veja `QUICK_START.md` ou `api-integration.md`

## 🚀 Próximos Passos

### Para Desenvolvedores

1. ✅ Complete o checklist: `INTEGRATION_CHECKLIST.md`
2. 📖 Leia a documentação técnica: `api-integration.md`
3. 🧪 Implemente testes automatizados
4. 🎨 Adicione melhorias de UX

### Para Deploy

1. Configure variáveis de ambiente no Azure
2. Adicione domínios aos CORS allowed origins
3. Configure Application Insights
4. Execute pipeline de CI/CD

📖 **Guia de deploy**: Veja `api-integration.md` seção "Deploy"

## 📞 Suporte

- 📖 Documentação: Esta pasta `docs/`
- 💬 Discord: Canal do projeto
- 🐛 Issues: GitHub Issues
- 📧 Email: Equipe SafeZone

## 🎓 Recursos de Aprendizado

- [Next.js Documentation](https://nextjs.org/docs)
- [ASP.NET Core Web API](https://learn.microsoft.com/en-us/aspnet/core/web-api/)
- [Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 📝 Changelog

### v1.0.0 (Janeiro 2025)
- ✅ Implementação inicial da integração
- ✅ Cliente HTTP completo
- ✅ Mapeamento de dados PT→EN
- ✅ Validação de campos
- ✅ Tratamento de erros
- ✅ Documentação completa
- ✅ CORS configurado
- ✅ Guias e checklists

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Completo  
**Mantenedores**: Equipe SafeZone
