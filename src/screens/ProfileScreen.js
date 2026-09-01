import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function ProfileScreen({ navigation }) {
  const { driver, refreshDriver } = useAuth();
  const { theme, t } = useSettings();
  const [loading, setLoading] = useState(false);

  const reloadProfile = useCallback(async () => {
    setLoading(true);
    try {
      await refreshDriver();
    } catch (err) {
      console.log('Profile refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshDriver]);

  useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  if (loading && !driver) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.profile}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editButton}>
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Profile Card Summary */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{driver?.name?.[0]?.toUpperCase() || 'D'}</Text>
          </View>
          <Text style={[styles.driverName, { color: theme.text }]}>{driver?.name || 'Partner'}</Text>
          <Text style={[styles.driverPhone, { color: theme.textSecondary }]}>+91 {driver?.phone}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.ratingBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.ratingText}>⭐ {driver?.rating?.toFixed(1) || '5.0'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: driver?.isApproved ? theme.statusSuccess : '#FF9500' }]}>
              <Text style={styles.statusText}>{driver?.isApproved ? 'Approved Partner' : 'Verification Pending'}</Text>
            </View>
          </View>
        </View>

        {/* Action Panel items */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions & Options</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('VehicleDetails')}>
            <Text style={[styles.actionText, { color: theme.text }]}>🚗 Vehicle Details</Text>
            <Text style={{ color: theme.textSecondary }}>→</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('KycDocuments')}>
            <Text style={[styles.actionText, { color: theme.text }]}>📄 KYC Documents Hub</Text>
            <Text style={{ color: theme.textSecondary }}>→</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('RideHistory')}>
            <Text style={[styles.actionText, { color: theme.text }]}>📅 Ride History</Text>
            <Text style={{ color: theme.textSecondary }}>→</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ParcelHistory')}>
            <Text style={[styles.actionText, { color: theme.text }]}>📦 Parcel History</Text>
            <Text style={{ color: theme.textSecondary }}>→</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Settings')}>
            <Text style={[styles.actionText, { color: theme.text }]}>⚙️ App Settings</Text>
            <Text style={{ color: theme.textSecondary }}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backButton: { paddingVertical: 4, paddingRight: 10 },
  backText: { fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  editButton: { paddingVertical: 4, paddingLeft: 10 },
  profileCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 },
  avatarLarge: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,0,0,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLargeText: { fontSize: 32, fontWeight: '800', color: '#000000' },
  driverName: { fontSize: 20, fontWeight: '800' },
  driverPhone: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  ratingBadge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  ratingText: { color: '#000000', fontSize: 12, fontWeight: '700' },
  statusBadge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  actionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  actionText: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1, marginVertical: 4 },
});
