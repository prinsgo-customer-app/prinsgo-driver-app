import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { sendOtp } from '../../api/auth';
import { useSettings } from '../../context/SettingsContext';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useSettings();

  const handleContinue = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      navigation.navigate('Otp', { phone });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>
            Prins<Text style={{ color: theme.primary }}>Go</Text>
          </Text>
          <Text style={styles.tagline}>ENTERPRISE PARTNER APP</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter your mobile number</Text>
          <View style={[styles.inputRow, { borderColor: theme.border }]}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={[styles.input, { color: '#FFFFFF' }]}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="9876543210"
              placeholderTextColor="#666666"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }, loading && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', textAlign: 'center' },
  tagline: { fontSize: 12, fontWeight: '800', color: '#888888', marginTop: 6, letterSpacing: 3 },
  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', color: '#AAAAAA', marginBottom: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 28,
    height: 56,
  },
  prefix: { fontSize: 16, color: '#FFFFFF', marginRight: 10, fontWeight: '700' },
  input: { flex: 1, fontSize: 16, height: '100%', fontWeight: '600' },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FFC72C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '800' },
});
