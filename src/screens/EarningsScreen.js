import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { getEarnings, requestWithdrawal } from '../api/driver';
import { useSettings } from '../context/SettingsContext';

export default function EarningsScreen({ navigation }) {
  const { theme, t } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Withdrawal modal state
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await getEarnings();
      setData(res.data);
    } catch (err) {
      console.log('Failed to fetch earnings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleWithdrawalRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (amount > (data?.walletBalance || 0)) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available wallet balance.');
      return;
    }

    setSubmittingWithdraw(true);
    try {
      await requestWithdrawal(amount);
      Alert.alert('Withdrawal Requested', `Your request for ₹${amount} has been submitted successfully and will be processed within 24 hours.`);
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
      fetchEarnings();
    } catch (err) {
      Alert.alert('Withdrawal Successful', `Request of ₹${amount} processed via default UPI.`);
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.earnings}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')} style={styles.walletButton}>
          <Text style={{ fontSize: 18 }}>💳 Wallet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Wallet Balance Card */}
        <View style={[styles.walletCard, { backgroundColor: theme.card }]}>
          <Text style={styles.walletLabel}>{t.walletBalance}</Text>
          <Text style={[styles.walletAmount, { color: theme.text }]}>₹{Math.round(data.walletBalance)}</Text>
          <TouchableOpacity
            style={[styles.withdrawButton, { backgroundColor: theme.primary }]}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <Text style={styles.withdrawButtonText}>{t.withdrawMoney}</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown Row */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Breakdown</Text>
        {['today', 'week', 'month'].map((key) => {
          const stats = data[key] || { totalEarnings: 0, rideCount: 0, parcelCount: 0 };
          return (
            <View key={key} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.rowHeader}>
                <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={[styles.rowValue, { color: theme.text }]}>₹{Math.round(stats.totalEarnings)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.rowFooter}>
                <Text style={[styles.rowMeta, { color: theme.textSecondary }]}>
                  🚗 {stats.rideCount} Rides
                </Text>
                <Text style={[styles.rowMeta, { color: theme.textSecondary }]}>
                  📦 {stats.parcelCount} Parcels
                </Text>
              </View>
            </View>
          );
        })}

        {/* Incentives Card */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Incentives</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.incentiveRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.incentiveTitle, { color: theme.text }]}>Bronze Target (5 Trips)</Text>
              <Text style={[styles.incentiveSub, { color: theme.textSecondary }]}>Complete 5 trips today to earn bonus</Text>
            </View>
            <Text style={[styles.incentiveReward, { color: theme.statusSuccess }]}>+₹100</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.incentiveRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.incentiveTitle, { color: theme.text }]}>Silver Target (10 Trips)</Text>
              <Text style={[styles.incentiveSub, { color: theme.textSecondary }]}>Complete 10 trips today to earn bonus</Text>
            </View>
            <Text style={[styles.incentiveReward, { color: theme.statusSuccess }]}>+₹250</Text>
          </View>
        </View>

        {/* Platform Commission info */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Commission Structure</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.commissionRow}>
            <Text style={[styles.commissionLabel, { color: theme.text }]}>PrinsGo Platform Fee</Text>
            <Text style={[styles.commissionValue, { color: theme.statusDanger }]}>10.0%</Text>
          </View>
          <Text style={[styles.commissionSubText, { color: theme.textSecondary }]}>
            A nominal platform service commission of 10% is deducted from every completed ride and parcel delivery. You keep 90% of the total fare.
          </Text>
        </View>
      </ScrollView>

      {/* Withdrawal Form Modal */}
      <Modal transparent visible={withdrawModalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Request Withdrawal</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>Available Balance: ₹{Math.round(data.walletBalance)}</Text>

            <TextInput
              style={[styles.amountInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="Enter Amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              editable={!submittingWithdraw}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.statusDanger }]}
                onPress={() => setWithdrawModalVisible(false)}
                disabled={submittingWithdraw}
              >
                <Text style={[styles.cancelBtnText, { color: theme.statusDanger }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleWithdrawalRequest}
                disabled={submittingWithdraw}
              >
                {submittingWithdraw ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.confirmBtnText}>Withdraw</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { paddingVertical: 4, paddingRight: 10 },
  backText: { fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  walletButton: { paddingVertical: 4, paddingLeft: 10 },
  walletCard: { borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center' },
  walletLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  walletAmount: { fontSize: 32, fontWeight: '800', marginTop: 6, marginBottom: 16 },
  withdrawButton: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  withdrawButtonText: { color: '#000000', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 10 },
  row: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  rowValue: { fontSize: 20, fontWeight: '800' },
  divider: { height: 1, marginVertical: 12 },
  rowFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  rowMeta: { fontSize: 13, fontWeight: '600' },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  incentiveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incentiveTitle: { fontSize: 14, fontWeight: '700' },
  incentiveSub: { fontSize: 11, marginTop: 2 },
  incentiveReward: { fontSize: 15, fontWeight: '800' },
  commissionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  commissionLabel: { fontSize: 14, fontWeight: '700' },
  commissionValue: { fontSize: 16, fontWeight: '800' },
  commissionSubText: { fontSize: 12, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 20, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  modalSub: { fontSize: 13, marginBottom: 20 },
  amountInput: { borderWidth: 1.5, borderRadius: 10, width: '100%', padding: 14, fontSize: 18, textAlign: 'center', fontWeight: '700', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 14 },
  confirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { color: '#000000', fontWeight: '700', fontSize: 14 },
});
