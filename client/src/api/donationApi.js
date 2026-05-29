// donationApi.js — two-step payment flow.
//   1. createOrder  -> backend returns { orderId, amount, razorpayKeyId }
//   2. After Razorpay checkout succeeds, frontend calls verifyPayment.

import axiosClient from './axiosClient.js';

export const createOrder = (data) => axiosClient.post('/donations/order', data);
export const verifyPayment = (data) => axiosClient.post('/donations/verify', data);
export const listMyDonations = () => axiosClient.get('/donations/mine');
export const listCampaignDonations = (campaignId, limit = 20) =>
  axiosClient.get(`/donations/campaign/${campaignId}`, { params: { limit } });
