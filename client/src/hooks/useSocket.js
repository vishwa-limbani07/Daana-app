// useSocket.js — connects to the Socket.io server and subscribes to
// donation:new events for a specific campaign.
//
// IMPORTANT: we use a module-level SINGLETON socket. Without it, every
// CampaignDetail mount would open a new WebSocket — wasteful, and harder
// to debug. The singleton means one connection per browser tab, and the
// hook just joins/leaves rooms on it.
//
// The Vite proxy in vite.config.js handles HTTP /api/* but NOT WebSockets.
// So we connect DIRECTLY to the backend at VITE_API_URL minus the /api suffix.

import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket = null;

const getSocket = () => {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    socket = io(apiUrl.replace(/\/api\/?$/, ''), {
      // autoConnect defaults to true. The connection is shared by all
      // subscribers on the page.
    });
  }
  return socket;
};

/**
 * Subscribe to live donation events for a campaign.
 *
 * @param {string} campaignId
 * @param {(payload: { raisedAmount, donorCount, amount, isAnonymous }) => void} onDonation
 *
 * NOTE: pass a stable callback (useCallback in parent) or it will re-subscribe
 * on every render.
 */
export const useSocket = (campaignId, onDonation) => {
  useEffect(() => {
    if (!campaignId) return;
    const s = getSocket();

    s.emit('join:campaign', campaignId);
    s.on('donation:new', onDonation);

    return () => {
      s.emit('leave:campaign', campaignId);
      s.off('donation:new', onDonation);
    };
  }, [campaignId, onDonation]);
};
