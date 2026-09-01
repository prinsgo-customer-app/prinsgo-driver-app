import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function UpdateScreen() {
  const { theme } = useSettings();

  const handleUpdate = () => {
    Linking.openURL('https://play.google.com').catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.body}>
        <Text style={{ fontSize: 80 }}>🚀</Text>
        <Text style={[styles.heading, { color: theme.text }]}>New Update Available</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          A brand new premium update of PrinsGo Partner App is now available with smooth speed optimizations and enhancements.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleUpdate}>
          <Text style={styles.btnText}>Download Update From Play Store</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: { fontSize: 22, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  footer: { padding: 20 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
