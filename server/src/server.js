// server.js — entry point. Boots the HTTP server and Socket.io.
//
// IMPORTANT: `import 'dotenv/config'` MUST be the very first import.
// ES module imports execute in order, and any module below this line
// might read process.env at the top of its file (e.g. config/razorpay.js).
// Loading dotenv first means env vars are populated before anything else
// runs.

import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './services/socketService.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[server] failed to start:', err);
    process.exit(1);
  }
};

start();
