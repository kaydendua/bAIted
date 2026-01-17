import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { attachSocketHandlers } from './config/socket';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup socket event handlers
attachSocketHandlers(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 WebSocket server running on port ${PORT}`);
  logger.info(`📡 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});
