// tierApi.js — reward tier CRUD.
//
// Note the URL shapes:
//   GET/POST  /api/campaigns/:campaignId/tiers
//   DELETE    /api/tiers/:id
//
// We use the nested URL for "tiers belonging to a campaign" reads/creates,
// and the flat URL for "this specific tier" deletes. Standard REST shape.

import axiosClient from './axiosClient.js';

export const listTiers = (campaignId) =>
  axiosClient.get(`/campaigns/${campaignId}/tiers`);

export const createTier = (campaignId, data) =>
  axiosClient.post(`/campaigns/${campaignId}/tiers`, data);

export const deleteTier = (tierId) =>
  axiosClient.delete(`/tiers/${tierId}`);
