# Baited WebSocket Server

Real-time WebSocket server for the Baited multiplayer coding game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env` and update values as needed:
```
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Development

Run the server in development mode with hot reload:
```bash
npm run dev
```

## Production

Build and run:
```bash
npm run build
npm start
```

## Architecture

- **Socket.IO**: Real-time bidirectional communication
- **Express**: Basic HTTP server and health check endpoint
- **TypeScript**: Type-safe development

## Events

### Client -> Server
- `create-lobby`: Create a new lobby
- `join-lobby`: Join existing lobby
- `leave-lobby`: Leave current lobby
- `start-game`: Start the game (host only)
- `code-update`: Send code changes
- `submit-code`: Submit final code

### Server -> Client
- `lobby-created`: Lobby creation confirmation
- `lobby-joined`: Successfully joined lobby
- `player-joined`: Another player joined
- `player-left`: Player left lobby
- `game-started`: Game has started
- `you-are-impostor`: You are the impostor
- `player-code-updated`: Live code updates
- `game-ended`: Game finished
- `error`: Error message

## Health Check

```
GET http://localhost:3001/health
```
