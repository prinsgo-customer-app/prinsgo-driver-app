import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { setOnlineStatus, getNearbyRequests, updateLocation } from '../api/driver';
import { getActiveRide } from '../api/rides';
import { getActiveParcel } from '../api/parcels';
import { acceptRide } from '../api/rides';
import { acceptParcel } from '../api/parcels';

export default function DashboardScreen({ navigation }) {
  const { driver, refreshDriver } = useAuth();
  const [isOnline, setIsOnline] = useState(driver?.isOnline || false);
  const [toggling, setToggling] = useState(false);
  const [rides, setRides] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingActive, setCheckingActive] = useState(true);
  const locationWatcher = useRef(null);

  useEffect(() => {
    checkActiveTrip();
    return () => {
      if (locationWatcher.current) locationWatcher.current.remove();
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      startLocationUpdates();
      loadRequests();
      const interval = setInterval(loadRequests, 8000);
      return () => clearInterval(interval);
    } else if (locationWatcher.current) {
      locationWatcher.current.remove();
      locationWatcher.current = null;
    }
  }, [isOnline]);

  const checkActiveTrip = async () => {
    try {
      const rideRes = await getActiveRide();
      if (rideRes.data.ride) {
        navigation.replace('ActiveRide', { rideId: rideRes.data.ride._id });
        return;
      }
      const parcelRes = await getActiveParcel();
      if (parcelRes.data.parcel) {
        navigation.replace('ActiveParcel', { parcelId: parcelRes.data.parcel._id });
        return;
      }
    } catch (err) {
      // no active trip
    } finally {
      setCheckingActive(false);
    }
  };

  const startLocationUpdates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationWatcher.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 20 },
      (loc) => {
        updateLocation(loc.coords.latitude, loc.coords.longitude).catch(() => {});
      }
    );
  };

  const loadRequests = async () => {
    try {
      const res = await getNearbyRequests();
      setRides(res.data.nearbyRides || []);
      setParcels(res.data.nearbyParcels || []);
    } catch (err) {
      // ignore transient errors
    }
  };

  const toggleOnline = async (value) => {
    setToggling(true);
    try {
      await setOnlineStatus(value);
      setIsOnline(value);
      await refreshDriver();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setToggling(false);
    }
  };

  const handleAcceptRide = async (id) => {
    try {
      await acceptRide(id);
      navigation.replace('ActiveRide', { rideId: id });
    } catch (err) {
      Alert.alert('Could not accept', err.message);
      loadRequests();
    }
  };

  const handleAcceptParcel = async (id) => {
    try {
      await acceptParcel(id);
      navigation.replace('ActiveParcel', { parcelId: id });
    } catch (err) {
      Alert.alert('Could not accept', err.message);
      loadRequests();
    }
  };

  if (checkingActive) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  const combinedList = [
    ...rides.map((r) => ({ ...r, _kind: 'ride' })),
    ...parcels.map((p) => ({ ...p, _kind: 'parcel' })),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi {driver?.name?.split(' ')[0] || ''}</Text>
          <Text style={styles.subGreeting}>
            {driver?.vehicleType} • {driver?.vehicleNumber}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Earnings')}>
          <Text style={styles.earningsIcon}>💰</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View>
          <Text style={styles.statusLabel}>{isOnline ? "You're Online" : "You're Offline"}</Text>
          <Text style={styles.statusSub}>
            {isOnline ? 'Looking for requests nearby' : 'Go online to start receiving requests'}
          </Text>
        </View>
        {toggling ? (
          <ActivityIndicator color="#1877F2" />
        ) : (
          <Switch value={isOnline} onValueChange={toggleOnline} trackColor={{ true: '#1877F2' }} />
        )}
      </View>

      {!driver?.isApproved && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Your documents are pending admin approval. You can't go online yet.
          </Text>
        </View>
      )}

      {isOnline && (
        <FlatList
          data={combinedList}
          keyExtractor={(item) => `${item._kind}_${item._id}`}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No requests nearby yet. Stay online, we'll notify you.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              <Text style={styles.requestType}>
                {item._kind === 'ride' ? '🚗 Ride Request' : '📦 Parcel Request'}
              </Text>
              <Text style={styles.requestAddress}>Pickup: {item.pickup.address}</Text>
              {item._kind === 'ride' && (
                <Text style={styles.requestAddress}>Drop: {item.drop.address}</Text>
              )}
              <Text style={styles.requestMeta}>
                {item.distanceToPickupKm} km away
                {item._kind === 'ride' ? ` • ₹${Math.round(item.fare?.totalFare || 0)}` : ` • ₹${Math.round(item.charges?.totalCharge || 0)}`}
              </Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() =>
                  item._kind === 'ride' ? handleAcceptRide(item._id) : handleAcceptParcel(item._id)
                }
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#0A0F24' },
  subGreeting: { fontSize: 13, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  earningsIcon: { fontSize: 26 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 20,
  },
  statusLabel: { fontSize: 16, fontWeight: '700', color: '#0A0F24' },
  statusSub: { fontSize: 12, color: '#888', marginTop: 2, maxWidth: 220 },
  warningBanner: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },
  warningText: { color: '#B25000', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 60 },
  requestCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  requestType: { fontSize: 15, fontWeight: '700', color: '#0A0F24', marginBottom: 6 },
  requestAddress: { fontSize: 13, color: '#555', marginBottom: 2 },
  requestMeta: { fontSize: 13, color: '#1877F2', fontWeight: '600', marginTop: 6, marginBottom: 10 },
  acceptButton: { backgroundColor: '#1877F2', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontWeight: '700' },
});
