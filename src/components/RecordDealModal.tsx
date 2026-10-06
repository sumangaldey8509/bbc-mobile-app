import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, TrendingUp, DollarSign, FileText, Sparkles, Check, ShieldCheck, Award } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { BusinessDeal } from '../types';
import { useApp } from '../context/AppContext';

export const RecordDealModal: React.FC = () => {
  const { showRecordDealModal, closeRecordDeal, users, currentUser, recordBusinessDeal } = useApp();

  const otherUsers = users.filter(u => u.id !== currentUser.id);

  const [selectedUserId, setSelectedUserId] = useState<string>(otherUsers[0]?.id || '');
  const [dealAmountText, setDealAmountText] = useState('2500000'); // 25 Lakhs
  const [dealDescription, setDealDescription] = useState('Order for precision parts and fabrication testing');
  const [referralType, setReferralType] = useState<BusinessDeal['referralType']>('Inside Council');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showRecordDealModal) return null;

  const rawAmount = parseInt(dealAmountText.replace(/[^0-9]/g, ''), 10) || 1000000;
  const formattedInLakhs = rawAmount >= 10000000 
    ? `₹ ${(rawAmount / 10000000).toFixed(2)} Crores` 
    : `₹ ${(rawAmount / 100000).toFixed(1)} Lakhs`;

  const presetAmounts = [
    { label: '₹ 5 Lakhs', value: '500000' },
    { label: '₹ 15 Lakhs', value: '1500000' },
    { label: '₹ 35 Lakhs', value: '3500000' },
    { label: '₹ 75 Lakhs', value: '7500000' },
    { label: '₹ 1.5 Cr', value: '15000000' },
  ];

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      recordBusinessDeal(selectedUserId, formattedInLakhs, rawAmount, dealDescription, referralType);
      setIsSubmitting(false);
      closeRecordDeal();
      Alert.alert(
        'Business Deal Recorded! 🏆',
        `Great news! ${formattedInLakhs} in business has been added to your profile records.`
      );
    }, 900);
  };

  const selectedMember = users.find(u => u.id === selectedUserId) || otherUsers[0];

  return (
    <Modal
      visible={showRecordDealModal}
      transparent
      animationType="slide"
      onRequestClose={closeRecordDeal}
    >
      <View style={styles.overlay}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeRecordDeal} />

        <View style={styles.sheetContainer}>
          {/* Top Handle Notch */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.badgePill}>
                <Award color={colors.crimson} size={11} />
                <Text style={styles.headerBadge}>BENGAL BUSINESS COUNCIL</Text>
              </View>
              <Text style={styles.headerTitle}>Record Business Deal</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeRecordDeal} activeOpacity={0.7}>
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Value Preview Banner */}
            <View style={styles.dealHighlightBox}>
              <View style={styles.sparkleRow}>
                <Sparkles color={colors.emerald} size={14} />
                <Text style={styles.dealHighlightLabel}>TOTAL CLOSED BUSINESS VOLUME</Text>
              </View>
              <Text style={styles.dealHighlightValue}>{formattedInLakhs}</Text>
              <Text style={styles.dealHighlightSub}>
                Credited directly to Council Business Records
              </Text>
            </View>

            {/* Member Selection Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.inputLabel}>MEMBER YOU DID BUSINESS WITH</Text>
              <Text style={styles.sectionHint}>Swipe to choose</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberScroll} contentContainerStyle={styles.memberScrollContent}>
              {otherUsers.map(member => {
                const isSelected = member.id === selectedUserId;
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[styles.memberCard, isSelected && styles.memberCardSelected]}
                    onPress={() => setSelectedUserId(member.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.avatarWrapper}>
                      <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                      {isSelected ? (
                        <View style={styles.checkedIcon}>
                          <Check color={colors.white} size={10} strokeWidth={3} />
                        </View>
                      ) : (
                        <View style={styles.verifiedMini}>
                          <ShieldCheck color={colors.emerald} size={11} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.memberName, isSelected && styles.textCrimson]} numberOfLines={1}>
                      {member.name.split(' ')[0]}
                    </Text>
                    <Text style={styles.memberCompany} numberOfLines={1}>
                      {member.companyName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedMember && (
              <View style={styles.selectedSummaryBox}>
                <Image source={{ uri: selectedMember.avatar }} style={styles.selectedAvatar} />
                <View style={styles.selectedInfo}>
                  <View style={styles.selectedNameRow}>
                    <Text style={styles.summaryName}>{selectedMember.name}</Text>
                    <View style={styles.tierPill}>
                      <Text style={styles.tierPillText}>{selectedMember.chapter}</Text>
                    </View>
                  </View>
                  <Text style={styles.summaryDetails} numberOfLines={1}>
                    {selectedMember.designation} • {selectedMember.companyName}
                  </Text>
                </View>
              </View>
            )}

            {/* Deal Amount Input */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <DollarSign color={colors.crimson} size={14} />
                <Text style={styles.inputLabel}>DEAL AMOUNT (IN RUPEES ₹)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={dealAmountText}
                onChangeText={setDealAmountText}
                keyboardType="numeric"
                placeholder="e.g. 2500000"
                placeholderTextColor={colors.textMuted}
              />

              {/* Quick Presets */}
              <View style={styles.presetRow}>
                {presetAmounts.map(p => (
                  <TouchableOpacity
                    key={p.value}
                    style={[styles.presetChip, dealAmountText === p.value && styles.presetChipActive]}
                    onPress={() => setDealAmountText(p.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetChipText, dealAmountText === p.value && styles.presetChipTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Deal Description */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <FileText color={colors.crimson} size={14} />
                <Text style={styles.inputLabel}>WHAT WAS THE DEAL ABOUT?</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={dealDescription}
                onChangeText={setDealDescription}
                placeholder="Briefly describe what was bought or sold..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Referral Source Type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>TYPE OF DEAL</Text>
              <View style={styles.refTypeRow}>
                {(['Inside Council', 'Cross-Chapter Referral', 'Tier-3 Referral'] as BusinessDeal['referralType'][]).map(type => {
                  const isSelected = referralType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.refTypeBtn, isSelected && styles.refTypeBtnActive]}
                      onPress={() => setReferralType(type)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.refTypeText, isSelected && styles.refTypeTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={styles.submitLoadingRow}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.submitBtnText}>Saving Business Deal...</Text>
                </View>
              ) : (
                <View style={styles.submitRow}>
                  <TrendingUp color={colors.white} size={18} />
                  <Text style={styles.submitBtnText}>Save Business Deal</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    maxHeight: '92%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  },
  sheetHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleGroup: {
    flex: 1,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.crimsonLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  headerBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  body: {
    padding: 18,
  },
  dealHighlightBox: {
    backgroundColor: '#0B192C',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0B192C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dealHighlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  dealHighlightValue: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.emerald,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  dealHighlightSub: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  memberScroll: {
    marginBottom: 14,
  },
  memberScrollContent: {
    paddingRight: 10,
  },
  memberCard: {
    width: 96,
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  memberCardSelected: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF8F8',
    shadowColor: colors.crimson,
    shadowOpacity: 0.15,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  checkedIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  verifiedMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textCrimson: {
    color: colors.crimson,
  },
  memberCompany: {
    fontSize: 9.5,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  selectedSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: colors.emerald,
  },
  selectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tierPill: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierPillText: {
    fontSize: 9.5,
    color: colors.accentBlue,
    fontWeight: '700',
  },
  summaryDetails: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetChipActive: {
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimson,
  },
  presetChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: colors.crimson,
    fontWeight: '800',
  },
  textArea: {
    height: 68,
    textAlignVertical: 'top',
    fontWeight: '500',
  },
  refTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  refTypeBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  refTypeBtnActive: {
    backgroundColor: colors.accentBlueLight,
    borderColor: colors.accentBlue,
  },
  refTypeText: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  refTypeTextActive: {
    color: colors.accentBlue,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: colors.crimson,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.75,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
