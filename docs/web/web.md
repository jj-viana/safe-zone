# Documentação Web - SafeZone

Este documento descreve a estrutura, tecnologias e configuração do frontend da aplicação SafeZone.

## Visão Geral

O projeto web é construído utilizando **Next.js** (App Router), focado em performance, SEO e experiência do usuário. A aplicação permite que usuários façam denúncias de forma segura e anônima, além de fornecer dashboards para visualização de dados e uma área administrativa.

## Tecnologias Utilizadas

As principais tecnologias e bibliotecas utilizadas no projeto são:

-   **Framework**: [Next.js 15](https://nextjs.org/) com React 19.
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/).
-   **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/).
-   **Autenticação**: [MSAL (Microsoft Authentication Library)](https://github.com/AzureAD/microsoft-authentication-library-for-js) para integração com Azure AD.
-   **Mapas**: [Leaflet](https://leafletjs.com/) e [React Leaflet](https://react-leaflet.js.org/).
-   **Gráficos**: [Recharts](https://recharts.org/).
-   **Ícones**: [React Icons](https://react-icons.github.io/react-icons/).
-   **Validação/Segurança**: `jose` para manipulação de JWT, `react-google-recaptcha` para proteção contra bots.

## Estrutura do Projeto

A estrutura de pastas segue o padrão do Next.js App Router:

```
web/
├── app/                    # Páginas e Layouts (App Router)
│   ├── admin/              # Área administrativa (protegida)
│   ├── components/         # Componentes reutilizáveis
│   │   ├── crime-nature-bar-chart/
│   │   ├── crime-type-line-chart/
│   │   ├── map/            # Componentes de mapa
│   │   ├── navbar/
│   │   └── ...
│   ├── dashboards/         # Páginas de visualização de dados públicos
│   ├── login/              # Página de login/redirecionamento
│   ├── sobre/              # Página institucional
│   ├── layout.tsx          # Layout principal da aplicação (RootLayout)
│   ├── page.tsx            # Página inicial (Home)
│   └── providers.tsx       # Provedores de contexto (Auth, Theme, etc.)
├── lib/                    # Lógica compartilhada e utilitários
│   ├── api/                # Clientes HTTP e definições de tipos da API
│   ├── auth/               # Configuração do MSAL e validação de tokens
│   ├── constants/          # Constantes globais (ex: regiões, tipos de crime)
│   ├── hooks/              # React Hooks customizados (ex: useReportSubmission)
│   └── utils/              # Funções utilitárias (formatação de data, mappers)
├── public/                 # Arquivos estáticos (imagens, ícones, manifestos)
├── .env.example            # Exemplo de variáveis de ambiente
├── next.config.ts          # Configurações do Next.js
├── tailwind.config.ts      # Configurações do Tailwind (se aplicável/implícito)
└── staticwebapp.config.json # Configuração de deploy para Azure Static Web Apps
```

## Configuração e Instalação

### Pré-requisitos

-   Node.js (versão 20 ou superior recomendada)
-   Gerenciador de pacotes (npm, yarn, pnpm ou bun)

### Instalação

1.  Navegue até a pasta `web`:
    ```bash
    cd web
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz da pasta `web` com as seguintes variáveis (baseado em `.env.example`):

```env
# Configurações do Azure AD B2C / Entra ID
NEXT_PUBLIC_AZURE_TENANT_ID=seu-tenant-id
NEXT_PUBLIC_AZURE_CLIENT_ID=seu-client-id
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3000/login
NEXT_PUBLIC_AZURE_API_SCOPES=api://seu-app-id/Scope

# Outras configurações
NEXT_PUBLIC_API_URL=http://localhost:7071/api # URL da API Backend
```

### Executando Localmente

Para iniciar o servidor de desenvolvimento com Turbopack (mais rápido):

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Scripts Disponíveis

-   `npm run dev`: Inicia o ambiente de desenvolvimento.
-   `npm run build`: Cria a build de produção.
-   `npm run start`: Inicia o servidor de produção.
-   `npm run lint`: Executa a verificação de linting (ESLint).

## Autenticação

A autenticação é gerenciada pelo **Azure Active Directory (Entra ID)** utilizando a biblioteca `@azure/msal-browser` e `@azure/msal-react`.

-   **Configuração**: Localizada em `lib/auth/msal-config.ts`.
-   **Fluxo**: O usuário é redirecionado para o login da Microsoft e, após o sucesso, retorna com um token de acesso.
-   **Proteção de Rotas**: Páginas como `/admin` verificam a presença de um usuário autenticado e/ou roles específicas.

## Integração com API

A comunicação com o backend é centralizada em `lib/api/`.

-   **Reports Client**: Gerencia o envio (POST) e consulta (GET) de denúncias.
-   **Tipagem**: Interfaces TypeScript (ex: `Report`, `CreateReportRequest`) garantem a integridade dos dados entre frontend e backend.

## Deploy

O projeto está configurado para deploy no **Azure Static Web Apps**.

-   **Arquivo de Configuração**: `staticwebapp.config.json` define regras de roteamento, cabeçalhos de segurança e configurações da plataforma.
-   **Build**: O comando `npm run build` gera os arquivos estáticos na pasta `.next` (ou `out` dependendo da configuração de exportação) que são servidos pelo Azure.

## Páginas e Funcionalidades

A aplicação é composta pelas seguintes páginas principais, cada uma com funcionalidades específicas:

### 1. Página Inicial (`/`)
A landing page da aplicação, projetada para ser o ponto de entrada para denúncias.
-   **Mapa Interativo**: Exibe um mapa onde usuários podem visualizar ocorrências (dependendo da implementação) ou selecionar um local para realizar uma denúncia.
-   **Animação de Fundo**: Apresenta uma animação com cadeados flutuantes (`FloatingLock`), reforçando a temática de segurança.
-   **Modal de Denúncia**: Ao interagir com o mapa, um modal (`ReportModal`) é aberto, permitindo que o usuário preencha os detalhes da ocorrência de forma anônima.

### 2. Dashboards Públicos (`/dashboards`)
Área dedicada à transparência e visualização de dados agregados das denúncias aprovadas.
-   **Gráficos Diversos**:
    -   **Demografia**: Gráficos de pizza e barras mostrando distribuição por etnia, faixa etária, identidade de gênero e orientação sexual dos denunciantes.
    -   **Criminalidade**: Gráficos de linha e barras detalhando tipos de crime e natureza das ocorrências ao longo do tempo.
-   **Filtros Avançados**: Permite filtrar os dados visualizados por:
    -   Gênero do crime (Crime/Sensação de Insegurança).
    -   Tipos específicos de crime.
    -   Regiões.
    -   Anos.

### 3. Área Administrativa (`/admin`)
Página restrita para moderadores e administradores do sistema.
-   **Gestão de Denúncias**: Lista as denúncias recebidas, organizadas em abas por status:
    -   **Rascunho (Draft)**: Novas denúncias aguardando análise.
    -   **Aprovadas (Approved)**: Denúncias validadas e visíveis nos dashboards.
    -   **Negadas (Denied)**: Denúncias rejeitadas.
-   **Moderação**: Permite visualizar detalhes de uma denúncia e realizar ações de aprovação ou rejeição.
-   **Filtragem e Busca**: Ferramentas para buscar denúncias específicas por texto, tipo, região ou data.

### 4. Sobre (`/sobre`)
Página institucional que apresenta o projeto SafeZone.
-   **Missão e Visão**: Explica o objetivo da plataforma em transformar denúncias em dados para segurança pública.
-   **Interatividade**: Possui um elemento visual interativo (mascote) com efeito 3D que reage ao movimento do mouse.
-   **Equipe**: Apresenta os membros responsáveis pelo desenvolvimento do projeto.

### 5. Login (`/login`)
Página responsável pelo fluxo de autenticação.
-   Integração com o **Azure Active Directory**.
-   Redireciona o usuário para o provedor de identidade da Microsoft e gerencia o retorno do token de acesso.
