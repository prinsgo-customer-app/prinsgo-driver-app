import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('prinsgo_driver_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestedUrl = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`;
    const status = error?.response?.status;
    const baseMessage =
      error?.response?.data?.message || error?.message || 'Something went wrong';
    const message = `${baseMessage}\n\n[debug] ${error?.config?.method?.toUpperCase() || ''} ${requestedUrl}${status ? ` (status ${status})` : ' (no response)'}`;
    return Promise.reject({ ...error, message });
  }
);

export default apiClient;
