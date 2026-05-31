# Piá Robot Emotion — Frontend (parte 1)

Publicação parcial do frontend React (Vite + TypeScript).

## Telas incluídas

**Parte 1:** landing, login, cadastro, recuperar senha, menu, perfil, dispositivos (cadastrar/gerenciar/testar).

**Parte 2:** tablet (`/tablet` — home, jogo, histórico, sobre), partidas no painel (iniciar, monitor, configurações, emoção manual), histórico e sobre no sistema web (`/app/historico`, `/app/sobre`).

## Como rodar

```bash
npm install
npm run dev
```

O proxy envia `/api` para `http://localhost:8080` (backend Spring Boot).

## Assets Olhar Emocional (PIBIC)

Os vídeos das expressões ficam em `eyesOlharEmocional/OlharEmocional/assets/` e são servidos em desenvolvimento e build via `/olhar-emocional-assets/`.

## Próximas partes

Tela dos olhos no celular (`/olhos`) e sincronização em tempo real — commit futuro.
