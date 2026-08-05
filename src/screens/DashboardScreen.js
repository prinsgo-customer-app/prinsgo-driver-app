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
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { setOnlineStatus, getNearbyRequests, updateLocation, getEarnings } from '../api/driver';
import { getActiveRide } from '../api/rides';
import { getActiveParcel } from '../api/parcels';
import { acceptRide } from '../api/rides';
import { acceptParcel } from '../api/parcels';
import { getSocket, onNewRequest } from '../api/socket';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { driver, refreshDriver } = useAuth();
  const { theme, t, isDarkMode } = useSettings();

  const [isOnline, setIsOnline] = useState(driver?.isOnline || false);
  const [toggling, setToggling] = useState(false);
  const [rides, setRides] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active/Ongoing trip info
  const [activeTrip, setActiveTrip] = useState(null); // { type: 'ride'|'parcel', id: string, label: string }
  const [checkingActive, setCheckingActive] = useState(true);

  // Incoming Request Popup Modal State
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [declinedIds, setDeclinedIds] = useState(new Set());

  const locationWatcher = useRef(null);
  const timerRef = useRef(null);

  // Load driver statistics & current status
  const loadStats = useCallback(async () => {
    try {
      const res = await getEarnings();
      setEarningsData(res.data);
    } catch (err) {
      console.log('Failed to fetch stats:', err);
    }
  }, []);

  const checkActiveTrip = useCallback(async () => {
    try {
      const rideRes = await getActiveRide();
      if (rideRes.data.ride) {
        setActiveTrip({
          type: 'ride',
          id: rideRes.data.ride._id,
          label: `Ride to ${rideRes.data.ride.drop?.address || 'Destination'}`
        });
        return;
      }
      const parcelRes = await getActiveParcel();
      if (parcelRes.data.parcel) {
        setActiveTrip({
          type: 'parcel',
          id: parcelRes.data.parcel._id,
          label: `Parcel to ${parcelRes.data.parcel.drop?.contactName || 'Receiver'}`
        });
        return;
      }
      setActiveTrip(null);
    } catch (err) {
      setActiveTrip(null);
    } finally {
      setCheckingActive(false);
    }
  }, []);

  // Poll active trip periodically
  useEffect(() => {
    checkActiveTrip();
    loadStats();
    const interval = setInterval(() => {
      checkActiveTrip();
      loadStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [checkActiveTrip, loadStats]);

  // Handle Location tracking and nearby polling
  useEffect(() => {
    if (isOnline) {
      startLocationUpdates();
      loadRequests();
      const interval = setInterval(loadRequests, 8000);
      return () => {
        clearInterval(interval);
        if (locationWatcher.current) {
          locationWatcher.current.remove();
          locationWatcher.current = null;
        }
      };
    } else {
      if (locationWatcher.current) {
        locationWatcher.current.remove();
        locationWatcher.current = null;
      }
    }
  }, [isOnline]);

  // Socket.IO real-time request listener
  useEffect(() => {
    if (isOnline) {
      const socket = getSocket();
      socket.connect();

      const handleNewRide = (ride) => {
        if (!activeTrip && !incomingRequest && !declinedIds.has(ride._id)) {
          triggerIncomingRequest({ ...ride, _kind: 'ride' });
        }
      };

      const handleNewParcel = (parcel) => {
        if (!activeTrip && !incomingRequest && !declinedIds.has(parcel._id)) {
          triggerIncomingRequest({ ...parcel, _kind: 'parcel' });
        }
      };

      socket.on('new_ride_request', handleNewRide);
      socket.on('new_parcel_request', handleNewParcel);

      return () => {
        socket.off('new_ride_request', handleNewRide);
        socket.off('new_parcel_request', handleNewParcel);
      };
    }
  }, [isOnline, activeTrip, incomingRequest, declinedIds]);

  // Setup Popup Timer Countdown
  useEffect(() => {
    if (incomingRequest) {
      setCountdown(30);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleDecline();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [incomingRequest]);

  const triggerIncomingRequest = (req) => {
    setIncomingRequest(req);
  };

  const startLocationUpdates = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationWatcher.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (loc) => {
          updateLocation(loc.coords.latitude, loc.coords.longitude).catch(() => {});
        }
      );
    } catch (err) {
      console.log('Location watch error:', err);
    }
  };

  const loadRequests = async () => {
    if (!isOnline) return;
    try {
      const res = await getNearbyRequests();
      const fetchedRides = res.data.nearbyRides || [];
      const fetchedParcels = res.data.nearbyParcels || [];

      setRides(fetchedRides);
      setParcels(fetchedParcels);

      // If there's an extremely fresh request and we are not busy, pop it up!
      if (!activeTrip && !incomingRequest) {
        const combined = [
          ...fetchedRides.map(r => ({ ...r, _kind: 'ride' })),
          ...fetchedParcels.map(p => ({ ...p, _kind: 'parcel' }))
        ].filter(item => !declinedIds.has(item._id));

        if (combined.length > 0) {
          triggerIncomingRequest(combined[0]);
        }
      }
    } catch (err) {
      // transient errors ignored
    }
  };

  const toggleOnline = async (value) => {
    if (!driver?.isApproved && value) {
      Alert.alert('Verification Needed', t.pendingApproval);
      return;
    }
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
    setIncomingRequest(null);
    try {
      await acceptRide(id);
      navigation.navigate('ActiveRide', { rideId: id });
    } catch (err) {
      Alert.alert('Could not accept', err.message);
      loadRequests();
    }
  };

  const handleAcceptParcel = async (id) => {
    setIncomingRequest(null);
    try {
      await acceptParcel(id);
      navigation.navigate('ActiveParcel', { parcelId: id });
    } catch (err) {
      Alert.alert('Could not accept', err.message);
      loadRequests();
    }
  };

  const handleDecline = () => {
    if (incomingRequest) {
      setDeclinedIds((prev) => {
        const updated = new Set(prev);
        updated.add(incomingRequest._id);
        return updated;
      });
    }
    setIncomingRequest(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleResumeTrip = () => {
    if (activeTrip) {
      if (activeTrip.type === 'ride') {
        navigation.navigate('ActiveRide', { rideId: activeTrip.id });
      } else {
        navigation.navigate('ActiveParcel', { parcelId: activeTrip.id });
      }
    }
  };

  if (checkingActive) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const combinedList = [
    ...rides.map((r) => ({ ...r, _kind: 'ride' })),
    ...parcels.map((p) => ({ ...p, _kind: 'parcel' })),
  ].filter(item => !declinedIds.has(item._id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Premium Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            {t.dashboard}
          </Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            {driver?.name || 'Driver'} • {driver?.vehicleNumber || 'No Plate'}
          </Text>
        </View>

        {/* Quick Menu Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Earnings')}>
            <Text style={styles.headerIconText}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.headerIconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Online / Offline Banner */}
      <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusLabel, { color: theme.text }]}>
            {isOnline ? t.online : t.offline}
          </Text>
          <Text style={[styles.statusSub, { color: theme.textSecondary }]}>
            {isOnline ? t.lookingForRequests : t.goOnlineToStart}
          </Text>
        </View>
        {toggling ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ true: theme.primary, false: '#ccc' }}
            thumbColor={isOnline ? '#fff' : '#f4f3f4'}
          />
        )}
      </View>

      {/* Approval Status Alert Banner */}
      {!driver?.isApproved && (
        <View style={[styles.warningBanner, { backgroundColor: theme.warning }]}>
          <Text style={[styles.warningText, { color: theme.warningText }]}>
            ⚠️ {t.pendingApproval}
          </Text>
        </View>
      )}

      {/* Active Trip Resume Card */}
      {activeTrip && (
        <View style={[styles.activeTripCard, { borderColor: theme.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.activeTripLabel, { color: theme.primary }]}>⚠️ {t.activeTrip}</Text>
            <Text style={[styles.activeTripDetails, { color: theme.text }]} numberOfLines={1}>
              {activeTrip.label}
            </Text>
          </View>
          <TouchableOpacity style={[styles.resumeButton, { backgroundColor: theme.primary }]} onPress={handleResumeTrip}>
            <Text style={styles.resumeButtonText}>{t.resumeTrip}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Summary Panel */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.rating}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>⭐ {driver?.rating?.toFixed(1) || '5.0'}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.walletBalance}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>₹{Math.round(earningsData?.walletBalance || driver?.walletBalance || 0)}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.todayRides}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {earningsData?.today?.rideCount || 0}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.todayEarnings}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ₹{Math.round(earningsData?.today?.totalEarnings || 0)}
          </Text>
        </View>
      </View>

      {/* Request list */}
      <View style={{ flex: 1, marginTop: 16 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {isOnline ? 'Nearby Opportunities' : 'Go Online to View Opportunities'}
        </Text>

        {isOnline ? (
          <FlatList
            data={combinedList}
            keyExtractor={(item) => `${item._kind}_${item._id}`}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t.noRequests}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.requestHeaderRow}>
                  <Text style={[styles.requestType, { color: theme.text }]}>
                    {item._kind === 'ride' ? '🚗 Ride' : '📦 Parcel'}
                  </Text>
                  <Text style={[styles.requestPrice, { color: theme.primary }]}>
                    ₹{Math.round(item._kind === 'ride' ? (item.fare?.totalFare || 0) : (item.charges?.totalCharge || 0))}
                  </Text>
                </View>
                <Text style={[styles.requestAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                  📍 Pickup: {item.pickup.address}
                </Text>
                {item._kind === 'ride' && (
                  <Text style={[styles.requestAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                    🏁 Drop: {item.drop.address}
                  </Text>
                )}
                <Text style={[styles.requestDistance, { color: theme.primary }]}>
                  ⚡ {item.distanceToPickupKm} km away
                </Text>

                <View style={styles.cardButtonRow}>
                  <TouchableOpacity
                    style={[styles.smallDeclineButton, { borderColor: theme.statusDanger }]}
                    onPress={() => {
                      setDeclinedIds(prev => {
                        const next = new Set(prev);
                        next.add(item._id);
                        return next;
                      });
                    }}
                  >
                    <Text style={[styles.smallDeclineText, { color: theme.statusDanger }]}>Dismiss</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallAcceptButton, { backgroundColor: theme.primary }]}
                    onPress={() =>
                      item._kind === 'ride' ? handleAcceptRide(item._id) : handleAcceptParcel(item._id)
                    }
                  >
                    <Text style={styles.smallAcceptText}>{t.accept}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.offlinePlaceholder}>
            <Text style={{ fontSize: 50 }}>😴</Text>
            <Text style={[styles.offlineText, { color: theme.textSecondary }]}>
              You are currently offline
            </Text>
          </View>
        )}
      </View>

      {/* Real-time Ride Request Popup Modal */}
      {incomingRequest && (
        <Modal transparent visible={!!incomingRequest} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>

              {/* Alert Timer Ring Visual */}
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>{countdown}s</Text>
              </View>

              <Text style={[styles.popupTitle, { color: theme.text }]}>{t.incomingRequest}</Text>
              <Text style={styles.popupSubTitle}>
                {incomingRequest._kind === 'ride' ? '🚗 Ride Request' : '📦 Parcel Request'}
              </Text>

              {/* Trip details */}
              <View style={[styles.popupDetailsCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>PICKUP</Text>
                <Text style={[styles.popupDetailsText, { color: theme.text }]} numberOfLines={2}>
                  📍 {incomingRequest.pickup.address}
                </Text>

                {incomingRequest._kind === 'ride' && (
                  <>
                    <View style={{ height: 10 }} />
                    <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>DROP</Text>
                    <Text style={[styles.popupDetailsText, { color: theme.text }]} numberOfLines={2}>
                      🏁 {incomingRequest.drop.address}
                    </Text>
                  </>
                )}

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.popupMetaRow}>
                  <View>
                    <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>DISTANCE</Text>
                    <Text style={[styles.popupMetaValue, { color: theme.text }]}>
                      {incomingRequest.distanceToPickupKm} km away
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>PAYOUT</Text>
                    <Text style={[styles.popupMetaValue, { color: theme.primary, fontWeight: '800' }]}>
                      ₹{Math.round(incomingRequest._kind === 'ride' ? (incomingRequest.fare?.totalFare || 0) : (incomingRequest.charges?.totalCharge || 0))}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.popupButtonRow}>
                <TouchableOpacity style={[styles.popupRejectButton, { borderColor: theme.statusDanger }]} onPress={handleDecline}>
                  <Text style={[styles.popupRejectText, { color: theme.statusDanger }]}>{t.reject}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.popupAcceptButton, { backgroundColor: theme.primary }]}
                  onPress={() =>
                    incomingRequest._kind === 'ride'
                      ? handleAcceptRide(incomingRequest._id)
                      : handleAcceptParcel(incomingRequest._id)
                  }
                >
                  <Text style={styles.popupAcceptText}>{t.accept}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 20, fontWeight: '800' },
  subGreeting: { fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerIconText: { fontSize: 18 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 14,
  },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusSub: { fontSize: 12, marginTop: 2, maxWidth: 220 },
  warningBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
  },
  warningText: { fontSize: 12, fontWeight: '600' },
  activeTripCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeTripLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  activeTripDetails: { fontSize: 14, fontWeight: '600' },
  resumeButton: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  resumeButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: 'center', marginTop: 40, marginHorizontal: 40, fontSize: 13, lineHeight: 18 },
  requestCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  requestHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  requestType: { fontSize: 15, fontWeight: '700' },
  requestPrice: { fontSize: 18, fontWeight: '800' },
  requestAddress: { fontSize: 13, marginBottom: 4 },
  requestDistance: { fontSize: 12, fontWeight: '600', marginTop: 4, marginBottom: 12 },
  cardButtonRow: { flexDirection: 'row', gap: 10 },
  smallDeclineButton: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  smallDeclineText: { fontWeight: '700', fontSize: 13 },
  smallAcceptButton: { flex: 2, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  smallAcceptText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  offlinePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  offlineText: { fontSize: 14, marginTop: 10, fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  timerBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  popupTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  popupSubTitle: { fontSize: 14, color: '#888', marginTop: 2, marginBottom: 16, fontWeight: '600' },
  popupDetailsCard: { width: '100%', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  popupDetailsLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  popupDetailsText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  divider: { height: 1, marginVertical: 12 },
  popupMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  popupMetaValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  popupButtonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  popupRejectButton: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  popupRejectText: { fontWeight: '700', fontSize: 15 },
  popupAcceptButton: { flex: 2, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  popupAcceptText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
