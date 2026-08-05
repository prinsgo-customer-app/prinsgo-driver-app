import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

const REVIEWS = [
  { id: '1', rating: 5, date: 'Today', comment: 'Very professional driver, arrived on time.' },
  { id: '2', rating: 4, date: 'Yesterday', comment: 'Safe ride but navigated a bit longer route.' },
  { id: '3', rating: 5, date: '3 days ago', comment: 'Parcel delivered carefully, excellent packaging handling.' },
];

export default function RatingsScreen({ navigation }) {
  const { theme } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Ratings & Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={REVIEWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 16 }}>{'⭐'.repeat(item.rating)}</Text>
              <Text style={[styles.date, { color: theme.textSecondary }]}>{item.date}</Text>
            </View>
            <Text style={[styles.comment, { color: theme.text, marginTop: 8 }]}>{item.comment}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 11, fontWeight: '600' },
  comment: { fontSize: 14, lineHeight: 18, fontWeight: '500' },
});
