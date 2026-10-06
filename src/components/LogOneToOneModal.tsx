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
import { X, Calendar, Clock, MapPin, AlignLeft, Check, Users2, ShieldCheck, Video, Building, Coffee } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const LogOneToOneModal: React.FC = () => {
  const {
    showLogOneToOneModal,
    targetOneToOneUser,
    closeLogOneToOne,
    users,
    currentUser,
    logOneToOne,
  } = useApp();

  const otherUsers = users.filter(u => u.id !== currentUser.id);

  const [selectedUserId, setSelectedUserId] = useState<string>(
    targetOneToOneUser?.id || otherUsers[0]?.id || ''
  );
  const [date, setDate] = useState('Thursday, Aug 27, 2026');
  const [time, setTime] = useState('11:00 AM - 11:45 AM');
  const [location, setLocation] = useState('Council Office, Salt Lake');
  const [agenda, setAgenda] = useState('Discuss business services and project collaboration');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showLogOneToOneModal) return null;

  const quickLocations = [
    { label: 'Council Office', value: 'Council Office, Salt Lake', icon: Building },
    { label: 'Zoom / Video Call', value: 'Zoom Video Call (Link in Calendar)', icon: Video },
    { label: 'Member Office', value: "Member's Head Office, Kolkata", icon: Building },
    { label: 'Business Lunch', value: 'Business Dining / Cafe Meet', icon: Coffee },
  ];

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      logOneToOne(selectedUserId, date, time, location, agenda);
      setIsSubmitting(false);
      closeLogOneToOne();
      Alert.alert(
        '1-to-1 Meeting Saved!',
        'Your meeting has been saved and added to your calendar.'
      );
    }, 800);
  };

  const selectedMember = users.find(u => u.id === selectedUserId) || otherUsers[0];

  return (
    <Modal
      visible={showLogOneToOneModal}
      transparent
      animationType="slide"
      onRequestClose={closeLogOneToOne}
    >
      <View style={styles.overlay}>
        {/* Backdrop Dismiss Area */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeLogOneToOne} />

        <View style={styles.sheetContainer}>
          {/* Top Drag Notch */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.badgePill}>
                <Users2 color={colors.crimson} size={11} />
                <Text style={styles.headerBadge}>BENGAL BUSINESS COUNCIL</Text>
              </View>
              <Text style={styles.headerTitle}>Schedule a 1-to-1 Meeting</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeLogOneToOne} activeOpacity={0.7}>
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Member Selection Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.inputLabel}>MEETING WITH MEMBER</Text>
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

            {/* Selected Member Highlight Box */}
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

            {/* Date & Time Row */}
            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <View style={styles.fieldLabelRow}>
                  <Calendar color={colors.crimson} size={14} />
                  <Text style={styles.inputLabel}>MEETING DATE</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g. Aug 27, 2026"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <View style={styles.fieldLabelRow}>
                  <Clock color={colors.crimson} size={14} />
                  <Text style={styles.inputLabel}>TIME</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={time}
                  onChangeText={setTime}
                  placeholder="e.g. 11:00 AM"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Quick Location Pills */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <MapPin color={colors.crimson} size={14} />
                <Text style={styles.inputLabel}>LOCATION / FORMAT</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Council Office, Salt Lake / Zoom"
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.locationPresetRow}>
                {quickLocations.map(loc => {
                  const Icon = loc.icon;
                  const isActive = location === loc.value;
                  return (
                    <TouchableOpacity
                      key={loc.label}
                      style={[styles.locationChip, isActive && styles.locationChipActive]}
                      onPress={() => setLocation(loc.value)}
                      activeOpacity={0.7}
                    >
                      <Icon color={isActive ? colors.crimson : colors.textSecondary} size={12} />
                      <Text style={[styles.locationChipText, isActive && styles.locationChipTextActive]}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Agenda */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <AlignLeft color={colors.crimson} size={14} />
                <Text style={styles.inputLabel}>MEETING TOPIC</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={agenda}
                onChangeText={setAgenda}
                placeholder="Write what you would like to discuss..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
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
                  <Text style={styles.submitBtnText}>Saving 1-to-1 Meeting...</Text>
                </View>
              ) : (
                <View style={styles.submitRow}>
                  <Calendar color={colors.white} size={16} />
                  <Text style={styles.submitBtnText}>Save 1-to-1 Meeting</Text>
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
    borderLeftColor: colors.crimson,
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
  rowFields: {
    flexDirection: 'row',
    gap: 12,
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
    fontWeight: '500',
  },
  locationPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  locationChipActive: {
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimson,
  },
  locationChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  locationChipTextActive: {
    color: colors.crimson,
    fontWeight: '800',
  },
  textArea: {
    height: 68,
    textAlignVertical: 'top',
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
