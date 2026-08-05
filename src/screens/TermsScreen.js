import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function TermsScreen({ navigation }) {
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.heading, { color: theme.text }]}>Platform Agreement</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          By registering as an approved PrinsGo driver partner, you explicitly agree to provide safe, licensed, and legal transport services inside your chosen city limits.{'\n\n'}
          All drivers must possess active license permits, vehicle insurance guidelines, and avoid any fraudulent cancellations or rating manipulation behaviors. Disciplinary violations may lead to suspension.
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
