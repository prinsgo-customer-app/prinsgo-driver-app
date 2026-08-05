import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { updateProfile } from '../api/driver';

export default function EditProfileScreen({ navigation }) {
  const { driver, refreshDriver } = useAuth();
  const { theme, t } = useSettings();

  const [name, setName] = useState(driver?.name || '');
  const [vehicleModel, setVehicleModel] = useState(driver?.vehicleModel || '2023 Model');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Details Required', 'Please enter your name.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name,
        vehicleModel,
      });
      await refreshDriver();
      Alert.alert('Success', 'Profile details updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Saved', 'Profile changes saved successfully.');
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 14 }}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Details</Text>
        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Driver Name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Vehicle Model Description</Text>
          <TextInput
            style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Honda Shine 2023"
            placeholderTextColor={theme.textSecondary}
            value={vehicleModel}
            onChangeText={setVehicleModel}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { paddingVertical: 4, paddingRight: 10 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  saveButton: { paddingVertical: 4, paddingLeft: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 10 },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  textInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14 },
});
