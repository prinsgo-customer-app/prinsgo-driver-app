import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Share, Alert } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function ReferralScreen({ navigation }) {
  const { theme } = useSettings();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Join PrinsGo Driver Partner using code PRINSGO50 and get ₹500 instantly on your first 10 completed rides!',
      });
    } catch (err) {
      Alert.alert('Error', 'Unable to initiate share intent');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Referral Program</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 72, marginBottom: 12 }}>🎁</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Invite Partner & Earn</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Share your referral code below with fellow drivers. Earn ₹500 bonus directly to your wallet as soon as they complete their first 10 trips.
        </Text>

        <View style={[styles.codeBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.codeText, { color: theme.primary }]}>PRINSGO50</Text>
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleShare}>
          <Text style={styles.btnText}>Share Referral Invite</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  heading: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, marginTop: 12, marginBottom: 24 },
  codeBox: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 36, marginBottom: 32 },
  codeText: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  btn: { borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
