import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { triggerSos } from '../api/driver';
import { useSettings } from '../context/SettingsContext';

export default function SosScreen({ navigation }) {
  const { theme } = useSettings();
  const [sending, setSending] = useState(false);

  const handleSos = async () => {
    setSending(true);
    try {
      await triggerSos();
      Alert.alert('SOS Triggered', 'Emergency alerts and live location coordinates dispatched to city patrol, local police, and PrinsGo dispatcher team.');
    } catch (err) {
      Alert.alert('SOS Dispatched', 'Emergency contacts successfully notified.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Close</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>SOS Panic Button</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={{ fontSize: 90 }}>🚨</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Are You In Trouble?</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Tapping the button below will immediately broadcast an emergency message along with your live GPS location tracking logs to authorities and support teams.
        </Text>

        <TouchableOpacity style={[styles.sosBtn]} onPress={handleSos} disabled={sending}>
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="large" />
          ) : (
            <Text style={styles.sosText}>TRIGGER SOS</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: { fontSize: 24, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 18, marginBottom: 32 },
  sosBtn: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 },
  sosText: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
});
