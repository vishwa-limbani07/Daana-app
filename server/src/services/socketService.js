// socketService.js — Socket.io for real-time donation updates.
//
// PATTERN: rooms.
//   When a client opens a campaign page, it joins room `campaign:<id>`.
//   When a donation succeeds on that campaign, we emit ONLY to that room.
//   This is much cheaper than broadcasting to every connected client.
//
// `io` is a module-level singleton so any other module can call
// emitDonation(...) without holding a reference to the server.

import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Each client tells us which campaign page they're viewing.
    socket.on('join:campaign', (campaignId) => {
      if (typeof campaignId === 'string') {
        socket.join(`campaign:${campaignId}`);
      }
    });

    socket.on('leave:campaign', (campaignId) => {
      if (typeof campaignId === 'string') {
        socket.leave(`campaign:${campaignId}`);
      }
    });
  });

  console.log('[socket] initialized');
};

/**
 * Push a donation update to everyone currently viewing this campaign.
 * Safe to call before initSocket — it's a no-op if io isn't ready yet.
 */
export const emitDonation = (campaignId, payload) => {
  io?.to(`campaign:${campaignId}`).emit('donation:new', payload);
};
