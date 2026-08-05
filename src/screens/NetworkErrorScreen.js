import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function NetworkErrorScreen({ navigation }) {
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.body}>
        <Text style={{ fontSize: 80 }}>📶</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Network Error Connection</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Your internet connection appears to be offline. Please check your data provider or Wi-Fi status and try reloading again.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Retry Connection Link</Text>
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
