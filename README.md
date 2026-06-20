# Piá Robot Emotion

**Sistema de gamificação com responsividade visual em arquitetura multi-dispositivo.**

Protótipo de um robô educacional que expressa emoções por meio de *olhos digitais*, reagindo ao desempenho do usuário em jogos de habilidade. Desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas do Setor de Educação Profissional e Tecnológica (SEPT) da Universidade Federal do Paraná (UFPR).

O robô é montado com dispositivos comerciais:
- **Smartphone** (a "cabeça") exibe os olhos digitais e as emoções;
- **Tablet** (o "corpo") executa os jogos de habilidade;
- **Painel web** controla dispositivos, sessões e monitora o desempenho.

A pontuação obtida nos jogos é convertida em **eventos auditáveis** (`HIT`, `MISS`, início e fim de partida), processados por um **motor emocional** que atualiza o estado da sessão. O celular sincroniza os vídeos do módulo PIBIC *Olhar Emocional* via *polling*, fechando o ciclo **percepção → ação → reação emocional**.

## Configuração

Crie um arquivo `.env` na raiz com as credenciais SMTP usadas na recuperação de senha:

```env
SPRING_MAIL_USERNAME=seu-email@gmail.com
SPRING_MAIL_PASSWORD=sua-senha-de-app
PIA_MAIL_FROM=seu-email@gmail.com
```

> Use uma **senha de aplicativo** do Gmail (não a senha da conta) e **nunca versione o `.env`**.

## Como executar

### 1. Backend, banco e mensageria (Docker Compose)

```bash
docker compose up -d --build
```

| Serviço | Endereço |
|---------|----------|
| API REST | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Documentação (Redoc) | http://localhost:8080/api-docs.html |
| OpenAPI (JSON) | http://localhost:8080/v3/api-docs |
| Health check | http://localhost:8080/actuator/health |
| RabbitMQ (management) | http://localhost:15672 |
| PostgreSQL | `localhost:5432` (banco `pia_robot`) |

### 2. Frontend (painel web · tablet · olhos)

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Disponível em http://localhost:5173. O Vite faz *proxy* de `/api` para o backend (porta 8080), permitindo que celular e tablet acessem a API sem configuração manual de IP. Use `--host 0.0.0.0` para que outros dispositivos da LAN alcancem a interface.

Principais rotas:
- `/app/*` — painel web do operador (protegido)
- `/tablet/jogo` — interface dos jogos (tablet)
- `/olhos` — exibição das emoções (celular)

### 3. Build de produção do frontend

```bash
npm run build
```

## Arquitetura

A solução segue o padrão cliente–servidor com backend centralizado orientado a eventos de jogo, organizado em quatro macrocamadas: interfaces React, API Spring Boot, integrações externas (SMTP e acervo *Olhar Emocional*) e infraestrutura containerizada.

```
Painel Web (React)  ──┐
Tablet  (React)     ──┼──►  API REST (Spring Boot)  ──►  PostgreSQL
Olhos   (React)     ──┘            │
   ▲  (polling)                    └──►  RabbitMQ (atualizações emocionais)
   └─────────────────────────────────────────┘
```

### Estrutura do repositório

```
tcc-pia-robot-emotion/
├── src/                          # Monorepo (frontend web/tablet/olhos + backend Java)
│   ├── views/                    # Telas e layouts React (painel, /tablet, /olhos)
│   ├── controllers/              # Contexto de autenticação e rotas protegidas
│   ├── models/                   # Clientes de API, tipos e utilitários
│   │   └── emotionOlharModel.ts  # Mapeamento estado lógico → vídeo
│   ├── App.tsx                   # Definição de rotas
│   ├── main.tsx                  # Entry point do React
│   │
│   └── main/java/br/edu/piarobot/poc/
│       ├── config/               # Configuração do Spring
│       ├── controller/           # Endpoints REST
│       ├── service/              # Regras de negócio (SessionService, EmotionEngine)
│       ├── domain/               # Entidades JPA
│       ├── dto/                  # Objetos de transferência
│       ├── repository/           # Acesso a dados (JPA)
│       ├── messaging/            # Publicação de eventos no RabbitMQ
│       └── PiaRobotApplication.java
│
├── eyesOlharEmocional/OlharEmocional/   # Módulo PIBIC Olhar Emocional (acervo de vídeos)
├── docs/                         # Apêndices acadêmicos (API REST, contratos frontend)
├── docker-compose.yml            # API + PostgreSQL + RabbitMQ
├── Dockerfile                    # Imagem do backend
├── diagramas-mermaid.md          # Diagramas de sequência por história de uso
└── README.md
```

## Stack tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Interface** | React 18 · TypeScript · Vite · React Router |
| **Backend** | Java 21 · Spring Boot 3.3 (Web, Validation, JPA, Mail, AMQP, Actuator) |
| **Banco** | PostgreSQL 16 (`app_users`, `devices`, `robot_sessions`, `game_events`) |
| **Mensageria** | RabbitMQ 3.13 (publicação de atualizações emocionais) |
| **Implantação** | Docker Compose (`pia-robot-api`, Postgres, RabbitMQ) |
| **Documentação** | SpringDoc OpenAPI 3 (Swagger UI · Redoc) |

## Pré-requisitos

- Docker e Docker Compose (backend e serviços)
- Node.js 18+ e npm (frontend)
- JDK 21 e Maven (apenas para rodar/testar o backend fora do Docker)
- Dispositivos (celular e tablet) na **mesma rede Wi-Fi/LAN** do servidor


## Fluxo operacional

1. O **operador** autentica-se no painel web;
2. **pareia** celular e tablet via **QR Code** (contendo `ownerEmail` e `pairingId`);
3. **cria uma sessão** e ajusta as configurações do jogo;
4. o **tablet** recebe o identificador de sessão e entra em fase de jogo;
5. **eventos** (`HIT`/`MISS`) são enviados à API e persistidos;
6. o **motor emocional** atualiza o placar e a `currentEmotion`;
7. o **celular** consulta a sessão periodicamente (*polling*) e troca o vídeo exibido.

## Pareamento de dispositivos

O operador gera um QR Code no painel. O celular (`/olhos`) ou o tablet (`/tablet/jogo`) escaneia o código e registra-se via `POST /api/devices` com o tipo `EYES_PHONE` ou `GAME_TABLET`, passando a operar vinculado ao usuário. Isso elimina a configuração manual de IP em cada aparelho — fundamental em demonstrações com público leigo.

## Motor emocional

O `EmotionEngine` aplica regras determinísticas entre evento de jogo e emoção:

| Evento | Emoção resultante |
|--------|-------------------|
| `GAME_STARTED` | `IDLE` |
| `HIT` | `HAPPY` |
| `MISS` | `SAD` |
| `GAME_FINISHED` | `IDLE` |

Após um `MISS`, um *cooldown* de 2 segundos (`MissEmotionCooldown`) retorna a expressão para `IDLE`, evitando que o robô permaneça "triste" indefinidamente. O `SessionService` incrementa acertos/erros, persiste o `GameEventRecord` e publica uma `EmotionUpdateMessage` no RabbitMQ.

### Mapeamento estado lógico → vídeo (Olhar Emocional)

| Estado da API | Acervo de vídeo |
|---------------|-----------------|
| `IDLE`, `FOCUSED` | Neutro |
| `HAPPY`, `CELEBRATING` | Alegria |
| `SAD` | Medo/tristeza |
| `SURPRISED` | Surpresa |

A página `/olhos` faz *polling* da sessão a cada **80 ms** quando há `sessionId` ativo, mantendo a latência percebida abaixo de ~2 s em rede LAN, sem necessidade de WebSocket nesta prova de conceito.

## Jogos implementados

- **Acerte o Alvo** — um alvo circular surge em posição aleatória; o jogador deve tocá-lo antes do tempo expirar. Acertos geram `HIT`; falhas geram `MISS`.
- **Toque na Cor Certa** — a interface exibe uma instrução (ex.: "Toque no vermelho") e múltiplos alvos coloridos; apenas a cor correta pontua.

Parâmetros como tempo de rodada, meta de acertos e escala do alvo são configuráveis no painel (`GameSettings`) e sincronizados com o tablet via API.

## API REST

Endpoints documentados em OpenAPI 3:

| Prefixo | Função |
|---------|--------|
| `/api/users` | Registro, login, perfil, alteração e recuperação de senha |
| `/api/devices` | Registro, listagem, consulta e desativação de dispositivos |
| `/api/sessions` | CRUD de sessão, eventos, histórico, `claim-unowned` |
| `/api/game-settings` | Leitura e gravação dos parâmetros de partida |
| `/api/manual-emotion` | Emoção manual definida pelo operador |
| `/api/connection-test` | Diagnóstico de latência e disponibilidade |

### Autenticação e identificação

O painel web mantém uma sessão leve no `localStorage` (`pia_robot_auth_session_v1`: e-mail e nome), suficiente para proteger as rotas `/app/*` e enviar o cabeçalho **`X-Pia-User-Email`** nas requisições. As senhas são armazenadas no servidor apenas como *hash* **SHA-256 com *salt*** — a API nunca retorna o segredo.

## Testes

```bash
mvn test       # Backend — inclui EmotionEngineTest (mapeamento de eventos → emoções)
npm run build  # Frontend — verificação de tipos + build de produção
```

## Limitações

- Depende de rede estável entre dispositivos e servidor;
- O *polling* consome mais requisições do que WebSocket/SSE;
- A recuperação de senha exige configuração SMTP.

## Trabalhos futuros

WebSocket ou SSE; consumo das filas RabbitMQ pelo cliente dos olhos; novos jogos; regras emocionais compostas (ex.: `CELEBRATING` após sequência de acertos); integração opcional com reconhecimento facial; e estudos de usabilidade com crianças e público neurodivergente.

## Créditos

- **Autoria:** Maria Tereza Marchezan Frank e André Luiz Olmedo — SEPT/UFPR
- **Orientação:** Prof. Dr. Luiz Antônio Pereira Neves
- **Acervo de vídeos emocionais:** equipe do PIBIC *Olhar Emocional*

Projeto acadêmico (TCC) — Análise e Desenvolvimento de Sistemas, SEPT/UFPR.
