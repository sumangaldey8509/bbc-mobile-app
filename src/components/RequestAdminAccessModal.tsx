import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { X, ShieldAlert, CheckCircle2, Lock, FileCheck, ShieldCheck, Sparkles, Send } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const RequestAdminAccessModal: React.FC = () => {
  const {
    showRequestAdminAccessModal,
    selectedUserForAdminAccess,
    closeRequestAdminAccess,
    requestAdminContactAccess,
    requestedAdminAccessIds,
  } = useApp();

  const [reason, setReason] = useState('Business partnership inquiry and meeting request');

  if (!showRequestAdminAccessModal || !selectedUserForAdminAccess) return null;

  const isAlreadyRequested = requestedAdminAccessIds.includes(selectedUserForAdminAccess.id);

  const handleSubmit = () => {
    requestAdminContactAccess(selectedUserForAdminAccess.id, reason);
    Alert.alert(
      'Request Sent',
      `Your request to connect with ${selectedUserForAdminAccess.name} (${selectedUserForAdminAccess.companyName}) has been sent to the Council team. We will introduce you soon.`
    );
    closeRequestAdminAccess();
  };

  return (
    <Modal
      visible={showRequestAdminAccessModal}
      transparent
      animationType="slide"
      onRequestClose={closeRequestAdminAccess}
    >
      <View style={styles.overlay}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeRequestAdminAccess} />

        <View style={styles.sheetContainer}>
          {/* Top Drag Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.badgePill}>
                <Sparkles color={colors.crimson} size={11} />
                <Text style={styles.headerBadge}>COUNCIL INTRODUCTIONS</Text>
              </View>
              <Text style={styles.headerTitle}>Request an Introduction</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeRequestAdminAccess} activeOpacity={0.7}>
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Target Member Card */}
            <View style={styles.targetMemberCard}>
              <Image source={{ uri: selectedUserForAdminAccess.avatar }} style={styles.avatar} />
              <View style={styles.targetInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName}>{selectedUserForAdminAccess.name}</Text>
                  <ShieldCheck color={colors.emerald} size={15} />
                </View>
                <Text style={styles.designation}>{selectedUserForAdminAccess.designation}</Text>
                <Text style={styles.company}>{selectedUserForAdminAccess.companyName}</Text>
                <View style={styles.chapterBadge}>
                  <Text style={styles.chapterText}>
                    {selectedUserForAdminAccess.chapter} • Member since {selectedUserForAdminAccess.yearJoined}
                  </Text>
                </View>
              </View>
            </View>

            {/* Confidentiality Notice */}
            <View style={styles.securityNotice}>
              <Lock color={colors.accentBlue} size={18} />
              <View style={styles.noticeTextCol}>
                <Text style={styles.noticeTitle}>Member Privacy Protection</Text>
                <Text style={styles.noticeBody}>
                  To protect member privacy, direct phone numbers and company documents are shared through Council introductions.
                </Text>
              </View>
            </View>

            {/* Requested Information Checklist */}
            <View style={styles.checklistCard}>
              <Text style={styles.checkCardTitle}>DETAILS YOU WILL RECEIVE</Text>
              <View style={styles.checkItem}>
                <FileCheck color={colors.emerald} size={16} />
                <Text style={styles.checkItemText}>Direct phone number & email address</Text>
              </View>
              <View style={styles.checkItem}>
                <FileCheck color={colors.emerald} size={16} />
                <Text style={styles.checkItemText}>Verified GST details & company documents</Text>
              </View>
              <View style={styles.checkItem}>
                <FileCheck color={colors.emerald} size={16} />
                <Text style={styles.checkItemText}>Arranged 1-to-1 business meeting</Text>
              </View>
            </View>

            {/* Reason Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>WHY DO YOU WANT TO CONNECT?</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Explain your business inquiry or project requirement..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isAlreadyRequested && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isAlreadyRequested}
              activeOpacity={0.8}
            >
              {isAlreadyRequested ? (
                <View style={styles.btnRowInner}>
                  <CheckCircle2 color={colors.white} size={18} />
                  <Text style={styles.submitBtnText}>Request is Being Reviewed</Text>
                </View>
              ) : (
                <View style={styles.btnRowInner}>
                  <Send color={colors.white} size={16} />
                  <Text style={styles.submitBtnText}>Send Introduction Request</Text>
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
  targetMemberCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.crimson,
    marginRight: 14,
  },
  targetInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  designation: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  company: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  chapterBadge: {
    marginTop: 4,
  },
  chapterText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: colors.accentBlueLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(29, 112, 184, 0.2)',
    alignItems: 'flex-start',
  },
  noticeTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentBlue,
    marginBottom: 2,
  },
  noticeBody: {
    fontSize: 11,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  checklistCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  checkCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  checkItemText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
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
    fontWeight: '500',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.crimson,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: colors.emerald,
    shadowColor: colors.emerald,
  },
  btnRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 14.5,
    fontWeight: '800',
  },
});
