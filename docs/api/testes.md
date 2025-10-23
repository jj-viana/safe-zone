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

### Fluxo de Funcionamento

O fluxo de trabalho de CI/CD é baseado nas branches (`feature`, `development` e `main`) e é totalmente orquestrado pelo **GitHub Actions**. O processo é dividido em dois momentos de validação e um de entrega final:

#### 1. Validação em Feature (Integração Contínua - CI)

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

#### 2. Lançamento e Implantação Contínua (CD)

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

### 1. Funções Create

### 2. Funções Delete

### 3. Funções Get

### 4. Funções Update

---

## Service
