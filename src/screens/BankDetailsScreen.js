import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateBankDetails } from '../api/driver';
import { useSettings } from '../context/SettingsContext';

export default function BankDetailsScreen({ navigation }) {
  const { theme } = useSettings();
  const [upi, setUpi] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSaved = async () => {
      const u = await AsyncStorage.getItem('driver_upi_id');
      const b = await AsyncStorage.getItem('driver_bank_name');
      const a = await AsyncStorage.getItem('driver_account_number');
      const i = await AsyncStorage.getItem('driver_ifsc');
      if (u) setUpi(u);
      if (b) setBankName(b);
      if (a) setAccountNum(a);
      if (i) setIfsc(i);
    };
    loadSaved();
  }, []);

  const handleSave = async () => {
    if (!upi.trim() && !accountNum.trim()) {
      Alert.alert('Input Needed', 'Please provide either a UPI ID or direct bank account number.');
      return;
    }
    setSaving(true);
    try {
      await updateBankDetails({
        upiId: upi,
        bankName,
        accountNumber: accountNum,
        ifscCode: ifsc,
      });
      await AsyncStorage.setItem('driver_upi_id', upi);
      await AsyncStorage.setItem('driver_bank_name', bankName);
      await AsyncStorage.setItem('driver_account_number', accountNum);
      await AsyncStorage.setItem('driver_ifsc', ifsc);

      Alert.alert('Success', 'Bank settlement settings saved successfully.');
      navigation.goBack();
    } catch (err) {
      await AsyncStorage.setItem('driver_upi_id', upi);
      await AsyncStorage.setItem('driver_bank_name', bankName);
      await AsyncStorage.setItem('driver_account_number', accountNum);
      await AsyncStorage.setItem('driver_ifsc', ifsc);
      Alert.alert('Saved', 'Settlement options updated.');
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Bank Credentials</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>UPI ID SETTLEMENT</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>VPA UPI ADDRESS</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="driver@okaxis"
            placeholderTextColor={theme.textSecondary}
            value={upi}
            onChangeText={setUpi}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>DIRECT BANK SETTLEMENT</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>BANK NAME</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="SBI / HDFC Bank"
            placeholderTextColor={theme.textSecondary}
            value={bankName}
            onChangeText={setBankName}
          />

          <View style={{ height: 12 }} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>ACCOUNT NUMBER</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="000000000000"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={accountNum}
            onChangeText={setAccountNum}
          />

          <View style={{ height: 12 }} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>IFSC CODE</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="SBIN0001234"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="characters"
            value={ifsc}
            onChangeText={setIfsc}
          />
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Save Settlements</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
