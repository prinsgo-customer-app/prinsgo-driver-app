import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

const FAQS = [
  { q: 'How do I withdraw my earnings?', a: 'You can request direct withdrawals to your configured UPI address or bank account from your wallet at any time.' },
  { q: 'Why is my status pending approval?', a: 'New driver registrations and updated KYC documents must be validated by an administrator before you can toggle online.' },
  { q: 'What is the platform commission fee?', a: 'PrinsGo deducts a flat 10.0% service fee from completed ride and parcel transit sessions. You pocket 90% net.' },
];

export default function HelpScreen({ navigation }) {
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Frequently Asked Questions (FAQs)
        </Text>

        {FAQS.map((faq, i) => (
          <View key={i} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.qText, { color: theme.text }]}>❓ {faq.q}</Text>
            <Text style={[styles.aText, { color: theme.textSecondary }]}>{faq.a}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Support')}
        >
          <Text style={styles.btnText}>Contact Driver Support Desk</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 14, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  qText: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  aText: { fontSize: 13, lineHeight: 18 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
