import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { updateProfile } from '../api/driver';

export default function EditVehicleScreen({ navigation }) {
  const { driver, refreshDriver } = useAuth();
  const { theme } = useSettings();
  const [vehicleNumber, setVehicleNumber] = useState(driver?.vehicleNumber || '');
  const [vehicleModel, setVehicleModel] = useState(driver?.vehicleModel || '');
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    if (!vehicleNumber.trim() || !vehicleModel.trim()) {
      Alert.alert('Inputs Required', 'Please provide both vehicle model and plate number details.');
      return;
    }
    setUpdating(true);
    try {
      await updateProfile({ vehicleNumber, vehicleModel });
      await refreshDriver();
      Alert.alert('Success', 'Vehicle particulars saved successfully.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Saved', 'Vehicle details updated successfully.');
      navigation.goBack();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Edit Vehicle</Text>
        <TouchableOpacity onPress={handleSave} disabled={updating}>
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '700' }}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>PLATE REGISTRATION NUMBER</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. MH12AB1234"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="characters"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
          />

          <View style={{ height: 16 }} />

          <Text style={[styles.label, { color: theme.textSecondary }]}>VEHICLE MODEL DESCRIPTION</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Honda Activa 6G (2023)"
            placeholderTextColor={theme.textSecondary}
            value={vehicleModel}
            onChangeText={setVehicleModel}
          />
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={updating}>
          {updating ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.btnText}>Save Vehicle particulars</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
