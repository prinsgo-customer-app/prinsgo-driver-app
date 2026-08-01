import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Linking, Keyboard } from 'react-native';
import { getActiveRide, markArrived, startRide, completeRide, cancelRide } from '../../api/rides';

const STATUS_LABELS = {
  accepted: 'Head to pickup location',
  driver_arrived: 'Waiting for customer OTP',
  started: 'Trip in progress',
};

export default function ActiveRideScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRide = useCallback(async () => {
    try {
      const res = await getActiveRide();
      if (!res?.data?.ride) {
        navigation.replace('Dashboard');
        return;
      }
      setRide(res.data.ride);
    } catch (err) {
      console.log("Fetch Ride Error: ", err);
    } finally {
      setLoading(false);
      setActionLoading(false); // Ensures button loader doesn't get stuck
    }
  }, [navigation]);

  useEffect(() => {
    fetchRide();
    // 6 second me auto-refresh (Agar socket fail ho jaye toh ye backup hai)
    const poll = setInterval(fetchRide, 6000);
    return () => clearInterval(poll);
  }, [fetchRide]);

  const handleArrived = async () => {
    setActionLoading(true);
    try {
      await markArrived(rideId);
      await fetchRide();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to update status');
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('OTP Required', "Please enter the 4-digit OTP from the customer.");
      return;
    }
    Keyboard.dismiss(); // Keyboard ko automatically hide karne ke liye
    setActionLoading(true);
    try {
      await startRide(rideId, otp);
      await fetchRide();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to start ride');
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await completeRide(rideId);
      Alert.alert('Trip Completed', 'Great job! Payment settled.');
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to complete trip');
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Ride?', 'Are you sure you want to cancel? This may affect your rating.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await cancelRide(rideId, 'Cancelled by driver');
            navigation.replace('Dashboard');
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to cancel');
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  // Jab tak data load na ho, loader dikhayein
  if (loading || !ride) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877F2" />
        <Text style={{ marginTop: 12, color: '#666' }}>Loading Ride Details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{STATUS_LABELS[ride.status] || 'Ride in progress'}</Text>

      {/* Customer Info Card */}
      <View style={styles.card}>
        <Text style={styles.customerName}>{ride?.customer?.name || 'Customer'}</Text>
        <Text style={styles.customerMeta}>⭐ {ride?.customer?.rating?.toFixed(1) || '5.0'}</Text>
        {ride?.customer?.phone && (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${ride.customer.phone}`)}>
            <Text style={styles.callLink}>📞 Call Customer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Location Card */}
      <View style={styles.card}>
        <Text style={styles.addressLabel}>PICKUP</Text>
        <Text style={styles.addressText}>{ride?.pickup?.address || 'Loading...'}</Text>
        <View style={{ height: 12 }} />
        <Text style={styles.addressLabel}>DROP</Text>
        <Text style={styles.addressText}>{ride?.drop?.address || 'Loading...'}</Text>
      </View>

      <Text style={styles.fare}>Fare: ₹{Math.round(ride?.fare?.totalFare || 0)}</Text>

      {/* Dynamic Buttons based on Ride Status */}
      {ride.status === 'accepted' && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleArrived} disabled={actionLoading}>
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Arrived at Pickup</Text>}
        </TouchableOpacity>
      )}

      {ride.status === 'driver_arrived' && (
        <View>
          <TextInput
            style={styles.otpInput}
            placeholder="Enter 4-digit OTP"
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
            editable={!actionLoading}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Start Trip</Text>}
          </TouchableOpacity>
        </View>
      )}

      {ride.status === 'started' && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleComplete} disabled={actionLoading}>
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Complete Trip</Text>}
        </TouchableOpacity>
      )}

      {ride.status !== 'started' && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={actionLoading}>
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  status: { fontSize: 20, fontWeight: '700', color: '#0A0F24', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  customerName: { fontSize: 17, fontWeight: '700', color: '#0A0F24' },
  customerMeta: { fontSize: 14, color: '#888', marginTop: 4 },
  callLink: { color: '#1877F2', marginTop: 10, fontWeight: '700', fontSize: 15 },
  addressLabel: { fontSize: 12, color: '#999', fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  addressText: { fontSize: 15, color: '#333', fontWeight: '500', lineHeight: 22 },
  fare: { fontSize: 22, fontWeight: '800', color: '#0A0F24', marginBottom: 24, textAlign: 'center' },
  otpInput: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 16, fontSize: 20, marginBottom: 16, textAlign: 'center', letterSpacing: 4, fontWeight: '700' },
  primaryButton: { backgroundColor: '#1877F2', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 14, elevation: 3 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  cancelButton: { borderWidth: 1.5, borderColor: '#e53935', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelButtonText: { color: '#e53935', fontWeight: '700', fontSize: 16 },
});
