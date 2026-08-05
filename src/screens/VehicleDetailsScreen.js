import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function VehicleDetailsScreen({ navigation }) {
  const { driver } = useAuth();
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Vehicle Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditVehicle')}>
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '700' }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 80 }}>🚗</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>VEHICLE TYPE</Text>
          <Text style={[styles.val, { color: theme.text }]}>{driver?.vehicleType?.toUpperCase() || 'BIKE'}</Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.label, { color: theme.textSecondary }]}>PLATE NUMBER</Text>
          <Text style={[styles.val, { color: theme.text }]}>{driver?.vehicleNumber?.toUpperCase() || 'MH12 AB 1234'}</Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.label, { color: theme.textSecondary }]}>MODEL & SPECIFICATIONS</Text>
          <Text style={[styles.val, { color: theme.text }]}>{driver?.vehicleModel || 'Honda Activa 6G (2023)'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  iconContainer: { alignItems: 'center', marginVertical: 24 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  val: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1, marginVertical: 12 },
});
