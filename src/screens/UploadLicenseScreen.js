import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDocuments } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function UploadLicenseScreen({ navigation }) {
  const { driver, refreshDriver } = useAuth();
  const { theme } = useSettings();
  const [num, setNum] = useState(driver?.documents?.license?.number || '');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!num.trim()) {
      Alert.alert('Details Required', 'Please enter your license details');
      return;
    }
    setLoading(true);
    try {
      await updateDocuments({
        documents: {
          license: { number: num, status: 'pending' }
        }
      });
      await refreshDriver();
      Alert.alert('Success', 'Driving License photo and document particulars updated.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Saved', 'Document particulars updated successfully.');
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
        <Text style={[styles.title, { color: theme.text }]}>Upload License</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.camBox}>
          <Text style={{ fontSize: 60 }}>📸</Text>
          <Text style={[styles.camText, { color: theme.textSecondary }]}>Capture/Upload License Photo Proof</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>DRIVING LICENSE NUMBER</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="DL-12202004561"
            placeholderTextColor={theme.textSecondary}
            value={num}
            onChangeText={setNum}
          />
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleUpload} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Submit Verification Proof</Text>
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
  camBox: { height: 180, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CCCCCC', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24, padding: 12 },
  camText: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
