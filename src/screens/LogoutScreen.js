import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function LogoutScreen({ navigation }) {
  const { logout } = useAuth();
  const { theme } = useSettings();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.log(err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.body}>
        <Text style={{ fontSize: 80 }}>🚪</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Logout Confirmation</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Are you sure you want to log out from PrinsGo Driver Partner application session? This will turn off your active coordinates tracking.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => navigation.goBack()} disabled={loggingOut}>
          <Text style={[styles.cancelText, { color: theme.text }]}>No, Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.statusDanger }]} onPress={handleLogout} disabled={loggingOut}>
          {loggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutText}>Yes, Logout Partner</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: { fontSize: 22, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  footer: { padding: 20, gap: 12 },
  cancelBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontWeight: '800', fontSize: 15 },
  logoutBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
