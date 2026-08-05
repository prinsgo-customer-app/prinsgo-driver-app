import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { getActiveRide, markArrived } from '../../api/rides';
import { useSettings } from '../../context/SettingsContext';

export default function ArrivedPickupScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const { theme } = useSettings();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  const handleNotifyArrived = async () => {
    setUpdating(true);
    try {
      await markArrived(rideId);
      navigation.navigate('RideOtpVerification', { rideId });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
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
      <View style={styles.body}>
        <Text style={{ fontSize: 72 }}>📍</Text>
        <Text style={[styles.title, { color: theme.text }]}>You've Reached Pickup Location</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Please tap below to notify the customer that you have arrived and are waiting at their exact pickup coordinate.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.pName, { color: theme.text }]}>{ride?.customer?.name || 'Passenger'}</Text>
          <Text style={[styles.pAddr, { color: theme.textSecondary }]}>{ride?.pickup?.address}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleNotifyArrived}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Notify Passenger Arrival</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '900', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 13, textAlign: 'center', lineHeight: 18, color: '#888', marginBottom: 24 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, width: '100%', alignItems: 'center' },
  pName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  pAddr: { fontSize: 13, textAlign: 'center' },
  footer: { padding: 20 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
