import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { startRide } from '../../api/rides';
import { useSettings } from '../../context/SettingsContext';

export default function RideOtpVerificationScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const { theme } = useSettings();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid 4-digit verification code.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      await startRide(rideId, otp);
      navigation.navigate('RideInProgress', { rideId });
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'Incorrect OTP entered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.body}>
        <Text style={{ fontSize: 72 }}>🔑</Text>
        <Text style={[styles.title, { color: theme.text }]}>Enter Ride Starter OTP</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          For safety and security, ask the passenger for their unique 4-digit PIN before initiating the transit route.
        </Text>

        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
          placeholder="0000"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          maxLength={4}
          value={otp}
          onChangeText={setOtp}
          editable={!loading}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Verify & Start Trip</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 22, fontWeight: '900', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 13, textAlign: 'center', lineHeight: 18, color: '#888', marginBottom: 24 },
  input: { borderWidth: 1.5, borderRadius: 14, width: 160, padding: 16, fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: 8 },
  footer: { padding: 20 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
