import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking, Alert } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function CallCustomerScreen({ route, navigation }) {
  const { phone } = route.params || { phone: '9876543210' };
  const { theme } = useSettings();

  const handleDial = () => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Unable to initiate dialer'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Call Customer</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={{ fontSize: 72 }}>📞</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Contact Passenger</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Initiate direct phone line voice call to coordinate pick points or package handovers.
        </Text>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleDial}>
          <Text style={styles.btnText}>Dial +91 {phone}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: { fontSize: 20, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', width: '100%' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
