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
} from 'react-native';
import { verifyOtp, sendOtp } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verify your number</Text>
      <Text style={styles.subtitle}>We've sent a code to +91 {phone}</Text>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="Enter OTP"
        value={code}
        onChangeText={setCode}
      />

      {needsRegistration && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Vehicle type</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_TYPES.map((v) => (
              <TouchableOpacity
                key={v.value}
                style={[styles.vehicleChip, vehicleType === v.value && styles.vehicleChipActive]}
                onPress={() => setVehicleType(v.value)}
              >
                <Text
                  style={[
                    styles.vehicleChipText,
                    vehicleType === v.value && styles.vehicleChipTextActive,
                  ]}
                >
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Vehicle number (e.g. MH12AB1234)"
            autoCapitalize="characters"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {needsRegistration ? 'Register' : 'Verify'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={resend} style={{ marginTop: 16 }}>
        <Text style={{ color: '#1877F2', textAlign: 'center' }}>Resend OTP</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0A0F24', marginBottom: 6 },
  subtitle: { color: '#888', marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  label: { fontSize: 14, color: '#555', marginBottom: 8, fontWeight: '600' },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 },
  vehicleChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  vehicleChipActive: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  vehicleChipText: { color: '#555', fontSize: 13 },
  vehicleChipTextActive: { color: '#fff', fontWeight: '600' },
  button: {
    backgroundColor: '#1877F2',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
