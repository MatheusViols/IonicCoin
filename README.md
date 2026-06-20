# IonicCoin

![Ionic](https://img.shields.io/badge/Ionic-v7-3880ff?style=for-the-badge&logo=ionic&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-v18-dd0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

Uma aplicação móvel para conversão de moedas em tempo real e análise de tendências de mercado cambial. Construída com **Ionic Angular Standalone Components**.


##  Funcionalidades Principais

-  **Conversor em Tempo Real**: Conversão instantânea entre dezenas de moedas globais.
-  **Gráficos de Tendência**: Análise histórica com gráficos interativos (7D, 30D, 90D, 1A) desenhados com Chart.js.
-  **Suporte Offline First**: Guardamos localmente as últimas taxas conhecidas, permitindo conversões mesmo sem acesso à internet.
-  **Histórico de Conversões**: Registo automático de todas as consultas efetuadas para fácil consulta.
-  **Configurações Personalizáveis**: Escolha a frequência de atualização (Sempre abrir, A cada hora, Manual).
-  **Notificações Inteligentes**: Alertas locais se as principais moedas sofrerem variações bruscas (>1%).

##  Tecnologias Utilizadas

- **Framework**: Ionic 7 + Angular 18 (Standalone Components)
- **Linguagem**: TypeScript
- **Gráficos**: Chart.js 4
- **Persistência**: Ionic Storage / Capacitor Preferences
- **Notificações**: Capacitor Local Notifications
- **APIs**: ExchangeRate-API (Fallback configurável)

##  Estrutura do Projeto

    ```text
    src/
    ├── app/
    │   ├── models/         # Interfaces TypeScript (Currency, Conversion, ChartData)
    │   ├── pages/          # Ecrãs da aplicação (Home, History, Chart, Settings)
    │   ├── services/       # Lógica de negócio (Exchange, Storage, Chart, Notifications)
    │   └── app.routes.ts   # Configuração de rotas standalone
    ├── environments/       # Variáveis de ambiente e chaves de API
    ├── assets/             # Ícones e imagens
    └── theme/              # Variáveis globais de cores e tipografia
    ```

##  Como Executar Localmente

### Pré-requisitos

- Node.js https://nodejs.org/ (versão LTS recomendada)
- Ionic CLI https://ionicframework.com/docs/cli ( npm install -g @ionic/cli )

### Instalação

1. Clone o repositório:
git clone https://github.com/seu-utilizador/ionic-coin.git
cd ionic-coin

2. Instale as dependências:
npm install

3. Inicie o servidor de desenvolvimento:
ionic serve
A aplicação será aberta no seu browser em  http://localhost:8100 .

##  Configuração da API

A app utiliza a ExchangeRate-API para obter taxas em tempo real. No ficheiro  src/environments/environment.ts  e  environment.prod.ts , atualize com a sua chave:

    export const environment = {
      production: false,
      apiBaseUrl: 'https://v6.exchangerate-api.com/v6',
      apiKey: 'SUA_CHAVE_AQUI',
      useFallbackApi: true, // Use false em produção com uma chave válida
      fallbackApiUrl: 'https://open.er-api.com/v6/latest'
    };

(Nota: O histórico do gráfico é construído progressivamente de forma local à medida que as taxas reais são obtidas, eliminando a dependência de endpoints históricos pagos.)
