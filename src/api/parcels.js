import apiClient from './client';

export const getActiveParcel = () => apiClient.get('/driver/parcels/active');

export const getParcelHistory = (page = 1, limit = 20) =>
  apiClient.get(`/driver/parcels/history?page=${page}&limit=${limit}`);

export const acceptParcel = (id) => apiClient.put(`/driver/parcels/${id}/accept`);

export const pickupParcel = (id) => apiClient.put(`/driver/parcels/${id}/pickup`);

export const markInTransit = (id) => apiClient.put(`/driver/parcels/${id}/in-transit`);

export const deliverParcel = (id, otp) =>
  apiClient.put(`/driver/parcels/${id}/deliver`, { otp });

export const cancelParcel = (id, reason) =>
  apiClient.put(`/driver/parcels/${id}/cancel`, { reason });
