import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Stack Screen Files
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';

// Core Dashboard Screens
import DashboardScreen from '../screens/DashboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Earnings & Wallet Screens
import EarningsScreen from '../screens/EarningsScreen';
import WalletScreen from '../screens/WalletScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';

// Active Rides & Ride Stages Screens
import ActiveRideScreen from '../screens/ride/ActiveRideScreen';
import RideDetailsScreen from '../screens/ride/RideDetailsScreen';
import NavigatePickupScreen from '../screens/ride/NavigatePickupScreen';
import ArrivedPickupScreen from '../screens/ride/ArrivedPickupScreen';
import RideOtpVerificationScreen from '../screens/ride/RideOtpVerificationScreen';
import RideInProgressScreen from '../screens/ride/RideInProgressScreen';
import RideCompletedScreen from '../screens/ride/RideCompletedScreen';

// Active Parcels & Parcel Stages Screens
import ActiveParcelScreen from '../screens/parcel/ActiveParcelScreen';
import ParcelRequestScreen from '../screens/parcel/ParcelRequestScreen';
import ParcelPickupScreen from '../screens/parcel/ParcelPickupScreen';
import ParcelDeliveryScreen from '../screens/parcel/ParcelDeliveryScreen';

// Profiles, Vehicle & Documents KYC Verification Screens
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import EditVehicleScreen from '../screens/EditVehicleScreen';
import KycDocumentsScreen from '../screens/KycDocumentsScreen';
import UploadLicenseScreen from '../screens/UploadLicenseScreen';
import UploadRcScreen from '../screens/UploadRcScreen';
import UploadInsuranceScreen from '../screens/UploadInsuranceScreen';
import UploadAadhaarScreen from '../screens/UploadAadhaarScreen';
import UploadPanScreen from '../screens/UploadPanScreen';

// Communications, SOS Emergency & Support Center Screens
import SupportScreen from '../screens/SupportScreen';
import ChatCustomerScreen from '../screens/ChatCustomerScreen';
import CallCustomerScreen from '../screens/CallCustomerScreen';
import SosScreen from '../screens/SosScreen';

// Preference Customization & Legal Compliance Screens
import RatingsScreen from '../screens/RatingsScreen';
import LanguageScreen from '../screens/LanguageScreen';
import DarkModeScreen from '../screens/DarkModeScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpScreen from '../screens/HelpScreen';
import ReferralScreen from '../screens/ReferralScreen';

// Dialog Alert & Dialogue Screens
import LogoutScreen from '../screens/LogoutScreen';
import UpdateScreen from '../screens/UpdateScreen';
import NetworkErrorScreen from '../screens/NetworkErrorScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} />

      <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
      <Stack.Screen name="NavigatePickup" component={NavigatePickupScreen} />
      <Stack.Screen name="ArrivedPickup" component={ArrivedPickupScreen} />
      <Stack.Screen name="RideOtpVerification" component={RideOtpVerificationScreen} />
      <Stack.Screen name="RideInProgress" component={RideInProgressScreen} />
      <Stack.Screen name="RideCompleted" component={RideCompletedScreen} />

      <Stack.Screen name="ActiveParcel" component={ActiveParcelScreen} />
      <Stack.Screen name="ParcelRequest" component={ParcelRequestScreen} />
      <Stack.Screen name="ParcelPickup" component={ParcelPickupScreen} />
      <Stack.Screen name="ParcelDelivery" component={ParcelDeliveryScreen} />

      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="EditVehicle" component={EditVehicleScreen} />
      <Stack.Screen name="KycDocuments" component={KycDocumentsScreen} />
      <Stack.Screen name="UploadLicense" component={UploadLicenseScreen} />
      <Stack.Screen name="UploadRc" component={UploadRcScreen} />
      <Stack.Screen name="UploadInsurance" component={UploadInsuranceScreen} />
      <Stack.Screen name="UploadAadhaar" component={UploadAadhaarScreen} />
      <Stack.Screen name="UploadPan" component={UploadPanScreen} />

      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="ChatCustomer" component={ChatCustomerScreen} />
      <Stack.Screen name="CallCustomer" component={CallCustomerScreen} />
      <Stack.Screen name="Sos" component={SosScreen} />

      <Stack.Screen name="Ratings" component={RatingsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="DarkMode" component={DarkModeScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />

      <Stack.Screen name="LogoutConfirmation" component={LogoutScreen} />
      <Stack.Screen name="Update" component={UpdateScreen} />
      <Stack.Screen name="NetworkError" component={NetworkErrorScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { driver, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFC72C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {driver ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
