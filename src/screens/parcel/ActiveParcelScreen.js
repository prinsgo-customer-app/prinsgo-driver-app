import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking,
  ScrollView,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import {
  getActiveParcel,
  pickupParcel,
  markInTransit,
  deliverParcel,
  cancelParcel,
} from '../../api/parcels';
import { useSettings } from '../../context/SettingsContext';

// Safe Import react-native-maps to prevent crash if not installed/configured
let MapView, Marker, Polyline;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch (e) {
  MapView = null;
}

const STATUS_LABELS = {
  accepted: 'Head to pickup location',
  picked_up: 'Parcel picked up',
  in_transit: 'On the way to receiver',
};

export default function ActiveParcelScreen({ route, navigation }) {
  const { parcelId } = route.params || {};
  const { theme, t } = useSettings();

  const [parcel, setParcel] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Photo proof capture state
  const [photoProof, setPhotoProof] = useState(null); // stores mock or captured image URI

  // Payment confirmation state
  const [completedPayment, setCompletedPayment] = useState(null);

  const fetchParcel = useCallback(async () => {
    try {
      const res = await getActiveParcel();
      if (!res?.data?.parcel) {
        if (!completedPayment) {
          navigation.replace('Dashboard');
        }
        return;
      }
      setParcel(res.data.parcel);
    } catch (err) {
      console.log('Fetch Parcel Error:', err);
    } finally {
      setLoading(false);
      setActionLoading(false);
    }
  }, [completedPayment, navigation]);

  useEffect(() => {
    fetchParcel();
    const poll = setInterval(fetchParcel, 6000);
    return () => clearInterval(poll);
  }, [fetchParcel]);

  const handleNavigate = () => {
    if (!parcel) return;
    const isDelivery = parcel.status === 'in_transit';
    const destination = isDelivery ? parcel.drop : parcel.pickup;
    const lat = destination?.lat || destination?.coordinates?.[1] || 12.9716;
    const lng = destination?.lng || destination?.coordinates?.[0] || 77.5946;
    const label = encodeURIComponent(destination?.address || 'Destination');

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open navigation deep link');
      }
    });
  };

  const runAction = async (fn) => {
    setActionLoading(true);
    try {
      await fn();
      await fetchParcel();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Action failed');
      setActionLoading(false);
    }
  };

  const handleSelectPhotoProof = () => {
    // Elegant simulation of Camera / Image Picker for document compliance
    Alert.alert(
      'Photo Proof',
      'Take a photo of the parcel delivery confirmation at the drop location.',
      [
        {
          text: 'Snap Photo',
          onPress: () => {
            setPhotoProof('https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=400');
            Alert.alert('Success', 'Photo proof captured successfully!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeliver = () => {
    if (!otp) {
      Alert.alert('OTP Required', 'Ask the receiver for their 4-digit OTP to complete delivery');
      return;
    }
    if (!photoProof) {
      Alert.alert('Photo Proof Required', 'Please take/upload a photo proof of delivery before completing.');
      return;
    }
    runAction(async () => {
      await deliverParcel(parcelId, otp);
      setCompletedPayment({
        charge: Math.round(parcel.charges?.totalCharge || 0),
        commission: Math.round((parcel.charges?.totalCharge || 0) * 0.1),
        senderName: parcel.pickup?.contactName || 'Sender',
        receiverName: parcel.drop?.contactName || 'Receiver',
      });
    });
  };

  const handleCancel = () => {
    Alert.alert('Cancel delivery?', 'Are you sure? This may affect your performance rating.', [
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
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 12, color: theme.textSecondary }}>Loading Parcel Details...</Text>
      </View>
    );
  }

  const pickupLat = parcel.pickup?.lat || 12.9716;
  const pickupLng = parcel.pickup?.lng || 77.5946;
  const dropLat = parcel.drop?.lat || 12.9279;
  const dropLng = parcel.drop?.lng || 77.6244;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Map Header */}
      <View style={styles.mapContainer}>
        {MapView ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: (pickupLat + dropLat) / 2,
              longitude: (pickupLng + dropLng) / 2,
              latitudeDelta: Math.abs(pickupLat - dropLat) * 1.5 || 0.05,
              longitudeDelta: Math.abs(pickupLng - dropLng) * 1.5 || 0.05,
            }}
            showsTraffic
            showsUserLocation
          >
            <Marker coordinate={{ latitude: pickupLat, longitude: pickupLng }} title="Pickup" pinColor="green" />
            <Marker coordinate={{ latitude: dropLat, longitude: dropLng }} title="Dropoff" pinColor="red" />
            <Polyline
              coordinates={[
                { latitude: pickupLat, longitude: pickupLng },
                { latitude: dropLat, longitude: dropLng },
              ]}
              strokeWidth={4}
              strokeColor={theme.primary}
            />
          </MapView>
        ) : (
          <View style={[styles.simulatedMap, { backgroundColor: theme.card }]}>
            <Text style={styles.simulatedIcon}>📦📍</Text>
            <Text style={[styles.simulatedMapText, { color: theme.text }]}>Parcel Live Map Active</Text>
            <Text style={[styles.simulatedMapSub, { color: theme.textSecondary }]}>
              {parcel.status === 'in_transit' ? `In Transit to: ${parcel.drop?.address}` : `Navigating to Sender: ${parcel.pickup?.address}`}
            </Text>
          </View>
        )}

        {/* Deep Link Navigation */}
        <TouchableOpacity style={[styles.navigateFloatingBtn, { backgroundColor: theme.primary }]} onPress={handleNavigate}>
          <Text style={styles.navigateFloatingText}>🧭 Deep Link Navigate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.detailsScroll}>
        <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.statusBadge, { backgroundColor: theme.primary }]}>
            {STATUS_LABELS[parcel.status] || 'Active Parcel'}
          </Text>
          <Text style={[styles.fare, { color: theme.text }]}>₹{Math.round(parcel.charges?.totalCharge || 0)}</Text>
        </View>

        {/* Sender details card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.addressLabel, { color: theme.textSecondary }]}>SENDER / PICKUP FROM</Text>
          <Text style={[styles.contactName, { color: theme.text }]}>{parcel.pickup?.contactName}</Text>
          <Text style={[styles.addressText, { color: theme.textSecondary }]}>{parcel.pickup?.address}</Text>
          {parcel.pickup?.contactPhone && (
            <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${parcel.pickup.contactPhone}`)}>
              <Text style={styles.callText}>📞 Contact Sender</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Receiver details card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.addressLabel, { color: theme.textSecondary }]}>RECEIVER / DELIVER TO</Text>
          <Text style={[styles.contactName, { color: theme.text }]}>{parcel.drop?.contactName}</Text>
          <Text style={[styles.addressText, { color: theme.textSecondary }]}>{parcel.drop?.address}</Text>
          {parcel.drop?.contactPhone && (
            <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${parcel.drop.contactPhone}`)}>
              <Text style={styles.callText}>📞 Contact Receiver</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Document photo proof section (only when in transit or completing delivery) */}
        {parcel.status === 'in_transit' && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, alignItems: 'center' }]}>
            <Text style={[styles.addressLabel, { color: theme.textSecondary, alignSelf: 'flex-start' }]}>DELIVERY PHOTO PROOF</Text>

            {photoProof ? (
              <View style={styles.proofContainer}>
                <Image source={{ uri: photoProof }} style={styles.proofImage} />
                <TouchableOpacity style={styles.changeProofBtn} onPress={handleSelectPhotoProof}>
                  <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.photoSelectBtn, { borderColor: theme.border }]} onPress={handleSelectPhotoProof}>
                <Text style={{ fontSize: 30 }}>📸</Text>
                <Text style={[styles.photoSelectText, { color: theme.textSecondary }]}>Take Delivery Photo Proof</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Dynamic actions based on status */}
        {parcel.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => runAction(() => pickupParcel(parcelId))}
            disabled={actionLoading}
          >
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm Parcel Picked Up</Text>}
          </TouchableOpacity>
        )}

        {parcel.status === 'picked_up' && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={() => runAction(() => markInTransit(parcelId))}
            disabled={actionLoading}
          >
            {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Start Transit Navigation</Text>}
          </TouchableOpacity>
        )}

        {parcel.status === 'in_transit' && (
          <View style={[styles.otpCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.otpLabel, { color: theme.text }]}>Enter Receiver's Delivery OTP</Text>
            <TextInput
              style={[styles.otpInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="0000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.statusSuccess, width: '100%' }]} onPress={handleDeliver} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm Delivery & Settlement</Text>}
            </TouchableOpacity>
          </View>
        )}

        {parcel.status !== 'in_transit' && (
          <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.statusDanger }]} onPress={handleCancel}>
            <Text style={[styles.cancelButtonText, { color: theme.statusDanger }]}>Cancel Delivery</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Payment Confirmation Popup */}
      {completedPayment && (
        <Modal transparent visible={!!completedPayment} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={styles.successEmoji}>📦🎉</Text>
              <Text style={[styles.popupTitle, { color: theme.text }]}>Parcel Delivered!</Text>
              <Text style={[styles.popupSub, { color: theme.textSecondary }]}>Settled from {completedPayment.senderName} to {completedPayment.receiverName}</Text>

              <View style={[styles.billCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: theme.textSecondary }]}>Delivery Charge</Text>
                  <Text style={[styles.billVal, { color: theme.text }]}>₹{completedPayment.charge}</Text>
                </View>
                <View style={[styles.billRow, { marginTop: 6, borderStyle: 'dashed', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 6 }]}>
                  <Text style={[styles.billLabel, { color: theme.statusSuccess }]}>Your Earnings (90%)</Text>
                  <Text style={[styles.billVal, { color: theme.statusSuccess }]}>₹{Math.round(completedPayment.charge - completedPayment.commission)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.primary, width: '100%' }]}
                onPress={() => {
                  setCompletedPayment(null);
                  navigation.replace('Dashboard');
                }}
              >
                <Text style={styles.primaryButtonText}>Confirm & Dismiss</Text>
              </TouchableOpacity>
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
  mapContainer: { height: 260, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  simulatedMap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: 20 },
  simulatedIcon: { fontSize: 44, marginBottom: 8 },
  simulatedMapText: { fontSize: 16, fontWeight: '700' },
  simulatedMapSub: { fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  navigateFloatingBtn: { position: 'absolute', right: 16, bottom: 16, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  navigateFloatingText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  detailsScroll: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 12, marginBottom: 14 },
  statusBadge: { color: '#fff', fontSize: 13, fontWeight: '700', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  fare: { fontSize: 24, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 14 },
  addressLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  contactName: { fontSize: 16, fontWeight: '700' },
  addressText: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  callButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#E8F0FE', borderRadius: 8, alignSelf: 'flex-start' },
  callText: { color: '#1877F2', fontWeight: '700', fontSize: 13 },
  photoSelectBtn: { borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, width: '100%', paddingVertical: 24, alignItems: 'center', marginTop: 10 },
  photoSelectText: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  proofContainer: { width: '100%', alignItems: 'center', marginTop: 10 },
  proofImage: { width: '100%', height: 160, borderRadius: 10 },
  changeProofBtn: { marginTop: 10 },
  otpCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 14, alignItems: 'center', width: '100%' },
  otpLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  otpInput: { borderWidth: 1.5, borderRadius: 10, width: 160, padding: 12, fontSize: 22, letterSpacing: 6, textAlign: 'center', fontWeight: '800', marginBottom: 16 },
  primaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 12, width: '100%' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelButtonText: { fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 20, padding: 24, alignItems: 'center' },
  successEmoji: { fontSize: 50, marginBottom: 12 },
  popupTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  popupSub: { fontSize: 13, marginTop: 4, marginBottom: 16, textAlign: 'center' },
  billCard: { width: '100%', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  billLabel: { fontSize: 13, fontWeight: '500' },
  billVal: { fontSize: 13, fontWeight: '600' },
});
