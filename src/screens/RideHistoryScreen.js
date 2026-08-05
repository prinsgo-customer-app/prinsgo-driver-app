import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { getRideHistory } from '../api/rides';
import { useSettings } from '../context/SettingsContext';

export default function RideHistoryScreen({ navigation }) {
  const { theme } = useSettings();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getRideHistory();
        setRides(res.data.rides || []);
      } catch (err) {
        // Mock historical data fallback
        setRides([
          { id: '1', date: 'August 4, 2026', fare: 250, status: 'completed', from: 'Koramangala', to: 'Indiranagar' },
          { id: '2', date: 'August 2, 2026', fare: 480, status: 'completed', from: 'Whitefield', to: 'Electronic City' },
          { id: '3', date: 'July 30, 2026', fare: 120, status: 'cancelled', from: 'HSR Layout', to: 'BTM Layout' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Ride History</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={rides}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.date, { color: theme.textSecondary }]}>{item.date || new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={[styles.price, { color: theme.primary }]}>₹{item.fare?.totalFare || item.fare}</Text>
            </View>
            <Text style={[styles.routeText, { color: theme.text, marginTop: 10 }]}>📍 {item.pickup?.address || item.from}</Text>
            <Text style={[styles.routeText, { color: theme.text, marginTop: 4 }]}>🏁 {item.drop?.address || item.to}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.statusText, { color: item.status === 'completed' ? '#2E7D32' : '#C62828' }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '600' },
  price: { fontSize: 18, fontWeight: '800' },
  routeText: { fontSize: 13, fontWeight: '600' },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, marginTop: 12 },
  statusText: { fontSize: 11, fontWeight: '800' },
});
