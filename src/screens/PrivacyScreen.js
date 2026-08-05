import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function PrivacyScreen({ navigation }) {
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>GDPR Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.heading, { color: theme.text }]}>PrinsGo Driver Privacy</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Your privacy is extremely important to us. PrinsGo collects your location coordinate logs in order to locate passengers, assign matching nearby rides or parcel packages, and calculate transit distance fares effectively.{'\n\n'}
          We never sell, rent, or lease your private personal details or location tracking history to any external third-party advertisers. All data is securely processed under standard cryptographic protocols.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  heading: { fontSize: 20, fontWeight: '900', marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
