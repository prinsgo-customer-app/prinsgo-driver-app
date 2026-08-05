import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Linking, TextInput } from 'react-native';
import { getActiveParcel, deliverParcel, markInTransit } from '../../api/parcels';
import { useSettings } from '../../context/SettingsContext';

export default function ParcelDeliveryScreen({ route, navigation }) {
  const { parcelId } = route.params || {};
  const { theme } = useSettings();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
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
    const lat = parcel.drop?.lat || 12.9279;
    const lng = parcel.drop?.lng || 77.6244;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to launch navigation maps'));
  };

  const handleDeliver = async () => {
    if (otp.length < 4) {
      Alert.alert('Error', 'Please ask receiver for delivery OTP first');
      return;
    }
    setUpdating(true);
    try {
      await deliverParcel(parcelId, otp);
      Alert.alert('Delivery Completed', 'The package has been verified and delivered successfully.', [
        { text: 'Awesome', onPress: () => navigation.replace('Dashboard') }
      ]);
    } catch (err) {
      Alert.alert('Delivery Failed', err.message || 'Incorrect OTP entered.');
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
        <Text style={{ fontSize: 60 }}>🚚📦</Text>
        <Text style={[styles.simTitle, { color: theme.text }]}>Delivering Package</Text>
        <Text style={[styles.simSub, { color: theme.textSecondary }]}>
          Receiver Name: {parcel?.drop?.contactName || 'Receiver'}{'\n'}
          Dropoff Address: {parcel?.drop?.address}
        </Text>

        <TextInput
          style={[styles.otpInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
          placeholder="Receiver OTP"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          maxLength={4}
          value={otp}
          onChangeText={setOtp}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: theme.primary }]} onPress={handleExternalNav}>
          <Text style={[styles.navBtnText, { color: theme.primary }]}>🧭 Open Delivery Map Direction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.statusSuccess }]}
          onPress={handleDeliver}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Verify OTP & Complete Delivery</Text>
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
  simSub: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  otpInput: { borderWidth: 1.5, borderRadius: 12, width: 160, paddingVertical: 12, fontSize: 18, fontWeight: '800', textAlign: 'center', letterSpacing: 4 },
  footer: { padding: 20, gap: 12 },
  navBtn: { borderWidth: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  navBtnText: { fontWeight: '800', fontSize: 15 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { fontWeight: '800', fontSize: 16 },
});
