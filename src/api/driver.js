import apiClient from './client';

export const setOnlineStatus = (isOnline) => apiClient.put('/driver/status', { isOnline });

export const updateLocation = (lat, lng) => apiClient.put('/driver/location', { lat, lng });

export const getNearbyRequests = () => apiClient.get('/driver/nearby-requests');

export const getEarnings = () => apiClient.get('/driver/earnings');
