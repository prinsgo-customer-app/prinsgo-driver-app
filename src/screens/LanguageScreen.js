import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export default function LanguageScreen({ navigation }) {
  const { theme, language, changeLanguage } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Language Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card, borderColor: language === 'en' ? theme.primary : theme.border }]}
          onPress={() => changeLanguage('en')}
        >
          <Text style={[styles.itemText, { color: theme.text }]}>English (EN)</Text>
          {language === 'en' && <Text style={{ color: theme.primary, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card, borderColor: language === 'hi' ? theme.primary : theme.border }]}
          onPress={() => changeLanguage('hi')}
        >
          <Text style={[styles.itemText, { color: theme.text }]}>हिन्दी (HI)</Text>
          {language === 'hi' && <Text style={{ color: theme.primary, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1.5 },
  itemText: { fontSize: 16, fontWeight: '700' },
});
