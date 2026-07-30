import apiClient from './client';

export const sendOtp = (phone) => apiClient.post('/driver/auth/send-otp', { phone });

export const verifyOtp = (phone, code, name, vehicleType, vehicleNumber) =>
  apiClient.post('/driver/auth/verify-otp', { phone, code, name, vehicleType, vehicleNumber });

export const getMe = () => apiClient.get('/driver/auth/me');

export const updateDocuments = (docs) => apiClient.put('/driver/auth/documents', docs);
