import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext(null);

export const THEME_LIGHT = {
  primary: '#1877F2',
  background: '#FFFFFF',
  text: '#0A0F24',
  textSecondary: '#65676B',
  card: '#F2F4F7',
  border: '#E4E6EB',
  statusSuccess: '#2EC4B6',
  statusDanger: '#E53935',
  warning: '#FFF3E0',
  warningText: '#B25000',
  white: '#FFFFFF',
  shadowColor: '#000000',
};

export const THEME_DARK = {
  primary: '#3F92FF',
  background: '#0F172A',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  card: '#1E293B',
  border: '#334155',
  statusSuccess: '#10B981',
  statusDanger: '#EF4444',
  warning: '#78350F',
  warningText: '#FDE68A',
  white: '#0F172A', // Using very dark blue instead of true white in dark mode
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
