import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';

const DEFAULT_NOTIFICATIONS = [
  { id: 'notif_01', type: 'ride', title: 'New Ride Request nearby', body: 'A passenger requested a ride 1.8 km away at MG Road.', date: 'Today, 2:42 PM' },
  { id: 'notif_02', type: 'payment', title: 'Withdrawal Success', body: 'Withdrawal request of ₹500 processed successfully to your bank details.', date: 'Yesterday, 6:00 PM' },
  { id: 'notif_03', type: 'parcel', title: 'Parcel Delivery Confirmed', body: 'Receiver OTP verified. Parcel dropoff settled and platform fee processed.', date: 'Yesterday, 11:15 AM' },
  { id: 'notif_04', type: 'admin', title: 'System Maintenance Notice', body: 'PrinsGo services will undergo routine database updates on Sunday 02:00-04:00 AM IST.', date: '3 days ago' },
  { id: 'notif_05', type: 'payment', title: 'Bonus Incentive Earned', body: 'Congratulations! You earned ₹100 extra for achieving the Bronze daily target.', date: '4 days ago' },
];

export default function NotificationsScreen({ navigation }) {
  const { theme, t } = useSettings();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifs = DEFAULT_NOTIFICATIONS.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'ride': return '🚗';
      case 'parcel': return '📦';
      case 'payment': return '💰';
      default: return '📢';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.notifications}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
        {['all', 'ride', 'parcel', 'payment', 'admin'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && { borderBottomColor: theme.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? theme.primary : theme.textSecondary },
                activeTab === tab && { fontWeight: '800' },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredNotifs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications in this category</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.notifCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.notifHeader}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 18 }}>{getNotifIcon(item.type)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.notifDate, { color: theme.textSecondary }]}>{item.date}</Text>
              </View>
            </View>
            <Text style={[styles.notifBody, { color: theme.textSecondary }]}>{item.body}</Text>
          </View>
        )}
      />
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
  settingsButton: { paddingVertical: 4, paddingLeft: 10 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 10, borderBottomWidth: 1 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  emptyView: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  notifCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700' },
  notifDate: { fontSize: 10, marginTop: 2 },
  notifBody: { fontSize: 13, lineHeight: 18, marginLeft: 48 },
});
