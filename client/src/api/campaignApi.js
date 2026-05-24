// campaignApi.js — campaign CRUD calls.

import axiosClient from './axiosClient.js';

export const listCampaigns = (params) => axiosClient.get('/campaigns', { params });
export const getCampaign = (id) => axiosClient.get(`/campaigns/${id}`);
export const listMyCampaigns = () => axiosClient.get('/campaigns/mine');

// FormData because we're uploading an image — DO NOT JSON.stringify.
// axios sets the Content-Type header automatically when given FormData,
// so we don't need to set it manually (and shouldn't — the boundary string
// is part of the header and axios fills it in).
export const createCampaign = (formData) =>
  axiosClient.post('/campaigns', formData);

export const updateCampaign = (id, data) => axiosClient.patch(`/campaigns/${id}`, data);
export const deleteCampaign = (id) => axiosClient.delete(`/campaigns/${id}`);
