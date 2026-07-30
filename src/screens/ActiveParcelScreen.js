import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Linking } from 'react-native';
import {
  getActiveParcel,
  pickupParcel,
  markInTransit,
  deliverParcel,
  cancelParcel,
} from '../../api/parcels';

const STATUS_LABELS = {
  accepted: 'Head to pickup location',
  picked_up: 'Parcel picked up',
  in_transit: 'On the way to receiver',
};

export default function ActiveParcelScreen({ route, navigation }) {
  const { parcelId } = route.params;
  const [parcel, setParcel] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchParcel = useCallback(async () => {
    try {
      const res = await getActiveParcel();
      if (!res.data.parcel) {
        navigation.replace('Dashboard');
        return;
      }
      setParcel(res.data.parcel);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParcel();
    const poll = setInterval(fetchParcel, 6000);
    return () => clearInterval(poll);
  }, []);

  const runAction = async (fn) => {
    setActionLoading(true);
    try {
      await fn();
      fetchParcel();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = () => {
    if (!otp) {
      Alert.alert('OTP required', "Ask the receiver for their OTP to complete delivery");
      return;
    }
    runAction(async () => {
      await deliverParcel(parcelId, otp);
      Alert.alert('Delivered!', 'Parcel delivered successfully');
      navigation.replace('Dashboard');
    });
  };

  const handleCancel = () => {
    Alert.alert('Cancel delivery?', 'This may affect your rating.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: () =>
          runAction(async () => {
            await cancelParcel(parcelId, 'Cancelled by driver');
            navigation.replace('Dashboard');
          }),
      },
    ]);
  };

  if (loading || !parcel) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{STATUS_LABELS[parcel.status]}</Text>

      <View style={styles.card}>
        <Text style={styles.addressLabel}>PICKUP FROM</Text>
        <Text style={styles.contactName}>{parcel.pickup.contactName}</Text>
        <Text style={styles.addressText}>{parcel.pickup.address}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${parcel.pickup.contactPhone}`)}>
          <Text style={styles.callLink}>📞 Call sender</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.addressLabel}>DELIVER TO</Text>
        <Text style={styles.contactName}>{parcel.drop.contactName}</Text>
        <Text style={styles.addressText}>{parcel.drop.address}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${parcel.drop.contactPhone}`)}>
          <Text style={styles.callLink}>📞 Call receiver</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fare}>Charge: ₹{Math.round(parcel.charges.totalCharge)}</Text>

      {parcel.status === 'accepted' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => runAction(() => pickupParcel(parcelId))}
          disabled={actionLoading}
        >
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Picked Up</Text>}
        </TouchableOpacity>
      )}

      {parcel.status === 'picked_up' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => runAction(() => markInTransit(parcelId))}
          disabled={actionLoading}
        >
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Start Delivery</Text>}
        </TouchableOpacity>
      )}

      {parcel.status === 'in_transit' && (
        <>
          <TextInput
            style={styles.otpInput}
            placeholder="Enter receiver's OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleDeliver} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm Delivery</Text>}
          </TouchableOpacity>
        </>
      )}

      {parcel.status !== 'in_transit' && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Delivery</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  status: { fontSize: 18, fontWeight: '700', color: '#0A0F24', marginBottom: 16 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, marginBottom: 14 },
  addressLabel: { fontSize: 11, color: '#999', fontWeight: '700', marginBottom: 4 },
  contactName: { fontSize: 15, fontWeight: '700', color: '#0A0F24' },
  addressText: { fontSize: 14, color: '#333', marginTop: 2, marginBottom: 8 },
  callLink: { color: '#1877F2', fontWeight: '600' },
  fare: { fontSize: 16, fontWeight: '700', color: '#0A0F24', marginBottom: 20 },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: { backgroundColor: '#1877F2', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: { borderWidth: 1, borderColor: '#e53935', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelButtonText: { color: '#e53935', fontWeight: '700' },
});
