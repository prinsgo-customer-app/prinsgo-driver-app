import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Linking } from 'react-native';
import { getActiveRide, markArrived, startRide, completeRide, cancelRide } from '../../api/rides';

const STATUS_LABELS = {
  accepted: 'Head to pickup location',
  driver_arrived: 'Waiting for customer OTP',
  started: 'Trip in progress',
};

export default function ActiveRideScreen({ route, navigation }) {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRide = useCallback(async () => {
    try {
      const res = await getActiveRide();
      if (!res.data.ride) {
        navigation.replace('Dashboard');
        return;
      }
      setRide(res.data.ride);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRide();
    const poll = setInterval(fetchRide, 6000);
    return () => clearInterval(poll);
  }, []);

  const handleArrived = async () => {
    setActionLoading(true);
    try {
      await markArrived(rideId);
      fetchRide();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (!otp) {
      Alert.alert('OTP required', "Ask the customer for their OTP to start the trip");
      return;
    }
    setActionLoading(true);
    try {
      await startRide(rideId, otp);
      fetchRide();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await completeRide(rideId);
      Alert.alert('Trip completed', 'Great job!');
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel ride?', 'This may affect your rating.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelRide(rideId, 'Cancelled by driver');
            navigation.replace('Dashboard');
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (loading || !ride) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{STATUS_LABELS[ride.status]}</Text>

      <View style={styles.card}>
        <Text style={styles.customerName}>{ride.customer?.name}</Text>
        <Text style={styles.customerMeta}>⭐ {ride.customer?.rating?.toFixed(1) || '5.0'}</Text>
        {ride.customer?.phone && (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${ride.customer.phone}`)}>
            <Text style={styles.callLink}>📞 Call customer</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.addressLabel}>PICKUP</Text>
        <Text style={styles.addressText}>{ride.pickup.address}</Text>
        <View style={{ height: 10 }} />
        <Text style={styles.addressLabel}>DROP</Text>
        <Text style={styles.addressText}>{ride.drop.address}</Text>
      </View>

      <Text style={styles.fare}>Fare: ₹{Math.round(ride.fare.totalFare)}</Text>

      {ride.status === 'accepted' && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleArrived} disabled={actionLoading}>
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Arrived at pickup</Text>}
        </TouchableOpacity>
      )}

      {ride.status === 'driver_arrived' && (
        <>
          <TextInput
            style={styles.otpInput}
            placeholder="Enter customer's OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Start Trip</Text>}
          </TouchableOpacity>
        </>
      )}

      {ride.status === 'started' && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleComplete} disabled={actionLoading}>
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Complete Trip</Text>}
        </TouchableOpacity>
      )}

      {ride.status !== 'started' && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
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
  customerName: { fontSize: 16, fontWeight: '700', color: '#0A0F24' },
  customerMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  callLink: { color: '#1877F2', marginTop: 8, fontWeight: '600' },
  addressLabel: { fontSize: 11, color: '#999', fontWeight: '700', marginBottom: 2 },
  addressText: { fontSize: 14, color: '#333' },
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
