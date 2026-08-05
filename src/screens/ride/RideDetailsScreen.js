import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Linking } from 'react-native';
import { getActiveRide } from '../../api/rides';
import { useSettings } from '../../context/SettingsContext';

export default function RideDetailsScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const { theme } = useSettings();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getActiveRide();
        if (res.data?.ride) {
          setRide(res.data.ride);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [rideId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, fontSize: 16 }}>No active ride details found</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Ride Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>CUSTOMER INFO</Text>
          <Text style={[styles.val, { color: theme.text }]}>{ride.customer?.name || 'Passenger'}</Text>
          <Text style={[styles.subVal, { color: theme.textSecondary }]}>⭐ {ride.customer?.rating?.toFixed(1) || '5.0'}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>PICKUP LOCATION</Text>
          <Text style={[styles.val, { color: theme.text }]}>📍 {ride.pickup?.address}</Text>
          <View style={{ height: 16 }} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>DROPOFF LOCATION</Text>
          <Text style={[styles.val, { color: theme.text }]}>🏁 {ride.drop?.address}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>NET FARE PAYOUT</Text>
          <Text style={[styles.val, { color: theme.primary, fontSize: 24, fontWeight: '900' }]}>₹{Math.round(ride.fare?.totalFare || 0)}</Text>
          <Text style={[styles.subVal, { color: theme.textSecondary }]}>Includes all taxes & platform fees</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('NavigatePickup', { rideId })}
        >
          <Text style={styles.btnText}>Proceed to Ride Navigation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', marginBottom: 4, letterSpacing: 0.8 },
  val: { fontSize: 16, fontWeight: '700' },
  subVal: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
