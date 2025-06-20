# KIGI - Sistema Financeiro Familiar

Sistema de gerenciamento financeiro familiar desenvolvido em React com TypeScript, utilizando comunicação via webservice externo.

## Características

- ✅ **Frontend Only**: Aplicação completamente frontend usando Vite + React
- ✅ **Webservice Externo**: Comunicação via axios com API externa
- ✅ **Interface Responsiva**: Design moderno para desktop e mobile
- ✅ **Gestão Financeira**: Controle de entradas, saídas e parcelamentos
- ✅ **Código de Barras**: Leitura de produtos via código de barras
- ✅ **Relatórios**: Dashboard com resumo financeiro e transações
- ✅ **Multi-usuário**: Sistema de autenticação e perfis familiares

## Tecnologias

- **React 18** + TypeScript
- **Vite** para build e desenvolvimento
- **TanStack Query** para gerenciamento de estado
- **Axios** para requisições HTTP
- **Tailwind CSS** + shadcn/ui para interface
- **Wouter** para roteamento
- **React Hook Form** + Zod para formulários

## Configuração

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com a URL do webservice:
   ```
   VITE_API_URL=https://api.kigi.com.br
   ```

3. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Build para produção**:
   ```bash
   npm run build
   ```

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface (shadcn)
│   └── modals/         # Modais do sistema
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── service/            # Serviços de API
│   ├── api.ts          # Configuração do axios
│   └── apiService.ts   # Endpoints da API
└── types.ts            # Definições de tipos
```

## Funcionalidades

### Gestão de Usuários
- Cadastro de membros da família
- Diferentes papéis (pai, mãe, filho, filha)
- Sistema de autenticação

### Gestão Financeira
- **Entradas**: Registro de receitas
- **Saídas**: Registro de despesas
- **Parcelamentos**: Controle de pagamentos divididos
- **Empresas**: Cadastro de estabelecimentos

### Produtos
- Cadastro de produtos
- Leitura de código de barras
- Classificação e preços

### Relatórios
- Dashboard com resumo financeiro
- Saldo familiar consolidado
- Histórico de transações
- Filtros por período e categoria

## API Externa

O sistema se comunica com um webservice externo através dos seguintes endpoints:

- `POST /auth/login` - Autenticação
- `GET /usuarios` - Listar usuários
- `GET /empresas` - Listar empresas
- `GET /produtos` - Listar produtos
- `GET /entradas` - Listar entradas
- `GET /saidas` - Listar saídas
- `GET /relatorios/resumo` - Resumo financeiro
- `GET /relatorios/transacoes` - Histórico de transações

## Deployment

Para deploy em produção, execute:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor web estático.

## Desenvolvimento

- O sistema usa TanStack Query para cache inteligente das requisições
- Axios intercepta automaticamente erros 401 para logout
- Interface responsiva com suporte a touch para dispositivos móveis
- Componentes modulares seguindo padrões de design system