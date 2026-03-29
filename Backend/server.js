import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js'
import http from 'http';
import connectDB from './src/config/db.js';
import { initSocket } from './src/sockets/serverSocket.js';

const PORT = process.env.PORT || 8000;

const httpServer = http.createServer(app);

initSocket(httpServer);

connectDB()

.catch((error) => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});


  httpServer.listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
  });