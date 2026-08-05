import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function MaintenanceScreen() {
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.body}>
        <Text style={{ fontSize: 80 }}>🔧</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Downtime Maintenance Active</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          PrinsGo services are temporarily undergoing a routine server migration database tuning. We will be back online instantly. Thank you for your cooperation partner.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: { fontSize: 22, fontWeight: '900', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
});
