import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const KYC_DOCUMENTS = [
  { key: 'license', label: 'Driving License', screen: 'UploadLicense' },
  { key: 'rc', label: 'Registration Certificate (RC)', screen: 'UploadRc' },
  { key: 'insurance', label: 'Vehicle Insurance', screen: 'UploadInsurance' },
  { key: 'aadhaar', label: 'Aadhaar Card', screen: 'UploadAadhaar' },
  { key: 'pan', label: 'PAN Card', screen: 'UploadPan' },
];

export default function KycDocumentsScreen({ navigation }) {
  const { driver } = useAuth();
  const { theme } = useSettings();

  const getDocStatus = (key) => {
    return driver?.documents?.[key]?.status || 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#E8F5E9';
      case 'rejected': return '#FFEBEE';
      default: return '#FFF3E0';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'approved': return '#2E7D32';
      case 'rejected': return '#C62828';
      default: return '#E65100';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>KYC Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Please select and upload clear photos of your official identity and vehicle documents below to qualify for active dashboard tasks.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {KYC_DOCUMENTS.map((doc, idx) => {
            const status = getDocStatus(doc.key);
            return (
              <View key={doc.key}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => navigation.navigate(doc.screen)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemLabel, { color: theme.text }]}>{doc.label}</Text>
                    <Text style={[styles.itemSub, { color: theme.textSecondary }]}>Tap to update details & photo proofs</Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: getStatusColor(status) }]}>
                    <Text style={[styles.badgeText, { color: getStatusTextColor(status) }]}>
                      {status.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  itemLabel: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 11, marginTop: 2 },
  badge: { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  divider: { height: 1, marginVertical: 4 },
});
