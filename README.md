# Piá Robot Backend POC

POC do servidor central do projeto Piá Robot, baseada no documento do TCC.

Esta primeira versão implementa:

- API REST para cadastro e gerenciamento de dispositivos.
- API REST para criação e consulta de sessões de jogo.
- Registro de eventos de jogo, como acerto e erro.
- Persistência em PostgreSQL usando Spring Data JPA.
- Publicação e consumo de eventos com RabbitMQ.
- Motor emocional simples que traduz desempenho em emoções dos olhos digitais.

## Arquitetura da POC

O tablet envia eventos de jogo para o backend pela API REST. O backend publica esses eventos no RabbitMQ, consome a fila interna, atualiza a sessão no Postgres e publica uma mensagem de emoção para que o app dos olhos possa reagir.

Fluxo principal:

1. App de controle registra dispositivos e cria uma sessão.
2. Tablet envia eventos `HIT` ou `MISS`.
3. Backend publica o evento em `pia.robot.game.events`.
4. Consumidor processa o evento e atualiza pontuação/desempenho.
5. Motor emocional decide a emoção atual.
6. Backend publica a atualização em `pia.robot.emotions`.
7. A mensagem fica disponível na fila `pia.robot.emotions.eyes`, que representa o app dos olhos na POC.

## Como executar

Subir Postgres, RabbitMQ e API:

```bash
docker compose up --build
```

API:

```text
http://localhost:8080
```

RabbitMQ Management:

```text
http://localhost:15672
usuario: pia_robot
senha: pia_robot
```

Health check:

```bash
curl http://localhost:8080/actuator/health
```

## Exemplos de uso

Registrar um tablet:

```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Tablet Corpo\",\"type\":\"GAME_TABLET\"}"
```

Registrar celular dos olhos:

```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Celular Cabeça\",\"type\":\"EYES_PHONE\"}"
```

Criar sessão:

```bash
curl -X POST http://localhost:8080/api/sessions \
  -H "Content-Type: application/json" \
  -d "{\"gameCode\":\"TARGET_HIT\",\"difficulty\":\"NORMAL\"}"
```

Enviar acerto:

```bash
curl -X POST http://localhost:8080/api/sessions/{sessionId}/events \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"HIT\",\"points\":1}"
```

Enviar erro:

```bash
curl -X POST http://localhost:8080/api/sessions/{sessionId}/events \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"MISS\",\"points\":0}"
```

Consultar sessão:

```bash
curl http://localhost:8080/api/sessions/{sessionId}
```

Forçar emoção manualmente:

```bash
curl -X POST http://localhost:8080/api/sessions/{sessionId}/emotion \
  -H "Content-Type: application/json" \
  -d "{\"emotion\":\"HAPPY\"}"
```

## Próximos passos naturais

- WebSocket para transmitir emoções diretamente ao app dos olhos.
- Autenticação do app de controle.
- Histórico com filtros por data e dificuldade.
- Configuração de tempo e dificuldade das partidas.
- App React Native do tablet e do celular dos olhos.
