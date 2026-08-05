import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext(null);

export const THEME_LIGHT = {
  primary: '#FFC72C',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#555555',
  card: '#F9F9F9',
  border: '#EAEAEA',
  statusSuccess: '#10B981',
  statusDanger: '#EF4444',
  warning: '#FFFBEB',
  warningText: '#D97706',
  white: '#FFFFFF',
  shadowColor: '#000000',
};

export const THEME_DARK = {
  primary: '#FFC72C',
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  card: '#1E1E1E',
  border: '#2D2D2D',
  statusSuccess: '#10B981',
  statusDanger: '#EF4444',
  warning: '#2E2100',
  warningText: '#FFC72C',
  white: '#1E1E1E',
  shadowColor: '#000000',
};

export const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    online: "You're Online",
    offline: "You're Offline",
    lookingForRequests: 'Looking for requests nearby',
    goOnlineToStart: 'Go online to start receiving requests',
    pendingApproval: "Your documents are pending admin approval. You can't go online yet.",
    activeTrip: 'Active Trip',
    resumeTrip: 'Resume Trip',
    rides: 'Rides',
    earnings: 'Earnings',
    walletBalance: 'Wallet Balance',
    rating: 'Rating',
    noRequests: "No requests nearby yet. Stay online, we'll notify you.",
    incomingRequest: 'Incoming Request!',
    accept: 'Accept',
    reject: 'Reject',
    todayRides: "Today's Rides",
    todayEarnings: "Today's Earnings",
    settings: 'Settings',
    profile: 'Profile',
    wallet: 'Wallet',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    language: 'Language',
    logout: 'Logout',
    withdrawMoney: 'Withdraw Money',
    editProfile: 'Edit Profile',
    vehicleDetails: 'Vehicle Details',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    online: 'आप ऑनलाइन हैं',
    offline: 'आप ऑफलाइन हैं',
    lookingForRequests: 'आसपास के अनुरोध खोज रहे हैं',
    goOnlineToStart: 'अनुरोध प्राप्त करना शुरू करने के लिए ऑनलाइन जाएं',
    pendingApproval: 'आपके दस्तावेज़ व्यवस्थापक की मंजूरी के लिए लंबित हैं। आप अभी ऑनलाइन नहीं जा सकते।',
    activeTrip: 'सक्रिय यात्रा',
    resumeTrip: 'यात्रा जारी रखें',
    rides: 'सवारी',
    earnings: 'कमाई',
    walletBalance: 'वॉलेट बैलेंस',
    rating: 'रेटिंग',
    noRequests: 'अभी तक कोई अनुरोध नहीं है। ऑनलाइन रहें, हम आपको सूचित करेंगे।',
    incomingRequest: 'नया अनुरोध आया है!',
    accept: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    todayRides: 'आज की सवारी',
    todayEarnings: 'आज की कमाई',
    settings: 'सेटिंग्स',
    profile: 'प्रोफाइल',
    wallet: 'वॉलेट',
    notifications: 'सूचनाएं',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    logout: 'लॉगआउट',
    withdrawMoney: 'पैसे निकालें',
    editProfile: 'प्रोफाइल संपादित करें',
    vehicleDetails: 'वाहन विवरण',
  },
};

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem('driver_dark_mode');
        const savedLanguage = await AsyncStorage.getItem('driver_language');
        if (savedDarkMode !== null) {
          setIsDarkMode(savedDarkMode === 'true');
        }
        if (savedLanguage !== null) {
          setLanguage(savedLanguage);
        }
      } catch (err) {
        console.log('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggleDarkMode = async () => {
    try {
      const nextMode = !isDarkMode;
      setIsDarkMode(nextMode);
      await AsyncStorage.setItem('driver_dark_mode', String(nextMode));
    } catch (err) {
      console.log(err);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem('driver_language', lang);
    } catch (err) {
      console.log(err);
    }
  };

  const theme = isDarkMode ? THEME_DARK : THEME_LIGHT;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <SettingsContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        language,
        changeLanguage,
        theme,
        t,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
