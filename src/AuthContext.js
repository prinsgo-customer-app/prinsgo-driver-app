import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    try {
      const token = await AsyncStorage.getItem('prinsgo_driver_token');
      if (token) {
        const res = await getMe();
        setDriver(res.data.driver);
      }
    } catch (err) {
      await AsyncStorage.removeItem('prinsgo_driver_token');
      setDriver(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (token, driverData) => {
    await AsyncStorage.setItem('prinsgo_driver_token', token);
    setDriver(driverData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('prinsgo_driver_token');
    setDriver(null);
  };

  const refreshDriver = async () => {
    const res = await getMe();
    setDriver(res.data.driver);
  };

  return (
    <AuthContext.Provider value={{ driver, loading, login, logout, refreshDriver }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
