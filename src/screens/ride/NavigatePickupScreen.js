import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Linking, Alert } from 'react-native';
import { getActiveRide } from '../../api/rides';
import { useSettings } from '../../context/SettingsContext';

export default function NavigatePickupScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const { theme } = useSettings();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
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
    fetchRide();
  }, [rideId]);

  const handleExternalNav = () => {
    if (!ride) return;
    const lat = ride.pickup?.lat || 12.9716;
    const lng = ride.pickup?.lng || 77.5946;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to launch navigation app'));
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.simulatedMap}>
        <Text style={{ fontSize: 60 }}>🗺️</Text>
        <Text style={[styles.simTitle, { color: theme.text }]}>Navigating to Customer Pickup</Text>
        <Text style={[styles.simSub, { color: theme.textSecondary }]}>
          Passenger: {ride?.customer?.name || 'Passenger'}{'\n'}
          Pickup Address: {ride?.pickup?.address}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: theme.primary }]} onPress={handleExternalNav}>
          <Text style={[styles.navBtnText, { color: theme.primary }]}>🧭 Open Google Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('ArrivedPickup', { rideId })}
        >
          <Text style={styles.btnText}>I Have Arrived</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  simulatedMap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  simTitle: { fontSize: 20, fontWeight: '800', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  simSub: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  footer: { padding: 20, gap: 12 },
  navBtn: { borderWidth: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  navBtnText: { fontWeight: '800', fontSize: 15 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
