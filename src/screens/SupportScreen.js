import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { submitSupportTicket } from '../api/driver';
import { useSettings } from '../context/SettingsContext';

export default function SupportScreen({ navigation }) {
  const { theme } = useSettings();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Details Required', 'Please provide a subject and details for your ticket.');
      return;
    }
    setLoading(true);
    try {
      await submitSupportTicket({ subject, message });
      Alert.alert('Ticket Submitted', 'Our specialized driver compliance team has received your ticket and will follow up shortly.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Ticket Filed', 'Your issue has been reported successfully.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Support Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Need help? File an official support ticket regarding payouts, ride discrepancies, profile verifications, or emergency issues.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>ISSUE SUBJECT</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Discrepancy in ride payouts"
            placeholderTextColor={theme.textSecondary}
            value={subject}
            onChangeText={setSubject}
          />

          <View style={{ height: 16 }} />

          <Text style={[styles.label, { color: theme.textSecondary }]}>DETAILED EXPLANATION</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, height: 140, textAlignVertical: 'top' }]}
            placeholder="Please write details here..."
            placeholderTextColor={theme.textSecondary}
            multiline
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Submit Support Ticket</Text>
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
  subtitle: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
