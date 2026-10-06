import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users2, TrendingUp, ArrowUpRight, ArrowDownLeft, Handshake, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface KpiDashboardProps {
  onNavigateToBusinessDesk?: () => void;
}

export const KpiDashboard: React.FC<KpiDashboardProps> = ({ onNavigateToBusinessDesk }) => {
  const { currentUser, openLogOneToOne, openGiveReferral, openRecordDeal } = useApp();

  const formattedBusinessValue = `₹ ${(currentUser.stats.businessValueInLakhs / 100).toFixed(2)} Cr`;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleSection}>
          <Text style={styles.sectionBadge}>MY METRICS</Text>
          <Text style={styles.sectionHeading}>Business & Referrals Summary</Text>
        </View>

        {onNavigateToBusinessDesk && (
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={onNavigateToBusinessDesk}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>Business Desk</Text>
            <ChevronRight color={colors.accentBlue} size={14} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main KPI Row */}
      <View style={styles.cardsGrid}>
        {/* Total Business Won / TYFB */}
        <TouchableOpacity
          style={[styles.kpiCard, styles.crimsonAccentCard]}
          onPress={openRecordDeal}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircleCrimson}>
              <TrendingUp color={colors.crimson} size={16} />
            </View>
            <View style={styles.activeTagCrimson}>
              <Text style={styles.activeTagTextCrimson}>Closed Deal</Text>
            </View>
          </View>

          <Text style={styles.metricBigCrimson}>{formattedBusinessValue}</Text>
          <Text style={styles.metricLabel}>Total Business Done</Text>
          <Text style={styles.metricSubtext}>Deals with members</Text>
        </TouchableOpacity>

        {/* 1-to-1 Meetings Count */}
        <TouchableOpacity
          style={styles.kpiCard}
          onPress={() => openLogOneToOne()}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircleBlue}>
              <Users2 color={colors.accentBlue} size={16} />
            </View>
            <View style={styles.activeTagBlue}>
              <Text style={styles.activeTagTextBlue}>1-to-1</Text>
            </View>
          </View>

          <Text style={styles.metricBig}>{currentUser.stats.oneToOneCount}</Text>
          <Text style={styles.metricLabel}>1-to-1 Meetings</Text>
          <Text style={styles.metricSubtext}>Member connects</Text>
        </TouchableOpacity>
      </View>

      {/* Referral Exchange Row */}
      <TouchableOpacity
        style={styles.referralSplitCard}
        onPress={() => openGiveReferral()}
        activeOpacity={0.85}
      >
        <View style={styles.referralHeader}>
          <View style={styles.referralIconRow}>
            <Handshake color={colors.crimson} size={18} />
            <Text style={styles.referralCardTitle}>Referral Exchange</Text>
          </View>
          <Text style={styles.tapToGiveText}>+ Give Referral</Text>
        </View>

        <View style={styles.referralStatsContainer}>
          <View style={styles.referralStatCol}>
            <View style={styles.statIconBadgeGreen}>
              <ArrowUpRight color={colors.emerald} size={14} />
            </View>
            <View>
              <Text style={styles.referralCountText}>{currentUser.stats.referralsGiven}</Text>
              <Text style={styles.referralSubLabel}>Referrals I Gave</Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.referralStatCol}>
            <View style={styles.statIconBadgePurple}>
              <ArrowDownLeft color={colors.purpleAccent} size={14} />
            </View>
            <View>
              <Text style={styles.referralCountText}>{currentUser.stats.referralsReceived}</Text>
              <Text style={styles.referralSubLabel}>Referrals I Received</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 2,
  },
  viewAllText: {
    color: colors.accentBlue,
    fontSize: 11.5,
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  crimsonAccentCard: {
    borderColor: colors.crimsonBorder,
    backgroundColor: '#FFF8F8',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircleCrimson: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.crimsonLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTagCrimson: {
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagBlue: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagTextCrimson: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.crimson,
  },
  activeTagTextBlue: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  metricBigCrimson: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.3,
  },
  metricBig: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 3,
  },
  metricSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  referralSplitCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  referralIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referralCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tapToGiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.crimson,
  },
  referralStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralStatCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconBadgeGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
  },
  statIconBadgePurple: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  referralCountText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  referralSubLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 8,
  },
});
