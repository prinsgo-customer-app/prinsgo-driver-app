import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { getActiveParcel, acceptParcel } from '../../api/parcels';
import { useSettings } from '../../context/SettingsContext';

export default function ParcelRequestScreen({ route, navigation }) {
  const { parcelId } = route.params || {};
  const { theme } = useSettings();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchParcelDetails = async () => {
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
    fetchParcelDetails();
  }, [parcelId]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptParcel(parcelId);
      navigation.navigate('ParcelPickup', { parcelId });
    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to accept parcel request');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!parcel) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, fontSize: 16 }}>No active parcel request found</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Dismiss</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Parcel Request Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>SENDER CONTACT</Text>
          <Text style={[styles.val, { color: theme.text }]}>{parcel.pickup?.contactName || 'Anonymous Sender'}</Text>
          <Text style={[styles.subVal, { color: theme.textSecondary }]}>📱 {parcel.pickup?.contactPhone}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>PICKUP FROM</Text>
          <Text style={[styles.val, { color: theme.text }]}>📍 {parcel.pickup?.address}</Text>
          <View style={{ height: 16 }} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>DELIVER TO</Text>
          <Text style={[styles.val, { color: theme.text }]}>🏁 {parcel.drop?.address}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>DELIVERY FARE PAYOUT</Text>
          <Text style={[styles.val, { color: theme.primary, fontSize: 24, fontWeight: '900' }]}>₹{Math.round(parcel.charges?.totalCharge || 0)}</Text>
          <Text style={[styles.subVal, { color: theme.textSecondary }]}>90% earnings directly added to your wallet</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={handleAccept}
          disabled={accepting}
        >
          {accepting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Accept Package Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', marginBottom: 4, letterSpacing: 0.8 },
  val: { fontSize: 16, fontWeight: '700' },
  subVal: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
