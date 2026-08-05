import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { verifyOtp, sendOtp } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const VEHICLE_TYPES = [
  { value: 'bike', label: 'Bike' },
  { value: 'auto', label: 'Auto' },
  { value: 'car_mini', label: 'Mini' },
  { value: 'car_sedan', label: 'Sedan' },
  { value: 'parcel_van', label: 'Parcel Van' },
];

export default function OtpScreen({ route }) {
  const { phone } = route.params;
  const { login } = useAuth();
  const { theme } = useSettings();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!code) {
      Alert.alert('Invalid OTP', 'Enter the OTP you received');
      return;
    }
    if (needsRegistration && (!name.trim() || !vehicleNumber.trim())) {
      Alert.alert('Missing details', 'Please fill name and vehicle number');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(
        phone,
        code,
        name || undefined,
        needsRegistration ? vehicleType : undefined,
        vehicleNumber || undefined
      );
      const { token, driver } = res.data;
      await login(token, driver);
    } catch (err) {
      if (err?.response?.data?.isNewDriver) {
        setNeedsRegistration(true);
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await sendOtp(phone);
      Alert.alert('OTP sent', 'A new OTP has been sent to your phone');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#000000' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>We've sent a code to +91 {phone}</Text>

        <TextInput
          style={[styles.input, { borderColor: theme.border, color: '#FFFFFF' }]}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="Enter OTP"
          placeholderTextColor="#666666"
          value={code}
          onChangeText={setCode}
        />

        {needsRegistration && (
          <View style={styles.registerBox}>
            <Text style={styles.registerHeading}>Complete Registration</Text>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: '#FFFFFF' }]}
              placeholder="Your full name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Vehicle type</Text>
            <View style={styles.vehicleRow}>
              {VEHICLE_TYPES.map((v) => (
                <TouchableOpacity
                  key={v.value}
                  style={[
                    styles.vehicleChip,
                    { borderColor: theme.border },
                    vehicleType === v.value && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                  onPress={() => setVehicleType(v.value)}
                >
                  <Text
                    style={[
                      styles.vehicleChipText,
                      vehicleType === v.value && { color: '#000000', fontWeight: '800' },
                    ]}
                  >
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: '#FFFFFF' }]}
              placeholder="Vehicle number (e.g. MH12AB1234)"
              placeholderTextColor="#666666"
              autoCapitalize="characters"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />
          </View>
        )}

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={submit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.buttonText}>
              {needsRegistration ? 'Register' : 'Verify'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={resend} style={styles.resendBtn}>
          <Text style={[styles.resendText, { color: theme.primary }]}>Resend OTP</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888888', marginBottom: 32 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '600',
    backgroundColor: '#121212',
  },
  registerBox: { marginTop: 12 },
  registerHeading: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  label: { fontSize: 14, color: '#AAAAAA', marginBottom: 12, fontWeight: '700' },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18, gap: 8 },
  vehicleChip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  vehicleChipText: { color: '#AAAAAA', fontSize: 13, fontWeight: '600' },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FFC72C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
  resendBtn: { marginTop: 20 },
  resendText: { textAlign: 'center', fontWeight: '700', fontSize: 14 },
});
