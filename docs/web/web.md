# Documentação do Frontend (Web)

> **SafeZone** - Plataforma para denúncias anônimas de crimes e sensação de insegurança no Distrito Federal

---

## Índice de Navegação

1. [Visão Geral](#1-visão-geral)
   - [Objetivo](#objetivo)
   - [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
   - [`/app`](#app)
   - [`/components`](#components)
   - [`/lib`](#lib)
3. [Componentes Principais](#3-componentes-principais)
   - [Componentes de UI (reutilizáveis)](#componentes-de-ui-reutilizáveis)
   - [Componentes de Funcionalidade (features)](#componentes-de-funcionalidade-features)
4. [Gerenciamento de Estado e Dados](#4-gerenciamento-de-estado-e-dados)
   - [Estado Local (Client Components)](#estado-local-client-components)
   - [Busca de Dados (Server Components)](#busca-de-dados-server-components)
   - [Integração com a API](#integração-com-a-api)
5. [Configuração e Execução](#5-configuração-e-execução)
   - [Variáveis de Ambiente](#variáveis-de-ambiente)
   - [Execução Local](#execução-local)
6. [Deploy](#7-deploy)
   - [Fluxo de CI/CD](#fluxo-de-cicd)

---

## 1. Visão Geral

### Objetivo

O frontend do **SafeZone** é uma aplicação web moderna que permite aos cidadãos do Distrito Federal reportarem crimes e sensação de insegurança de forma **anônima e segura**. A plataforma oferece:

- 📝 **Formulário de Denúncias** - Sistema multi-step com validação avançada
- 🗺️ **Mapa Interativo** - Visualização de denúncias georeferenciadas
- 📊 **Dashboards** (em desenvolvimento) - Estatísticas de segurança pública
- 👥 **Página Institucional** - Informações sobre o projeto e equipe

### Arquitetura e Tecnologias

**Stack Tecnológica:**

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js** | 15.5.4 | Framework React com SSR/SSG e App Router |
| **React** | 19.1.0 | Biblioteca para construção de interfaces |
| **TypeScript** | 5.x | Superset tipado do JavaScript |
| **Tailwind CSS** | 4.x | Framework CSS utility-first |
| **Framer Motion** | 12.23.24 | Biblioteca de animações |
| **Leaflet** | 1.9.4 | Mapas interativos open-source |
| **React Leaflet** | 5.0.0 | Componentes React para Leaflet |
| **React Icons** | 5.5.0 | Biblioteca de ícones vetoriais |

**Arquitetura:**

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Browser)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐      ┌──────────────────┐             │
│  │ Server Components│      │ Client Components│             │
│  │  - layout.tsx   │      │  - page.tsx      │             │
│  │  (renderizado   │      │  - denuncia.tsx  │             │
│  │   no servidor)  │      │  - navbar.tsx    │             │
│  └────────┬────────┘      │  - map.tsx       │             │
│           │               │  (interatividade)│             │
│           └───────────────┴────────┬─────────┘             │
│                                    │                        │
└────────────────────────────────────┼────────────────────────┘
                                     │
                                     ↓
                    ┌────────────────────────────┐
                    │    Custom Hooks Layer      │
                    │  - useReportSubmission     │
                    │    (validação + estado)    │
                    └──────────┬─────────────────┘
                               │
                               ↓
                    ┌────────────────────────────┐
                    │     Utils Layer            │
                    │  - form-mappers.ts         │
                    │  - date-utils.ts           │
                    └──────────┬─────────────────┘
                               │
                               ↓
                    ┌────────────────────────────┐
                    │    API Client Layer        │
                    │  - ReportsClient class     │
                    │  - types.ts (interfaces)   │
                    └──────────┬─────────────────┘
                               │
                               ↓ HTTP POST/GET
                    ┌────────────────────────────┐
                    │      .NET API Backend      │
                    │   /api/reports (REST)      │
                    └──────────┬─────────────────┘
                               │
                               ↓
                    ┌────────────────────────────┐
                    │      Azure Cosmos DB       │
                    │    (NoSQL Database)        │
                    └────────────────────────────┘
```

**Padrão de Renderização:**

- **Server Components** (padrão): Renderizados no servidor, reduzem bundle JavaScript
  - Exemplo: `app/layout.tsx` - Configuração de fontes e estrutura HTML base
  
- **Client Components** (`'use client'`): Renderizados no navegador, permitem interatividade
  - Exemplo: `app/page.tsx`, `app/components/denuncia/denuncia.tsx`, `app/components/navbar/navbar.tsx`

**Fluxo de Dados:**

1. **Usuário** preenche formulário em `denuncia.tsx`
2. **Hook** `useReportSubmission` valida dados usando `date-utils.ts`
3. **Mappers** transformam dados do formulário para formato da API (`form-mappers.ts`)
4. **API Client** envia requisição HTTP POST para `.NET API`
5. **API** persiste no Cosmos DB e retorna resposta
6. **UI** atualiza com feedback (sucesso/erro)

---

## 2. Estrutura de Pastas

```
web/
├── app/                      # App Router (Next.js 15)
│   ├── components/           # Componentes de UI
│   │   ├── denuncia/         # Modal de denúncia (formulário multi-step)
│   │   │   └── denuncia.tsx  # ~763 linhas - 6 steps com validação
│   │   ├── map/              # Mapa interativo
│   │   │   └── map.tsx       # Leaflet com marcadores animados
│   │   ├── memberCard/       # Cards da equipe
│   │   │   └── memberCard.tsx # Grid responsivo com efeito 3D
│   │   └── navbar/           # Barra de navegação
│   │       └── navbar.tsx    # Navegação com detecção de rota ativa
│   ├── sobre/                # Página "Sobre" (route group)
│   │   └── page.tsx          # Informações do projeto e equipe
│   ├── layout.tsx            # Layout raiz (Server Component)
│   ├── page.tsx              # Página inicial (Client Component)
│   └── globals.css           # Estilos globais (Tailwind + CSS vars)
├── lib/                      # Lógica de negócio e utilitários
│   ├── api/                  # Cliente HTTP e tipos da API
│   │   ├── index.ts          # Exportações centralizadas
│   │   ├── reports-client.ts # Classe ReportsClient (~160 linhas)
│   │   └── types.ts          # Interfaces TypeScript da API
│   ├── hooks/                # Custom React Hooks
│   │   ├── index.ts          # Exportações de hooks
│   │   └── use-report-submission.ts # Hook de submissão (~130 linhas)
│   └── utils/                # Funções utilitárias puras
│       ├── date-utils.ts     # Conversão DD/MM/YYYY → ISO 8601
│       └── form-mappers.ts   # Transformação de dados do formulário
├── public/                   # Assets estáticos
│   ├── logo2.svg             # Logo principal
│   ├── raposa.svg            # Mascote SafeZone
│   └── leaflet/              # Ícones do Leaflet
├── .env.local                # Variáveis de ambiente (ignorado pelo Git)
├── eslint.config.mjs         # Configuração ESLint
├── next.config.ts            # Configuração Next.js
├── package.json              # Dependências e scripts
├── postcss.config.mjs        # Configuração PostCSS (Tailwind)
├── tsconfig.json             # Configuração TypeScript
└── README.md                 # Documentação básica
```

### `/app`

Diretório principal do **App Router** do Next.js 15. Cada pasta representa uma rota:

- **`page.tsx`** - Define a página da rota
- **`layout.tsx`** - Define o layout compartilhado
- **`components/`** - Componentes específicos da aplicação

**Rotas Implementadas:**

| Rota | Arquivo | Tipo | Descrição |
|------|---------|------|-----------|
| `/` | `app/page.tsx` | Client | Página inicial (mapa + animações) |
| `/sobre` | `app/sobre/page.tsx` | Client | Sobre o projeto e equipe |
| `/dashboards` | (não implementado) | - | Futuro: estatísticas |

### `/components`

Componentes React reutilizáveis organizados por funcionalidade:

**Estrutura:**
```
app/components/
├── denuncia/        # Feature completa de denúncia
│   └── denuncia.tsx # Modal com 6 steps + validação
├── map/             # Feature de mapas
│   └── map.tsx      # Integração Leaflet
├── memberCard/      # UI de apresentação de equipe
│   └── memberCard.tsx
└── navbar/          # UI de navegação global
    └── navbar.tsx
```

**Convenção:**
- Componentes **Client** (`'use client'`): Todos os componentes em `/components` são Client Components
- 1 componente por pasta quando há potencial para expansão
- Nome do arquivo = nome do componente (lowercase)

### `/lib`

Lógica de negócio separada dos componentes visuais:

**`/lib/api/`** - Camada de comunicação com backend:
- `reports-client.ts` - Classe `ReportsClient` com métodos HTTP
- `types.ts` - Interfaces TypeScript (request/response)
- `index.ts` - Exportações centralizadas

**`/lib/hooks/`** - Custom React Hooks:
- `use-report-submission.ts` - Gerencia fluxo completo de submissão

**`/lib/utils/`** - Funções utilitárias puras:
- `date-utils.ts` - Validação e conversão de datas
- `form-mappers.ts` - Transformação de dados

---

## 3. Componentes Principais

### Componentes de UI (reutilizáveis)

#### **3.1 Navbar**

**Localização:** `app/components/navbar/navbar.tsx` (~60 linhas)  
**Tipo:** Client Component  
**Responsabilidade:** Navegação global da aplicação

**Props:**
```typescript
interface NavbarProps {
  onOpenDenuncia?: () => void; // Callback opcional para abrir modal
}
```

**Funcionalidades:**
- ✅ **Navegação Principal:** 3 links (Início, Sobre, Dashboards)
- ✅ **Rota Ativa:** Destaque visual com borda cyan (`usePathname()`)
- ✅ **Modal Integrado:** Controla `DenunciaModal` com estado local
- ✅ **Estilização:** Gradiente de fundo + efeitos hover

**Código Real:**
```tsx
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { DenunciaModal } from '@/app/components/denuncia/denuncia';

interface NavbarProps {
  onOpenDenuncia?: () => void;
}

export default function Navbar({ onOpenDenuncia }: NavbarProps) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const links = [
    { href: '/', label: 'Início' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/dashboards', label: 'Dashboards' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex justify-between items-center">
      <div className="flex gap-8">
        {links.map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`
              text-white hover:text-cyan-400 transition-colors
              ${pathname === link.href ? 'border-b-2 border-cyan-400' : ''}
            `}
          >
            {link.label}
          </Link>
        ))}
      </div>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Fazer Denúncia
      </button>
      
      <DenunciaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav>
  );
}
```

**Uso:**
```tsx
import Navbar from '@/app/components/navbar/navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
```

---

#### **3.2 MemberCard**

**Localização:** `app/components/memberCard/memberCard.tsx` (~110 linhas)  
**Tipo:** Client Component  
**Responsabilidade:** Exibir equipe de desenvolvimento em grid responsivo

**Props:** Nenhuma (dados hardcoded)

**Funcionalidades:**
- ✅ **Grid Responsivo:** 1 coluna (mobile) → 2 (tablet) → 3 (desktop)
- ✅ **Efeito 3D:** Rotação ao hover usando CSS `perspective`
- ✅ **Avatares:** Imagens otimizadas do GitHub (`next/image`)
- ✅ **Links Sociais:** LinkedIn e GitHub (React Icons)

**Estrutura de Dados:**
```typescript
const members = [
  {
    name: "André Belarmino",
    role: "Desenvolvedor Full Stack",
    src: "https://avatars.githubusercontent.com/u/168923024?v=4",
    linkedin: "https://www.linkedin.com/in/...",
    github: "https://github.com/andrehsb",
  },
  // ... 10 membros adicionais
];
```

**Código Real (Card Individual):**
```tsx
<div className="group [perspective:1000px]">
  <div className="
    relative bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl p-10
    flex flex-col items-center text-center
    transition-transform duration-500 ease-out
    group-hover:rotate-x-6 group-hover:-rotate-y-6 group-hover:shadow-2xl
  ">
    {/* Avatar */}
    <div className="relative w-40 h-40 mb-6">
      <Image
        src={member.src}
        alt={member.name}
        fill
        className="object-cover rounded-full shadow-md"
      />
    </div>

    {/* Nome e Cargo */}
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
      {member.name}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      {member.role}
    </p>

    {/* Links Sociais */}
    <div className="flex gap-4 text-2xl text-gray-600 dark:text-gray-300">
      <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
         className="hover:text-blue-600 transition-colors">
        <FaLinkedin />
      </a>
      <a href={member.github} target="_blank" rel="noopener noreferrer"
         className="hover:text-gray-800 dark:hover:text-white transition-colors">
        <FaGithub />
      </a>
    </div>

    {/* Overlay Gradient */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 
                    transition-opacity duration-500 bg-gradient-to-br from-blue-400/40 
                    to-transparent pointer-events-none" />
  </div>
</div>
```

**Grid Completo:**
```tsx
<section className="w-full py-16 px-[114px] bg-gray-50 dark:bg-[#111]">
  <h2 className="text-3xl font-bold text-center mb-10">
    Equipe de Desenvolvimento
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">
    {members.map((member, index) => (
      <div key={index}>
        {/* Card individual aqui */}
      </div>
    ))}
  </div>
</section>
```

---

#### **3.3 MapaDepoimentos**

**Localização:** `app/components/map/map.tsx` (~140 linhas)  
**Tipo:** Client Component  
**Responsabilidade:** Mapa interativo com marcadores de denúncias

**Props:**
```typescript
interface MapaDepoimentosProps {
  hideMarkers?: boolean;  // Oculta marcadores (padrão: false)
  hideTitle?: boolean;    // Oculta título (padrão: false)
  height?: string;        // Altura CSS (padrão: "100%")
}
```

**Funcionalidades:**
- ✅ **Mapa Base:** Leaflet com tema CartoDB Dark Mode
- ✅ **Marcadores Customizados:** Ícones circulares com animação de pulso
- ✅ **Popups:** Informações ao clicar em marcadores
- ✅ **Controle de Zoom:** Desabilitado por padrão, ativa ao hover
- ✅ **Centro:** Brasília (-15.7801, -47.9292)

**⚠️ IMPORTANTE - Importação Dinâmica Obrigatória:**

Leaflet depende de `window`, que não existe no servidor. Use `dynamic()`:

```tsx
// Em qualquer página que use o mapa
import dynamic from 'next/dynamic';

const MapaDepoimentos = dynamic(
  () => import('@/app/components/map/map'),
  { 
    ssr: false, // OBRIGATÓRIO: desabilita SSR
    loading: () => <p>Carregando mapa...</p> // Opcional
  }
);

export default function Page() {
  return <MapaDepoimentos height="600px" />;
}
```

**Código Real:**
```tsx
'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix para ícones do Leaflet no Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

export default function MapaDepoimentos({ 
  hideMarkers = false, 
  hideTitle = false, 
  height = "100%" 
}: MapaDepoimentosProps) {
  
  const depoimentos = [
    { id: 1, pos: [-15.7801, -47.9292], cor: "#ef4444", texto: "Assédio em parada de ônibus" },
    { id: 2, pos: [-15.7101, -47.9502], cor: "#3b82f6", texto: "Carro arrombado" },
    { id: 3, pos: [-15.8601, -47.9002], cor: "#22c55e", texto: "Assalto resolvido" },
  ];

  // Criar ícone customizado com animação
  const createIcon = (color: string) => L.divIcon({
    className: 'custom-marker',
    html: `
      <span style="
        background:${color};
        width:16px; height:16px;
        border-radius:50%;
        box-shadow:0 0 15px ${color};
        animation:pulse 2s infinite;
        display:inline-block;
      "></span>
    `
  });

  // Injetar CSS de animação
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.4); opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="w-full" style={{ height }}>
      {!hideTitle && (
        <h2 className="text-3xl font-semibold mb-4 text-center text-white">
          Mapa de Depoimentos
        </h2>
      )}

      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={10}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        className="w-full h-full rounded-lg"
      >
        <EnableZoomOnHover /> {/* Custom hook interno */}
        
        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {!hideMarkers && depoimentos.map(dep => (
          <Marker key={dep.id} position={dep.pos as any} icon={createIcon(dep.cor)}>
            <Popup>
              <p className="text-gray-800 font-medium">{dep.texto}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Hook customizado para ativar zoom ao hover
function EnableZoomOnHover() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const handleEnter = () => {
      map.scrollWheelZoom?.enable();
      map.doubleClickZoom?.enable();
      map.dragging?.enable();
    };

    const handleLeave = () => {
      map.scrollWheelZoom?.disable();
      map.doubleClickZoom?.disable();
      map.dragging?.disable();
    };

    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mouseleave', handleLeave);

    // Inicia desabilitado
    handleLeave();

    return () => {
      container.removeEventListener('mouseenter', handleEnter);
      container.removeEventListener('mouseleave', handleLeave);
    };
  }, [map]);

  return null;
}
```

---

### Componentes de Funcionalidade (features)

#### **3.4 DenunciaModal**

**Localização:** `app/components/denuncia/denuncia.tsx` (~763 linhas)  
**Tipo:** Client Component  
**Responsabilidade:** Formulário multi-step completo para criar denúncias

**Props:**
```typescript
interface DenunciaModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Arquitetura - 6 Steps:**

| Step | Nome | Campos | Validação |
|------|------|--------|-----------|
| **1** | Tipo de Crime | `crimeGenre`, `crimeType` | Ambos obrigatórios |
| **2** | Data e Local | `crimeDate`, `location` | Data válida (DD/MM/YYYY) |
| **3** | Detalhes | `resolved`, `description` | Ambos obrigatórios |
| **4** | Dados Opcionais | `ageGroup`, `ethnicity`, `genderIdentity`, `sexualOrientation` | Todos opcionais |
| **5** | Revisão | (exibição) | - |
| **6** | Resultado | (feedback) | - |

**Estados do Formulário:**
```typescript
const [step, setStep] = useState(1); // 1 a 6
const [crimeGenre, setCrimeGenre] = useState<string | null>(null);
const [crimeType, setCrimeType] = useState<string | null>(null);
const [crimeDate, setCrimeDate] = useState('');
const [description, setDescription] = useState('');
const [resolved, setResolved] = useState<string | null>(null); // "Sim" | "Não"
const [ageGroup, setAgeGroup] = useState<string | null>(null);
const [genderIdentity, setGenderIdentity] = useState<string | null>(null);
const [sexualOrientation, setSexualOrientation] = useState<string | null>(null);
const [ethnicity, setEthnicity] = useState<string | null>(null);
const [location, setLocation] = useState('');
const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
```

**Sistema de Validação:**

```typescript
// Validação de data DD/MM/YYYY
function isValidDate(dateString: string): boolean {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Validação por step
function validateStep(): boolean {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!crimeGenre) errors.crimeGenre = 'Selecione o gênero do crime';
    if (!crimeType) errors.crimeType = 'Selecione o tipo do crime';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  if (step === 2) {
    if (!isValidDate(crimeDate)) {
      errors.crimeDate = 'Data inválida. Use DD/MM/YYYY';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  if (step === 3) {
    if (!resolved) errors.resolved = 'Selecione se o crime foi resolvido';
    if (!description.trim()) errors.description = 'Descrição é obrigatória';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  return true; // Steps 4-6 sem validação obrigatória
}

// Controle de progresso
function canProceed(): boolean {
  return validateStep();
}
```

**Integração com API:**

```typescript
import { useReportSubmission } from '@/lib/hooks/use-report-submission';

export default function DenunciaModal({ isOpen, onClose }: DenunciaModalProps) {
  const { submitReport, isSubmitting, submitError, clearError } = useReportSubmission();

  const handleSubmit = async () => {
    const formData = {
      crimeGenre,
      crimeType,
      crimeDate,
      description,
      resolved,
      ageGroup,
      genderIdentity,
      sexualOrientation,
      ethnicity,
      location,
    };

    const result = await submitReport(formData);

    if (result.success) {
      setStep(6); // Tela de sucesso
    } else {
      // Erro já exibido via submitError
      console.error('Erro ao enviar:', result.error);
    }
  };

  // Renderização por step...
}
```

**Exemplo de Step (Step 1):**

```tsx
{step === 1 && (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">Tipo de Crime</h3>

    {/* Gênero do Crime */}
    <div>
      <label className="block mb-2 font-medium">Gênero do Crime *</label>
      <select
        value={crimeGenre || ''}
        onChange={(e) => setCrimeGenre(e.target.value)}
        className={`w-full p-3 border rounded-lg ${
          validationErrors.crimeGenre ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Selecione...</option>
        <option value="Furto">Furto</option>
        <option value="Roubo">Roubo</option>
        <option value="Assédio Sexual">Assédio Sexual</option>
        {/* ... mais opções */}
      </select>
      {validationErrors.crimeGenre && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.crimeGenre}</p>
      )}
    </div>

    {/* Tipo do Crime */}
    <div>
      <label className="block mb-2 font-medium">Tipo do Crime *</label>
      <select
        value={crimeType || ''}
        onChange={(e) => setCrimeType(e.target.value)}
        className={`w-full p-3 border rounded-lg ${
          validationErrors.crimeType ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Selecione...</option>
        <option value="Celular">Celular</option>
        <option value="Carteira">Carteira</option>
        <option value="Veículo">Veículo</option>
        {/* ... mais opções */}
      </select>
      {validationErrors.crimeType && (
        <p className="text-red-500 text-sm mt-1">{validationErrors.crimeType}</p>
      )}
    </div>

    {/* Botões de navegação */}
    <div className="flex justify-between mt-6">
      <button
        onClick={onClose}
        className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
      >
        Cancelar
      </button>
      <button
        onClick={() => {
          if (canProceed()) {
            setStep(2);
          }
        }}
        disabled={!canProceed()}
        className={`px-6 py-2 rounded-lg ${
          canProceed()
            ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Próximo
      </button>
    </div>
  </div>
)}
```

**Feedback Visual:**
- ✅ **Loading State:** Botão desabilitado com texto "Enviando..." durante `isSubmitting`
- ✅ **Erros:** Bordas vermelhas + mensagens abaixo dos campos
- ✅ **Desabilitação:** Botão "Próximo" desabilitado quando `!canProceed()`
- ✅ **Tela de Sucesso/Erro:** Step 6 com ícones (FiCheckCircle/FiXCircle)

---

## 4. Gerenciamento de Estado e Dados

### Estado Local (Client Components)

A aplicação utiliza **estado local** com React Hooks. Não há biblioteca de gerenciamento de estado global (Redux, Zustand, etc.).

**Padrões Identificados:**

| Componente | Estados | Finalidade |
|------------|---------|------------|
| **Navbar** | `isModalOpen` | Controla visibilidade do modal |
| **DenunciaModal** | ~10 estados | Dados do formulário + validação + step atual |
| **Page** | `isModalOpen`, `locks` | Controle de modal + dados de animação |
| **MapaDepoimentos** | (nenhum) | Dados hardcoded (depoimentos) |

**Exemplo - Estado Simples:**
```typescript
// Navbar.tsx
const [isModalOpen, setIsModalOpen] = useState(false);
```

**Exemplo - Estado Complexo (Formulário):**
```typescript
// DenunciaModal.tsx
const [step, setStep] = useState(1);
const [crimeGenre, setCrimeGenre] = useState<string | null>(null);
const [crimeType, setCrimeType] = useState<string | null>(null);
const [crimeDate, setCrimeDate] = useState('');
const [description, setDescription] = useState('');
const [resolved, setResolved] = useState<string | null>(null);
// ... mais 5 estados opcionais
const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
```

**Comunicação Entre Componentes:**
- **Prop Drilling:** Usado para componentes próximos
  ```tsx
  <Navbar onOpenDenuncia={() => setModalOpen(true)} />
  ```
- **Callback Props:** Funções passadas de pai para filho
  ```tsx
  <DenunciaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
  ```

---

### Busca de Dados (Server Components)

**Status Atual:** Não implementado (sem fetching de dados do servidor em Server Components)

**Padrão Recomendado (Futuro):**

```tsx
// app/page.tsx (Server Component)
async function getReports() {
  const res = await fetch('https://api.safezone.com/reports', {
    cache: 'no-store' // ou 'force-cache', 'revalidate'
  });
  return res.json();
}

export default async function HomePage() {
  const reports = await getReports();

  return (
    <div>
      <h1>Denúncias Recentes</h1>
      {reports.map(report => (
        <div key={report.id}>{report.description}</div>
      ))}
    </div>
  );
}
```

---

### Integração com a API

#### **4.1 Cliente HTTP - `ReportsClient`**

**Localização:** `lib/api/reports-client.ts` (~160 linhas)

**Classe Principal:**
```typescript
export class ReportsClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Métodos HTTP
  async createReport(request: CreateReportRequest): Promise<ReportResponse>
  async getAllReports(): Promise<ReportResponse[]>
  async getReportById(id: string): Promise<ReportResponse | null>
  async getReportsByCrimeGenre(crimeGenre: string): Promise<ReportResponse[]>
}

// Instância singleton
export const reportsClient = new ReportsClient();
```

**Configuração:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5206';
```

**Método `createReport` (código real):**
```typescript
async createReport(request: CreateReportRequest): Promise<ReportResponse> {
  try {
    const response = await fetch(`${this.baseUrl}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Failed to parse error response',
      }));

      throw new ApiResponseError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data: ReportResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }

    // Erros de rede ou outros erros inesperados
    throw new ApiResponseError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0
    );
  }
}
```

**Classe de Erro Customizada:**
```typescript
export class ApiResponseError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public apiError?: ApiError
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}
```

---

#### **4.2 Tipos TypeScript**

**Localização:** `lib/api/types.ts`

**Interfaces de Requisição:**
```typescript
export interface CreateReportRequest {
  crimeGenre: string;
  crimeType: string;
  description: string;
  location: string;
  crimeDate: string; // ISO 8601 format
  reporterDetails?: ReporterDetailsRequest | null;
  resolved: boolean;
}

export interface ReporterDetailsRequest {
  ageGroup?: string | null;
  ethnicity?: string | null;
  genderIdentity?: string | null;
  sexualOrientation?: string | null;
}
```

**Interfaces de Resposta:**
```typescript
export interface ReportResponse {
  id: string;
  crimeGenre: string;
  crimeType: string;
  description: string;
  location: string;
  crimeDate: string;
  reporterDetails?: ReporterDetailsResponse | null;
  createdDate: string;
  resolved: boolean;
}

export interface ApiError {
  error?: string;
  traceId?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

#### **4.3 Custom Hook - `useReportSubmission`**

**Localização:** `lib/hooks/use-report-submission.ts` (~130 linhas)

**Interface:**
```typescript
interface ReportFormData {
  crimeGenre: string | null;
  crimeType: string | null;
  crimeDate: string; // DD/MM/YYYY
  description: string;
  resolved: string | null; // "Sim" | "Não"
  ageGroup: string | null;
  genderIdentity: string | null;
  sexualOrientation: string | null;
  ethnicity: string | null;
  location: string;
}

interface SubmissionResult {
  success: boolean;
  error?: string;
}

function useReportSubmission(): {
  submitReport: (formData: ReportFormData) => Promise<SubmissionResult>;
  isSubmitting: boolean;
  submitError: string | null;
  clearError: () => void;
}
```

**Código Completo:**
```typescript
'use client'

import { useState } from 'react';
import { reportsClient, ApiResponseError } from '@/lib/api';
import { convertToIsoDate } from '@/lib/utils/date-utils';
import { mapFormDataToApiRequest } from '@/lib/utils/form-mappers';

export function useReportSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clearError = () => {
    setSubmitError(null);
  };

  const submitReport = async (formData: ReportFormData): Promise<SubmissionResult> => {
    setIsSubmitting(true);
    setSubmitError(null);

    console.log('🚀 Iniciando submissão...');
    console.log('📊 Form Data:', formData);

    try {
      // 1. Validar e converter data
      const isoDate = convertToIsoDate(formData.crimeDate);
      if (!isoDate) {
        const errorMessage = 'Data inválida. Use DD/MM/YYYY.';
        setSubmitError(errorMessage);
        setIsSubmitting(false);
        return { success: false, error: errorMessage };
      }

      // 2. Mapear dados para formato da API
      const requestData = mapFormDataToApiRequest({
        ...formData,
        crimeDate: isoDate, // Sobrescrever com ISO 8601
      });

      console.log('📤 Enviando para API:', requestData);

      // 3. Enviar para API
      await reportsClient.createReport(requestData);
      
      console.log('✅ Denúncia enviada com sucesso!');

      setIsSubmitting(false);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao enviar:', error);

      let errorMessage: string;

      if (error instanceof ApiResponseError) {
        // Erro da API com detalhes
        if (error.apiError?.errors && error.apiError.errors.length > 0) {
          errorMessage = error.apiError.errors
            .map(e => `${e.field}: ${e.message}`)
            .join('; ');
        } else {
          errorMessage = error.message || 'Erro ao enviar denúncia.';
        }
      } else {
        // Erro de rede ou desconhecido
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      setSubmitError(errorMessage);
      setIsSubmitting(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    submitReport,
    isSubmitting,
    submitError,
    clearError,
  };
}
```

**Fluxo Completo:**
```
1. submitReport(formData) chamado
   ↓
2. convertToIsoDate(crimeDate) - valida DD/MM/YYYY → ISO 8601
   ↓ (se inválido, retorna erro imediatamente)
3. mapFormDataToApiRequest() - transforma estrutura de dados
   ↓
4. reportsClient.createReport() - POST /api/reports
   ↓
5. Retorna { success: true } OU { success: false, error: "mensagem" }
```

---

#### **4.4 Utilitários de Transformação**

**`date-utils.ts` - Conversão de Datas:**

```typescript
/**
 * Converte DD/MM/YYYY → ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function convertToIsoDate(dateString: string): string | null {
  if (!dateString || dateString.length < 10) return null;

  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);

  // Validação básica
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;

  // Criar data UTC
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  // Verificar se a data é válida (ex: 31/02 seria inválida)
  if (
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCFullYear() !== year
  ) {
    return null;
  }

  return date.toISOString(); // "2024-01-15T00:00:00.000Z"
}

/**
 * Valida formato DD/MM/YYYY
 */
export function isValidDateString(dateString: string): boolean {
  return convertToIsoDate(dateString) !== null;
}
```

**`form-mappers.ts` - Mapeamento de Dados:**

```typescript
import type { CreateReportRequest } from '@/lib/api/types';

export function mapFormDataToApiRequest(formData: Partial<any>): CreateReportRequest {
  return {
    crimeGenre: formData.crimeGenre || '',
    crimeType: formData.crimeType || '',
    description: formData.description || '',
    location: formData.location || '',
    crimeDate: formData.crimeDate || '', // Já em ISO 8601
    resolved: formData.resolved === 'Sim', // String → Boolean
    reporterDetails: formData.ageGroup || formData.genderIdentity || 
                     formData.sexualOrientation || formData.ethnicity
      ? {
          ageGroup: formData.ageGroup || null,
          ethnicity: formData.ethnicity || null,
          genderIdentity: formData.genderIdentity || null,
          sexualOrientation: formData.sexualOrientation || null,
        }
      : null,
  };
}
```

**⚠️ IMPORTANTE:**
- ❌ **Não traduz valores** - Valores como "Furto", "Roubo" permanecem em **português**
- ✅ **Apenas mapeia estrutura** - Transforma de formato de formulário para formato da API
- ✅ **Conversão de tipos** - `resolved` string → boolean, datas DD/MM/YYYY → ISO 8601

---

## 5. Configuração e Execução

### Variáveis de Ambiente

**Arquivo:** `.env.local` (raiz de `web/`)

**⚠️ Nunca commite este arquivo!** Ele está no `.gitignore`.

**Estrutura Obrigatória:**

```bash
# URL base da API .NET
# Prefixo NEXT_PUBLIC_ permite acesso no browser (Client Components)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5206
```

**Valores por Ambiente:**

| Ambiente | Valor | Descrição |
|----------|-------|-----------|
| **Desenvolvimento Local** | `http://localhost:5206` | API .NET rodando localmente (`dotnet run`) |
| **Produção** | `https://safezone-api.azurewebsites.net` | API .NET no Azure App Service |

**Como Usar no Código:**

```typescript
// lib/api/reports-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5206';

console.log('API URL:', API_BASE_URL); // Funciona em Client Components
```

**⚠️ Importante:**
- Variáveis com `NEXT_PUBLIC_` são **incluídas no bundle** do navegador
- Não armazene **secrets** ou **chaves privadas** com este prefixo
- Para dados sensíveis, use variáveis de ambiente do servidor (sem `NEXT_PUBLIC_`)

---

### Execução Local

#### **Pré-requisitos**

| Ferramenta | Versão Mínima | Recomendado | Verificação |
|------------|---------------|-------------|-------------|
| **Node.js** | 18.x | 20.x | `node -v` |
| **npm** | 9.x | 10.x | `npm -v` |
| **Git** | 2.x | Última | `git --version` |

#### **Passo a Passo**

**1. Clonar Repositório:**
```bash
git clone https://github.com/jj-viana/safe-zone.git
cd safe-zone/web
```

**2. Instalar Dependências:**
```bash
npm ci
# Usa package-lock.json para instalação determinística
# Mais rápido e confiável que npm install
```

**3. Configurar Variáveis de Ambiente:**
```bash
# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5206" > .env.local

# OU copiar do template (se existir)
cp .env.example .env.local
```

**4. Verificar API Backend:**

Antes de rodar o frontend, certifique-se que a API está rodando:

```bash
# Em outro terminal, na pasta /api
cd ../api
dotnet run
# API deve estar em http://localhost:5206
```

**5. Rodar em Desenvolvimento:**
```bash
npm run dev
```

Acesse: **http://localhost:3000**

**Saída Esperada:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
○ Compiling / ...
✓ Compiled / in 1.2s (763 modules)
```

---

#### **Scripts Disponíveis**

**Arquivo:** `package.json`

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Descrição dos Comandos:**

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `npm run dev` | Inicia servidor de desenvolvimento com Turbopack (hot reload) | Desenvolvimento diário |
| `npm run build` | Gera build de produção otimizado | Antes de deploy |
| `npm start` | Roda build de produção localmente (requer `npm run build` antes) | Testar build localmente |
| `npm run lint` | Executa ESLint para verificar problemas de código | Antes de commit |

---

#### **Checklist de Inicialização**

- [ ] Node.js v20 instalado
- [ ] Dependências instaladas (`npm ci`)
- [ ] Arquivo `.env.local` criado com `NEXT_PUBLIC_API_BASE_URL`
- [ ] API .NET rodando em `http://localhost:5206` (verificar com `curl http://localhost:5206/api/reports`)
- [ ] `npm run dev` executado com sucesso
- [ ] Navegador aberto em `http://localhost:3000`
- [ ] Página inicial carregando corretamente
- [ ] Console do navegador sem erros (F12 → Console)

---

#### **Troubleshooting Inicial**

**Problema:** `Module not found: Can't resolve '@/lib/...'`

**Solução:** Verificar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Problema:** `CORS Error` ao chamar API

**Solução:** Configurar CORS na API .NET (`api/Program.cs`):
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowFrontend");
```

**Problema:** `Window is not defined` (erro com Leaflet)

**Solução:** Usar importação dinâmica:
```tsx
import dynamic from 'next/dynamic';

const MapaDepoimentos = dynamic(() => import('@/app/components/map/map'), {
  ssr: false
});
```

**Problema:** Turbopack não funciona

**Solução:** Remover `--turbopack` do script:
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

## 6. Deploy

### Fluxo de CI/CD

#### **Plataforma:** Azure Static Web Apps

**GitHub Actions Workflow** - `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
      - development
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./web
      
      - name: Run ESLint
        run: npm run lint
        working-directory: ./web
        continue-on-error: true
      
      - name: Build
        run: npm run build
        working-directory: ./web
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.NEXT_PUBLIC_API_BASE_URL }}
      
      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: 'web'
          output_location: '.next'
          skip_app_build: true
```

---

#### **Configuração Azure**

**1. Criar Static Web App:**

```bash
az staticwebapp create \
  --name safezone-frontend \
  --resource-group safe-zone-rg \
  --location brazilsouth \
  --branch main \
  --app-location "web" \
  --output-location ".next"
```

**2. Adicionar Secrets no GitHub:**

| Secret | Valor | Como Obter |
|--------|-------|------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Token do Azure | Portal Azure → Static Web App → Manage deployment token |
| `NEXT_PUBLIC_API_BASE_URL` | URL da API prod | `https://safezone-api.azurewebsites.net` |

**3. Variáveis de Ambiente no Azure:**

Portal Azure → Static Web App → Configuration:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://safezone-api.azurewebsites.net` |

---

#### **Ambientes**

| Branch | Ambiente | URL |
|--------|----------|-----|
| `main` | Produção | https://safezone.azurestaticapps.net |
| `development` | Staging | https://dev.safezone.azurestaticapps.net |
| PRs | Preview | https://pr-{número}.safezone.azurestaticapps.net |

---

#### **Build Local de Produção**

```bash
# 1. Configurar env de produção
export NEXT_PUBLIC_API_BASE_URL=https://safezone-api.azurewebsites.net

# 2. Build
npm run build

# 3. Rodar localmente
npm start

# 4. Testar em http://localhost:3000
```

**Otimizações Automáticas:**
- ✅ Code Splitting
- ✅ Tree Shaking
- ✅ Minificação
- ✅ Image Optimization
- ✅ Font Optimization

---

#### **Monitoramento**

**Logs em Tempo Real:**

```bash
az staticwebapp logs tail \
  --name safezone-frontend \
  --resource-group safe-zone-rg
```

**Métricas Recomendadas (Application Insights):**

| Métrica | Alerta |
|---------|--------|
| Page Load Time | > 3s |
| API Call Duration | > 2s |
| Error Rate | > 5% |

---

#### **Checklist de Deploy**

**Antes:**
- [ ] Testes passando
- [ ] Lint sem erros
- [ ] Build local OK
- [ ] Vars de ambiente configuradas
- [ ] API backend em produção
- [ ] CORS configurado

**Após:**
- [ ] URL acessível
- [ ] Formulário funcionando
- [ ] Mapa carregando
- [ ] Console sem erros
- [ ] Lighthouse > 80