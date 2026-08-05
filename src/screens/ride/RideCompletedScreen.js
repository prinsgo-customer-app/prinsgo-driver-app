import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSettings } from '../../context/SettingsContext';

export default function RideCompletedScreen({ route, navigation }) {
  const { theme } = useSettings();
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.body}>
        <Text style={{ fontSize: 80 }}>🎉</Text>
        <Text style={[styles.title, { color: theme.text }]}>Ride Finished successfully!</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          The fare has been successfully processed and credited directly into your PrinsGo wallet balance.
        </Text>

        <View style={[styles.ratingBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.ratingLabel, { color: theme.textSecondary }]}>CUSTOMER PAYMENT MODE</Text>
          <Text style={[styles.ratingVal, { color: theme.text }]}>Online Cash/Wallet Settlement</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.replace('Dashboard')}
        >
          <Text style={styles.btnText}>Return to Online Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 13, textAlign: 'center', lineHeight: 18, color: '#888', marginBottom: 32 },
  ratingBox: { borderWidth: 1, borderRadius: 16, padding: 16, width: '100%', alignItems: 'center' },
  ratingLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  ratingVal: { fontSize: 15, fontWeight: '700' },
  footer: { padding: 20 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
