import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { getChatMessages, sendChatMessage } from '../api/rides';
import { useSettings } from '../context/SettingsContext';

export default function ChatCustomerScreen({ route, navigation }) {
  const { rideId } = route.params || {};
  const { theme } = useSettings();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await getChatMessages(rideId || 'default');
        setMessages(res.data.messages || []);
      } catch (err) {
        setMessages([
          { id: '1', text: 'Hello, where are you now?', sender: 'customer', date: '10:14 AM' },
          { id: '2', text: 'I am on my way, reaching in 5 mins.', sender: 'driver', date: '10:15 AM' },
        ]);
      }
    };
    fetchChat();
  }, [rideId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendChatMessage(rideId || 'default', text);
      setMessages((prev) => [...prev, { id: Date.now().toString(), text, sender: 'driver', date: 'Now' }]);
      setText('');
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text, sender: 'driver', date: 'Now' }]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Chat with Customer</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isDriver = item.sender === 'driver';
            return (
              <View style={[
                styles.messageBubble,
                isDriver ? [styles.driverBubble, { backgroundColor: theme.primary }] : [styles.customerBubble, { backgroundColor: theme.card }],
                { alignSelf: isDriver ? 'flex-end' : 'flex-start' }
              ]}>
                <Text style={{ color: isDriver ? '#000000' : theme.text, fontSize: 14, fontWeight: '600' }}>
                  {item.text}
                </Text>
              </View>
            );
          }}
        />

        <View style={[styles.inputRow, { borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder="Type your message..."
            placeholderTextColor={theme.textSecondary}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleSend}>
            <Text style={{ fontSize: 18 }}>🚀</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  messageBubble: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginVertical: 4, maxWidth: '80%' },
  driverBubble: { borderBottomRightRadius: 0 },
  customerBubble: { borderBottomLeftRadius: 0 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
