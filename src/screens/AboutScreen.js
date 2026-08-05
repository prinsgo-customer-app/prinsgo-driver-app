import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function AboutScreen({ navigation }) {
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>About PrinsGo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 72, marginBottom: 12 }}>🚀</Text>
        <Text style={[styles.logo, { color: theme.text }]}>PrinsGo Driver</Text>
        <Text style={[styles.version, { color: theme.textSecondary }]}>Enterprise Edition v1.0.0</Text>

        <Text style={[styles.body, { color: theme.textSecondary, marginTop: 24 }]}>
          PrinsGo is a premium next-generation on-demand ride sharing and parcel courier delivery network built using ultra-fast backend services. We focus on providing seamless driver utilities, fair platform commissions, and exceptional transit experiences.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  logo: { fontSize: 24, fontWeight: '900' },
  version: { fontSize: 13, marginTop: 4 },
  body: { fontSize: 14, lineHeight: 22, textAlign: 'center', fontWeight: '500' },
});
