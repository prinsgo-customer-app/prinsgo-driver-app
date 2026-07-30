import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getEarnings } from '../api/driver';

export default function EarningsScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getEarnings()
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Wallet Balance</Text>
        <Text style={styles.walletAmount}>₹{Math.round(data.walletBalance)}</Text>
      </View>

      {['today', 'week', 'month'].map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.rowLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <Text style={styles.rowValue}>₹{Math.round(data[key].totalEarnings)}</Text>
          <Text style={styles.rowMeta}>
            {data[key].rideCount} rides, {data[key].parcelCount} parcels
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0A0F24', marginBottom: 20 },
  walletCard: { backgroundColor: '#0A0F24', borderRadius: 14, padding: 20, marginBottom: 20 },
  walletLabel: { color: '#aaa', fontSize: 13 },
  walletAmount: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  row: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, marginBottom: 10 },
  rowLabel: { fontSize: 14, color: '#888' },
  rowValue: { fontSize: 20, fontWeight: '700', color: '#0A0F24', marginTop: 2 },
  rowMeta: { fontSize: 12, color: '#999', marginTop: 2 },
});
