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
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { setOnlineStatus, getNearbyRequests, updateLocation, getEarnings } from '../api/driver';
import { getActiveRide } from '../api/rides';
import { getActiveParcel } from '../api/parcels';
import { acceptRide } from '../api/rides';
import { acceptParcel } from '../api/parcels';
import { getSocket } from '../api/socket';

const { width, height } = Dimensions.get('window');

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
  const [activeTrip, setActiveTrip] = useState(null);
  const [checkingActive, setCheckingActive] = useState(true);

  // Incoming Request Popup Modal State
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [declinedIds, setDeclinedIds] = useState(new Set());

  const locationWatcher = useRef(null);
  const timerRef = useRef(null);

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

  useEffect(() => {
    checkActiveTrip();
    loadStats();
    const interval = setInterval(() => {
      checkActiveTrip();
      loadStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [checkActiveTrip, loadStats]);

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
      // ignore
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>PrinsGo</Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            {driver?.name || 'Driver Partner'}
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Earnings')}>
            <Text style={styles.headerIconText}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.headerIconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Online/Offline Status Banner */}
      <View style={[styles.statusCard, { backgroundColor: isOnline ? '#000000' : theme.card, borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusLabel, { color: isOnline ? '#FFFFFF' : theme.text }]}>
            {isOnline ? t.online : t.offline}
          </Text>
          <Text style={[styles.statusSub, { color: isOnline ? '#A0A0A0' : theme.textSecondary }]}>
            {isOnline ? t.lookingForRequests : t.goOnlineToStart}
          </Text>
        </View>
        {toggling ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ true: theme.primary, false: '#555555' }}
            thumbColor={isOnline ? '#000000' : '#FFFFFF'}
          />
        )}
      </View>

      {/* Warning approval badge */}
      {!driver?.isApproved && (
        <View style={[styles.warningBanner, { backgroundColor: theme.warning }]}>
          <Text style={[styles.warningText, { color: theme.warningText }]}>
            ⚠️ {t.pendingApproval}
          </Text>
        </View>
      )}

      {/* Active Trip Recovery */}
      {activeTrip && (
        <View style={[styles.activeTripCard, { borderColor: theme.primary, backgroundColor: theme.card }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.activeTripLabel, { color: theme.primary }]}>⚠️ Ongoing Session</Text>
            <Text style={[styles.activeTripDetails, { color: theme.text }]} numberOfLines={1}>
              {activeTrip.label}
            </Text>
          </View>
          <TouchableOpacity style={[styles.resumeButton, { backgroundColor: theme.primary }]} onPress={handleResumeTrip}>
            <Text style={styles.resumeButtonText}>Resume</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Summary Rows */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.rating}</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>⭐ {driver?.rating?.toFixed(1) || '5.0'}</Text>
        </View>
        <TouchableOpacity style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigation.navigate('Wallet')}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.walletBalance}</Text>
          <Text style={[styles.statValue, { color: theme.primary }]}>₹{Math.round(earningsData?.walletBalance || driver?.walletBalance || 0)}</Text>
        </TouchableOpacity>
      </View>

      {/* Opportunities List / Offline screen */}
      {isOnline ? (
        <View style={{ flex: 1, marginTop: 12 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Rides & Packages</Text>
            <TouchableOpacity style={styles.sosButton} onPress={() => navigation.navigate('Sos')}>
              <Text style={styles.sosButtonText}>🚨 SOS</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={combinedList}
            keyExtractor={(item) => `${item._kind}_${item._id}`}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor={theme.primary} />}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 54 }}>🛰️</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t.noRequests}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.requestHeaderRow}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badgeText}>
                      {item._kind === 'ride' ? '🚗 RIDE' : '📦 PARCEL'}
                    </Text>
                  </View>
                  <Text style={[styles.requestPrice, { color: theme.primary }]}>
                    ₹{Math.round(item._kind === 'ride' ? (item.fare?.totalFare || 0) : (item.charges?.totalCharge || 0))}
                  </Text>
                </View>

                <View style={styles.requestLocationBlock}>
                  <Text style={[styles.locationDetail, { color: theme.text }]} numberOfLines={1}>
                    📍 {item.pickup.address}
                  </Text>
                  {item._kind === 'ride' && (
                    <Text style={[styles.locationDetail, { color: theme.text, marginTop: 6 }]} numberOfLines={1}>
                      🏁 {item.drop.address}
                    </Text>
                  )}
                </View>

                <Text style={[styles.requestDistance, { color: theme.textSecondary }]}>
                  ⚡ {item.distanceToPickupKm} km away from your location
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
                    <Text style={styles.smallAcceptText}>Accept Offer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.offlinePlaceholder}>
          <Text style={styles.offlineIcon}>😴</Text>
          <Text style={[styles.offlineText, { color: theme.text }]}>You are Offline</Text>
          <Text style={[styles.offlineSubText, { color: theme.textSecondary }]}>
            Go online to start receiving real-time passenger rides and parcel delivery tasks.
          </Text>
          <TouchableOpacity style={[styles.offlineGoOnlineBtn, { backgroundColor: theme.primary }]} onPress={() => toggleOnline(true)}>
            <Text style={styles.offlineGoOnlineText}>GO ONLINE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 30s Real-time Booking Countdown Dialog */}
      {incomingRequest && (
        <Modal transparent visible={!!incomingRequest} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.primary }]}>

              <View style={[styles.timerBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.timerText}>{countdown}s</Text>
              </View>

              <Text style={[styles.popupTitle, { color: theme.text }]}>New Booking Request!</Text>
              <Text style={styles.popupSubTitle}>
                {incomingRequest._kind === 'ride' ? '🚗 Passenger Ride Offer' : '📦 Courier Package Mission'}
              </Text>

              <View style={[styles.popupDetailsCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>PICKUP ROUTE</Text>
                <Text style={[styles.popupDetailsText, { color: theme.text }]} numberOfLines={2}>
                  📍 {incomingRequest.pickup.address}
                </Text>

                {incomingRequest._kind === 'ride' && (
                  <>
                    <View style={{ height: 10 }} />
                    <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>DROPOFF ROUTE</Text>
                    <Text style={[styles.popupDetailsText, { color: theme.text }]} numberOfLines={2}>
                      🏁 {incomingRequest.drop.address}
                    </Text>
                  </>
                )}

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.popupMetaRow}>
                  <View>
                    <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>ESTIMATED DISTANCE</Text>
                    <Text style={[styles.popupMetaValue, { color: theme.text }]}>
                      {incomingRequest.distanceToPickupKm} km away
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.popupDetailsLabel, { color: theme.textSecondary }]}>NET ESTIMATE PAY</Text>
                    <Text style={[styles.popupMetaValue, { color: theme.primary }]}>
                      ₹{Math.round(incomingRequest._kind === 'ride' ? (incomingRequest.fare?.totalFare || 0) : (incomingRequest.charges?.totalCharge || 0))}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.popupButtonRow}>
                <TouchableOpacity style={[styles.popupRejectButton, { borderColor: theme.statusDanger }]} onPress={handleDecline}>
                  <Text style={[styles.popupRejectText, { color: theme.statusDanger }]}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.popupAcceptButton, { backgroundColor: theme.primary }]}
                  onPress={() =>
                    incomingRequest._kind === 'ride'
                      ? handleAcceptRide(incomingRequest._id)
                      : handleAcceptParcel(incomingRequest._id)
                  }
                >
                  <Text style={styles.popupAcceptText}>Accept Request</Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  subGreeting: { fontSize: 13, marginTop: 2, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: { fontSize: 18 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
  },
  statusLabel: { fontSize: 18, fontWeight: '800' },
  statusSub: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  warningBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
  },
  warningText: { fontSize: 12, fontWeight: '700' },
  activeTripCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTripLabel: { fontSize: 12, fontWeight: '800', marginBottom: 2 },
  activeTripDetails: { fontSize: 14, fontWeight: '700' },
  resumeButton: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  resumeButtonText: { color: '#000000', fontWeight: '800', fontSize: 13 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  statValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  sosButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EF4444', borderRadius: 8 },
  sosButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { textAlign: 'center', marginTop: 14, fontSize: 13, fontWeight: '600', maxWidth: 220, lineHeight: 18 },
  requestCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  requestHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badgeRow: { backgroundColor: '#000000', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  badgeText: { color: '#FFC72C', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  requestPrice: { fontSize: 22, fontWeight: '900' },
  requestLocationBlock: { marginVertical: 8 },
  locationDetail: { fontSize: 14, fontWeight: '600' },
  requestDistance: { fontSize: 12, fontWeight: '600', marginTop: 4, marginBottom: 16 },
  cardButtonRow: { flexDirection: 'row', gap: 10 },
  smallDeclineButton: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  smallDeclineText: { fontWeight: '800', fontSize: 13 },
  smallAcceptButton: { flex: 2, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  smallAcceptText: { color: '#000000', fontWeight: '800', fontSize: 13 },
  offlinePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36, marginTop: 40 },
  offlineIcon: { fontSize: 64, marginBottom: 16 },
  offlineText: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
  offlineSubText: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  offlineGoOnlineBtn: { width: '100%', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: '#FFC72C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  offlineGoOnlineText: { color: '#000000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  timerBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FFC72C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  timerText: { color: '#000000', fontSize: 20, fontWeight: '900' },
  popupTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  popupSubTitle: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 18, fontWeight: '700' },
  popupDetailsCard: { width: '100%', borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 24 },
  popupDetailsLabel: { fontSize: 10, fontWeight: '800', marginBottom: 4, letterSpacing: 0.8 },
  popupDetailsText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  divider: { height: 1, marginVertical: 14 },
  popupMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  popupMetaValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  popupButtonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  popupRejectButton: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  popupRejectText: { fontWeight: '800', fontSize: 15 },
  popupAcceptButton: { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  popupAcceptText: { color: '#000000', fontWeight: '800', fontSize: 15 },
});
