import apiClient from './client';

export const setOnlineStatus = (isOnline) => apiClient.put('/driver/status', { isOnline });

export const updateLocation = (lat, lng) => apiClient.put('/driver/location', { lat, lng });

export const getNearbyRequests = () => apiClient.get('/driver/nearby-requests');

export const getEarnings = () => apiClient.get('/driver/earnings');

// Profile & Verification Documents
export const updateProfile = (profileData) => apiClient.put('/driver/profile', profileData);

// Wallet & Banking
export const updateBankDetails = (bankData) => apiClient.put('/driver/bank-details', bankData);

export const requestWithdrawal = (amount) => apiClient.post('/driver/withdraw', { amount });

// Notifications
export const getNotifications = () => apiClient.get('/driver/notifications');
