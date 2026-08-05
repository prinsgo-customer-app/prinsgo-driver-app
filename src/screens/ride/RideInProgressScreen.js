import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Linking } from 'react-native';
import { getActiveRide, completeRide } from '../../api/rides';
import { useSettings } from '../../context/SettingsContext';

export default function RideInProgressScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const { theme } = useSettings();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

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
    const lat = ride.drop?.lat || 12.9279;
    const lng = ride.drop?.lng || 77.6244;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to launch maps'));
  };

  const handleCompleteRide = async () => {
    setCompleting(true);
    try {
      await completeRide(rideId);
      navigation.navigate('RideCompleted', { rideId });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to complete trip');
    } finally {
      setCompleting(false);
    }
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
        <Text style={{ fontSize: 60 }}>🚙💨</Text>
        <Text style={[styles.simTitle, { color: theme.text }]}>Ride In Progress</Text>
        <Text style={[styles.simSub, { color: theme.textSecondary }]}>
          Currently navigating to Dropoff point{'\n'}
          Dropoff: {ride?.drop?.address}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: theme.primary }]} onPress={handleExternalNav}>
          <Text style={[styles.navBtnText, { color: theme.primary }]}>🧭 Live Google Maps Navigation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.statusSuccess }]}
          onPress={handleCompleteRide}
          disabled={completing}
        >
          {completing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Complete Trip</Text>
          )}
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
  btnText: { fontWeight: '800', fontSize: 16 },
});
