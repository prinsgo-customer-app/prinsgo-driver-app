import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Linking } from 'react-native';
import { getActiveParcel, pickupParcel } from '../../api/parcels';
import { useSettings } from '../../context/SettingsContext';

export default function ParcelPickupScreen({ route, navigation }) {
  const { parcelId } = route.params || {};
  const { theme } = useSettings();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const res = await getActiveParcel();
        if (res.data?.parcel) {
          setParcel(res.data.parcel);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [parcelId]);

  const handleExternalNav = () => {
    if (!parcel) return;
    const lat = parcel.pickup?.lat || 12.9716;
    const lng = parcel.pickup?.lng || 77.5946;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to launch navigation maps'));
  };

  const handlePickup = async () => {
    setUpdating(true);
    try {
      await pickupParcel(parcelId);
      navigation.navigate('ParcelDelivery', { parcelId });
    } catch (err) {
      Alert.alert('Pickup Failed', err.message || 'Failed to update courier status');
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
      <View style={styles.simulatedMap}>
        <Text style={{ fontSize: 60 }}>📦🚶</Text>
        <Text style={[styles.simTitle, { color: theme.text }]}>Navigating to Parcel Pickup</Text>
        <Text style={[styles.simSub, { color: theme.textSecondary }]}>
          Sender Name: {parcel?.pickup?.contactName || 'Sender'}{'\n'}
          Address: {parcel?.pickup?.address}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: theme.primary }]} onPress={handleExternalNav}>
          <Text style={[styles.navBtnText, { color: theme.primary }]}>🧭 Nav to Sender Address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handlePickup}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Confirm Parcel Picked Up</Text>
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
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
