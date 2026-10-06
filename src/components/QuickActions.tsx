import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PlusCircle, CalendarPlus, UserCheck, Banknote, QrCode } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const QuickActions: React.FC = () => {
  const { openCreatePost, openLogOneToOne, openGiveReferral, openRecordDeal, openDigitalBusinessCard } = useApp();

  const actions = [
    {
      id: 'post',
      label: 'Post Requirement',
      sublabel: 'B2B Request',
      icon: PlusCircle,
      color: colors.crimson,
      bgColor: colors.crimsonLight,
      onPress: openCreatePost,
    },
    {
      id: 'oto',
      label: '1-to-1 Meeting',
      sublabel: 'Schedule Meet',
      icon: CalendarPlus,
      color: colors.accentBlue,
      bgColor: colors.accentBlueLight,
      onPress: () => openLogOneToOne(),
    },
    {
      id: 'ref',
      label: 'Give Referral',
      sublabel: 'Share a Lead',
      icon: UserCheck,
      color: colors.purpleAccent,
      bgColor: colors.purpleLight,
      onPress: () => openGiveReferral(),
    },
    {
      id: 'tyfb',
      label: 'Record Deal',
      sublabel: 'Closed Business',
      icon: Banknote,
      color: colors.emerald,
      bgColor: colors.emeraldLight,
      onPress: openRecordDeal,
    },
    {
      id: 'card',
      label: 'My Visiting Card',
      sublabel: 'Digital Profile',
      icon: QrCode,
      color: colors.primary,
      bgColor: colors.cardBgElevated,
      onPress: () => openDigitalBusinessCard(),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>QUICK ACTIONS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBadge, { backgroundColor: action.bgColor }]}>
                <Icon color={action.color} size={18} />
              </View>
              <Text style={styles.actionLabel} numberOfLines={1}>{action.label}</Text>
              <Text style={styles.actionSublabel} numberOfLines={1}>{action.sublabel}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  actionCard: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    width: 110,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  actionSublabel: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
});
