import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { theme, t, isDarkMode, toggleDarkMode, language, changeLanguage } = useSettings();
  const { logout } = useAuth();

  // Local state for notification toggles
  const [rideAlerts, setRideAlerts] = useState(true);
  const [parcelAlerts, setParcelAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [adminAnnounce, setAdminAnnounce] = useState(true);

  const handleLogout = () => {
    navigation.navigate('LogoutConfirmation');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.settings}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* General Settings */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>General Settings</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

          {/* Dark Mode Toggle */}
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('DarkMode')}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t.darkMode}</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Switch to dark interface theme</Text>
            </View>
            <Text style={{ color: theme.primary }}>→</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Language Selection */}
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Language')}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t.language}</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Choose app translation locale</Text>
            </View>
            <Text style={{ color: theme.primary }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Toggles */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Settings</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Ride Request Alerts</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Get notified on nearby ride demands</Text>
            </View>
            <Switch value={rideAlerts} onValueChange={setRideAlerts} trackColor={{ true: theme.primary }} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Parcel Delivery Alerts</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Get notified on nearby courier jobs</Text>
            </View>
            <Switch value={parcelAlerts} onValueChange={setParcelAlerts} trackColor={{ true: theme.primary }} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Payment & Earnings Alerts</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Alerts about withdrawals & settlements</Text>
            </View>
            <Switch value={paymentAlerts} onValueChange={setPaymentAlerts} trackColor={{ true: theme.primary }} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Admin Announcements</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Broadcast announcements from PrinsGo team</Text>
            </View>
            <Switch value={adminAnnounce} onValueChange={setAdminAnnounce} trackColor={{ true: theme.primary }} />
          </View>
        </View>

        {/* Legal and Support */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal and Support</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Help')}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>❓ FAQs & Help</Text>
            <Text style={{ color: theme.primary }}>→</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('About')}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>ℹ️ About PrinsGo</Text>
            <Text style={{ color: theme.primary }}>→</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Terms')}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>📄 Terms of Use</Text>
            <Text style={{ color: theme.primary }}>→</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Privacy')}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>🛡️ Privacy Policy</Text>
            <Text style={{ color: theme.primary }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Safety & Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.statusDanger }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: theme.statusDanger }]}>{t.logout}</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>PrinsGo Driver App v1.0.0 (Production-Ready)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  settingLabel: { fontSize: 15, fontWeight: '700' },
  settingSub: { fontSize: 11, marginTop: 2, maxWidth: 220 },
  divider: { height: 1, marginVertical: 12 },
  logoutBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  logoutText: { fontWeight: '700', fontSize: 16 },
  versionText: { textAlign: 'center', fontSize: 11, marginTop: 24, marginBottom: 10 },
});
