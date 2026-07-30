import apiClient from './client';

export const getActiveRide = () => apiClient.get('/driver/rides/active');

export const getRideHistory = (page = 1, limit = 20) =>
  apiClient.get(`/driver/rides/history?page=${page}&limit=${limit}`);

export const acceptRide = (id) => apiClient.put(`/driver/rides/${id}/accept`);

export const markArrived = (id) => apiClient.put(`/driver/rides/${id}/arrived`);

export const startRide = (id, otp) => apiClient.put(`/driver/rides/${id}/start`, { otp });

export const completeRide = (id) => apiClient.put(`/driver/rides/${id}/complete`);

export const cancelRide = (id, reason) =>
  apiClient.put(`/driver/rides/${id}/cancel`, { reason });
