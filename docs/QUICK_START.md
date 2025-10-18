# 🚀 Quick Start: Testando a Integração Frontend-Backend

Este guia rápido mostra como testar a integração da API com o formulário de denúncias.

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Configurar o Backend (.NET API)

```powershell
# Navegue até a pasta da API
cd c:\Programacao\MDS\safe-zone\api

# Configure a connection string do Cosmos DB em appsettings.Development.json
# (ou use o emulador do Cosmos DB local)

# Restaure as dependências
dotnet restore

# Execute a API
dotnet run
```

✅ A API deve iniciar em `https://localhost:5001`  
✅ Acesse `https://localhost:5001/swagger` para ver a documentação

### 2️⃣ Configurar o Frontend (Next.js)

```powershell
# Navegue até a pasta web
cd c:\Programacao\MDS\safe-zone\web

# Crie o arquivo de variáveis de ambiente
copy .env.example .env.local

# Abra .env.local e confirme:
# API_BASE_URL=https://localhost:5001

# Instale as dependências (se necessário)
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

✅ O frontend deve iniciar em `http://localhost:3000`

### 3️⃣ Testar a Integração

1. Abra `http://localhost:3000` no navegador
2. Clique no botão **"Fazer Denúncia"**
3. Preencha o formulário:

**Etapa 1: Informações Básicas**
- Tipo de relato: Crime
- Natureza: Assalto ou tentativa de assalto

**Etapa 2: Quando e Onde**
- Data: 15/01/2025
- Local: (use o mapa ou deixe o padrão)

**Etapa 3: Resolução e Depoimento**
- Situação resolvida: Não
- Depoimento: "Teste de integração"

**Etapa 4 e 5: Informações Opcionais**
- Preencha conforme desejar (ou pule)

4. Clique em **"Enviar"**
5. ✅ Você deve ver a mensagem de sucesso!

### 4️⃣ Verificar no Cosmos DB

Acesse o Azure Portal ou Cosmos DB Emulator e verifique:
- Database: `IncidentReportsDb`
- Container: `incidentReports`
- Um novo documento foi criado com seus dados

## 🔍 Troubleshooting Rápido

### Problema: "Access blocked by CORS"

**Sintoma**: 
```
Access to fetch at 'https://localhost:5001/api/reports' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Solução**:
1. Verifique se `appsettings.Development.json` tem:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://localhost:3000"
    ]
  }
}
```

2. Reinicie a API: `dotnet run`

### Problema: "Failed to fetch"

**Sintoma**: Erro de rede ao enviar formulário

**Soluções**:
1. ✅ Confirme que a API está rodando (`https://localhost:5001`)
2. ✅ Teste a API diretamente: `https://localhost:5001/swagger`
3. ✅ Verifique o `.env.local`: `API_BASE_URL=https://localhost:5001`

### Problema: Certificado SSL inválido

**Sintoma**: `net::ERR_CERT_AUTHORITY_INVALID`

**Solução**:
1. Acesse `https://localhost:5001` no navegador
2. Aceite o certificado auto-assinado
3. Recarregue a página do formulário

### Problema: Campos obrigatórios não preenchidos

**Sintoma**: 
```
Erro de validação: description: The description field is required
```

**Solução**:
- Preencha todos os campos obrigatórios:
  - Tipo de relato
  - Natureza da ocorrência
  - Data (formato DD/MM/YYYY)
  - Depoimento
  - Situação resolvida

## 📊 Testando Endpoints Específicos

### Via Swagger (recomendado)

1. Acesse `https://localhost:5001/swagger`
2. Expanda `POST /api/reports`
3. Clique em "Try it out"
4. Use este JSON de exemplo:

```json
{
  "crimeGenre": "crime",
  "crimeType": "robbery",
  "description": "Teste via Swagger",
  "location": "Brasília, DF",
  "crimeDate": "2025-01-15T10:30:00Z",
  "reporterDetails": {
    "ageGroup": "18-29",
    "ethnicity": "mixed",
    "genderIdentity": "cisgender-man",
    "sexualOrientation": "heterosexual"
  },
  "resolved": false
}
```

5. Execute e verifique a resposta `201 Created`

### Via PowerShell

```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    crimeGenre = "crime"
    crimeType = "robbery"
    description = "Teste via PowerShell"
    location = "Brasília, DF"
    crimeDate = "2025-01-15T10:30:00Z"
    reporterDetails = @{
        ageGroup = "18-29"
        ethnicity = "mixed"
        genderIdentity = "cisgender-man"
        sexualOrientation = "heterosexual"
    }
    resolved = $false
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://localhost:5001/api/reports" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -SkipCertificateCheck
```

### Via curl (Git Bash / WSL)

```bash
curl -X POST https://localhost:5001/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "crimeGenre": "crime",
    "crimeType": "robbery",
    "description": "Teste via curl",
    "location": "Brasília, DF",
    "crimeDate": "2025-01-15T10:30:00Z",
    "reporterDetails": {
      "ageGroup": "18-29",
      "ethnicity": "mixed",
      "genderIdentity": "cisgender-man",
      "sexualOrientation": "heterosexual"
    },
    "resolved": false
  }' \
  --insecure
```

## 🎯 Próximos Passos

Após confirmar que está funcionando:

1. 📖 Leia a documentação completa: `docs/api-integration.md`
2. 🔧 Configure para produção: `docs/INTEGRATION_SUMMARY.md`
3. ✅ Implemente melhorias sugeridas
4. 🧪 Adicione testes automatizados

## 💡 Dicas

- **Console do Navegador**: Abra DevTools (F12) para ver logs e erros
- **Network Tab**: Monitore as requisições HTTP para a API
- **Terminal da API**: Veja os logs de requisições recebidas
- **Application Insights**: Configure para monitorar em produção

---

**Tempo estimado**: 5-10 minutos  
**Pré-requisitos**: .NET 9, Node.js 18+, Cosmos DB  
**Dificuldade**: ⭐ Fácil
