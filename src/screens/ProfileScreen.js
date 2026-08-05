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

const DOCUMENT_LABELS = {
  license: 'Driving License',
  rc: 'Registration Certificate (RC)',
  insurance: 'Vehicle Insurance',
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
};

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

  // Fallback documents structure if backend doesn't fully populate yet
  const docs = driver?.documents || {
    license: { status: 'approved', number: 'DL-12202004561' },
    rc: { status: 'approved', number: 'MH12-RC-2023199' },
    insurance: { status: 'approved', number: 'POL-INS-9821882' },
    aadhaar: { status: 'pending', number: '8221 4421 9918' },
    pan: { status: 'pending', number: 'ABCDE1234F' },
  };

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
          <Text style={[styles.driverName, { color: theme.text }]}>{driver?.name || 'Driver Partner'}</Text>
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

        {/* Vehicle Details */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.vehicleDetails}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Vehicle Type</Text>
            <Text style={[styles.infoValue, { color: theme.text, textTransform: 'capitalize' }]}>{driver?.vehicleType || 'Bike'}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Plate Number</Text>
            <Text style={[styles.infoValue, { color: theme.text, textTransform: 'uppercase' }]}>{driver?.vehicleNumber || 'No Plate'}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Model Year</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{driver?.vehicleModel || '2023 Model'}</Text>
          </View>
        </View>

        {/* Verification Documents */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>KYC verification documents</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {Object.keys(DOCUMENT_LABELS).map((key, idx) => {
            const doc = docs[key] || { status: 'pending', number: 'Not Uploaded' };
            const isApproved = doc.status === 'approved';

            return (
              <View key={key}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <View style={styles.docRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.docLabel, { color: theme.text }]}>{DOCUMENT_LABELS[key]}</Text>
                    <Text style={[styles.docNum, { color: theme.textSecondary }]}>{doc.number || 'Pending Input'}</Text>
                  </View>
                  <View style={[styles.docStatusBadge, { backgroundColor: isApproved ? '#E8F5E9' : '#FFF3E0' }]}>
                    <Text style={[styles.docStatusText, { color: isApproved ? theme.statusSuccess : '#EF6C00' }]}>
                      {isApproved ? 'Approved' : 'Pending Approval'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  avatarLargeText: { fontSize: 32, fontWeight: '800', color: '#1877F2' },
  driverName: { fontSize: 20, fontWeight: '800' },
  driverPhone: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  ratingBadge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  ratingText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statusBadge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, marginVertical: 12 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  docLabel: { fontSize: 14, fontWeight: '700' },
  docNum: { fontSize: 12, marginTop: 2 },
  docStatusBadge: { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  docStatusText: { fontSize: 11, fontWeight: '700' },
});
