import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Users2,
  Handshake,
  CalendarPlus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { BusinessDeskSkeleton } from '../components/SkeletonLoader';

export const BusinessDeskScreen: React.FC = () => {
  const {
    currentUser,
    referrals,
    businessDeals,
    oneToOneMeetings,
    openLogOneToOne,
    openGiveReferral,
    openRecordDeal,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TYFB' | 'Referrals' | '1-to-1s'>('TYFB');
  const [referralFilter, setReferralFilter] = useState<'All' | 'Given' | 'Received'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate backend deal ledger & referral tracking load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 850);
  };

  const formattedTotalBusiness = `₹ ${(currentUser.stats.businessValueInLakhs / 100).toFixed(2)} Cr`;

  const filteredReferrals = referrals.filter(r => {
    const isGiven = r.fromUserId === currentUser.id;
    const isReceived = r.toUserId === currentUser.id;

    if (referralFilter === 'Given') return isGiven;
    if (referralFilter === 'Received') return isReceived;
    return isGiven || isReceived;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <BusinessDeskSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.crimson}
              colors={[colors.crimson, colors.accentBlue]}
            />
          }
        >
          {/* Top Summary Banner */}
          <View style={styles.heroDeskCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroBadge}>COUNCIL BUSINESS DESK</Text>
              <Text style={styles.heroHeading}>Total Business Done</Text>
            </View>
            <View style={styles.verifiedCrest}>
              <Text style={styles.crestText}>BBC</Text>
            </View>
          </View>

          <View style={styles.heroValueContainer}>
            <Text style={styles.heroValueCrimson}>{formattedTotalBusiness}</Text>
            <Text style={styles.heroValueSub}>
              Closed Business Deals • {currentUser.stats.oneToOneCount} 1-to-1 Meetings Done
            </Text>
          </View>

          <View style={styles.heroActionButtons}>
            <TouchableOpacity style={styles.dealRecordBtn} onPress={openRecordDeal} activeOpacity={0.8}>
              <DollarSign color={colors.white} size={15} />
              <Text style={styles.dealBtnText}>Record Deal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.refActionBtn} onPress={() => openGiveReferral()} activeOpacity={0.8}>
              <Handshake color={colors.white} size={15} />
              <Text style={styles.refBtnText}>Give Referral</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.otoActionBtn} onPress={() => openLogOneToOne()} activeOpacity={0.8}>
              <CalendarPlus color={colors.primary} size={15} />
              <Text style={styles.otoBtnText}>Schedule 1-to-1</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Desk Tabs Switcher */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'TYFB' && styles.tabBtnActive]}
            onPress={() => setActiveTab('TYFB')}
          >
            <DollarSign color={activeTab === 'TYFB' ? colors.crimson : colors.textMuted} size={16} />
            <Text style={[styles.tabText, activeTab === 'TYFB' && styles.tabTextActive]}>
              Closed Deals ({businessDeals.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'Referrals' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Referrals')}
          >
            <Handshake color={activeTab === 'Referrals' ? colors.crimson : colors.textMuted} size={16} />
            <Text style={[styles.tabText, activeTab === 'Referrals' && styles.tabTextActive]}>
              Referrals ({referrals.filter(r => r.fromUserId === currentUser.id || r.toUserId === currentUser.id).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === '1-to-1s' && styles.tabBtnActive]}
            onPress={() => setActiveTab('1-to-1s')}
          >
            <Calendar color={activeTab === '1-to-1s' ? colors.crimson : colors.textMuted} size={16} />
            <Text style={[styles.tabText, activeTab === '1-to-1s' && styles.tabTextActive]}>
              1-to-1s ({oneToOneMeetings.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: Closed Deals (TYFB) */}
        {activeTab === 'TYFB' && (
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionSub}>OFFICIALLY CLOSED COUNCIL DEALS</Text>
              <Text style={styles.statCrimson}>{businessDeals.length} Deals</Text>
            </View>

            {businessDeals.map(deal => (
              <View key={deal.id} style={styles.dealCard}>
                <View style={styles.dealTopRow}>
                  <View style={styles.dealAmountBox}>
                    <Sparkles color={colors.emerald} size={13} />
                    <Text style={styles.dealAmountText}>{deal.amountFormatted}</Text>
                  </View>
                  <View style={styles.dealTypePill}>
                    <Text style={styles.dealTypePillText}>{deal.referralType}</Text>
                  </View>
                </View>

                <Text style={styles.dealDescription}>{deal.dealDescription}</Text>

                <View style={styles.dealMembersRow}>
                  <View style={styles.dealMemberCol}>
                    <Text style={styles.dealMemberRole}>TRANSACTED BETWEEN</Text>
                    <Text style={styles.dealMemberName}>
                      {deal.fromUserName} ➔ {deal.toUserName}
                    </Text>
                  </View>
                  <Text style={styles.dealDate}>{deal.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 2: Referrals */}
        {activeTab === 'Referrals' && (
          <View style={styles.sectionContent}>
            {/* Referral Sub Filter */}
            <View style={styles.refSubFilterRow}>
              {(['All', 'Given', 'Received'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.refSubFilterPill, referralFilter === f && styles.refSubFilterPillActive]}
                  onPress={() => setReferralFilter(f)}
                >
                  <Text style={[styles.refSubFilterText, referralFilter === f && styles.refSubFilterTextActive]}>
                    {f === 'All' ? 'All Referrals' : f === 'Given' ? 'Given by Me' : 'Received by Me'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredReferrals.length === 0 ? (
              <View style={styles.emptyRefCard}>
                <Handshake color={colors.textMuted} size={32} />
                <Text style={styles.emptyRefTitle}>No Referrals in this category</Text>
                <Text style={styles.emptyRefSub}>
                  {referralFilter === 'Given'
                    ? 'You have not given any referrals in this category yet. Tap below to share a lead with fellow members.'
                    : referralFilter === 'Received'
                    ? 'You have not received any referrals in this category yet.'
                    : 'No referral transactions recorded.'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyGiveBtn}
                  onPress={() => openGiveReferral()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyGiveBtnText}>+ Give a Referral Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredReferrals.map(ref => {
                const isGiven = ref.fromUserId === currentUser.id;
                const counterpartName = isGiven
                  ? (ref.toUserName || ref.memberName)
                  : (ref.fromUserName || ref.memberName);
                const counterpartCompany = isGiven
                  ? (ref.toUserCompany || ref.memberCompany)
                  : (ref.fromUserCompany || ref.memberCompany);
                const counterpartAvatar = isGiven
                  ? (ref.toUserAvatar || ref.memberAvatar)
                  : (ref.fromUserAvatar || ref.memberAvatar);

                return (
                  <View key={ref.id} style={styles.refCard}>
                    <View style={styles.refHeader}>
                      <View style={styles.refMemberInfo}>
                        <Image source={{ uri: counterpartAvatar }} style={styles.refAvatar} />
                        <View>
                          <Text style={styles.refDirectionTag}>
                            {isGiven ? 'REFERRAL GIVEN TO' : 'REFERRAL FROM'}
                          </Text>
                          <Text style={styles.refMemberName}>{counterpartName}</Text>
                          <View style={styles.companyRow}>
                            <Building2 color={colors.primary} size={10} />
                            <Text style={styles.refMemberCompany}>{counterpartCompany}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={[styles.refTypeBadge, isGiven ? styles.badgeGiven : styles.badgeReceived]}>
                        {isGiven ? (
                          <ArrowUpRight color={colors.emerald} size={12} />
                        ) : (
                          <ArrowDownLeft color={colors.accentBlue} size={12} />
                        )}
                        <Text style={[styles.refTypeBadgeText, isGiven ? styles.textEmerald : styles.textBlue]}>
                          {isGiven ? 'Given by Me' : 'Received by Me'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.refDetailsBox}>
                      <Text style={styles.refProspectLabel}>PROSPECT / CLIENT</Text>
                      <Text style={styles.refProspectName}>{ref.clientOrProspectName}</Text>
                      <Text style={styles.refProspectContact}>{ref.clientContact}</Text>
                      <Text style={styles.refServiceText}>{ref.serviceNeeded}</Text>
                    </View>

                    <View style={styles.refFooter}>
                      <View style={styles.refValueBox}>
                        <Text style={styles.refValueLabel}>EST. VALUE:</Text>
                        <Text style={styles.refValueText}>{ref.estimatedValue}</Text>
                      </View>

                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{ref.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 3: 1-to-1 Meetings */}
        {activeTab === '1-to-1s' && (
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionSub}>PEER-TO-PEER STRATEGY CONNECTS</Text>
              <Text style={styles.statCrimson}>{oneToOneMeetings.length} Recorded</Text>
            </View>

            {oneToOneMeetings.map(meeting => (
              <View key={meeting.id} style={styles.meetingCard}>
                <View style={styles.meetingHeader}>
                  <Image source={{ uri: meeting.withUserAvatar }} style={styles.meetingAvatar} />
                  <View style={styles.meetingMemberInfo}>
                    <Text style={styles.meetingMemberName}>{meeting.withUserName}</Text>
                    <Text style={styles.meetingMemberCompany}>{meeting.withUserCompany}</Text>
                  </View>

                  <View style={[styles.meetingStatusBadge, meeting.status === 'Completed' ? styles.statusCompleted : styles.statusScheduled]}>
                    <Text style={[styles.meetingStatusText, meeting.status === 'Completed' ? styles.textEmerald : styles.textBlue]}>
                      {meeting.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.meetingScheduleInfo}>
                  <View style={styles.scheduleItem}>
                    <Calendar color={colors.crimson} size={12} />
                    <Text style={styles.scheduleText}>{meeting.date}</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Clock color={colors.textSecondary} size={12} />
                    <Text style={styles.scheduleText}>{meeting.time}</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <MapPin color={colors.textMuted} size={12} />
                    <Text style={styles.scheduleText} numberOfLines={1}>{meeting.locationOrLink}</Text>
                  </View>
                </View>

                <View style={styles.agendaBox}>
                  <Text style={styles.agendaLabel}>AGENDA:</Text>
                  <Text style={styles.agendaText}>{meeting.agenda}</Text>
                </View>

                {meeting.meetingMinutes && (
                  <View style={styles.minutesBox}>
                    <View style={styles.minutesHeader}>
                      <CheckCircle color={colors.emerald} size={13} />
                      <Text style={styles.minutesTitle}>OUTCOME & ACTION ITEMS</Text>
                    </View>
                    <Text style={styles.minutesText}>{meeting.meetingMinutes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroDeskCard: {
    backgroundColor: colors.cardBg,
    margin: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1,
  },
  heroHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  verifiedCrest: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  crestText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 10,
  },
  heroValueContainer: {
    marginVertical: 10,
  },
  heroValueCrimson: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.crimson,
    letterSpacing: 0.5,
  },
  heroValueSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dealRecordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  dealBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  refActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimson,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  refBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  otoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  otoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: colors.crimsonLight,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.crimson,
    fontWeight: '700',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 12,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  statCrimson: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.crimson,
  },
  dealCard: {
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
  dealTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    gap: 5,
  },
  dealAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.emerald,
  },
  dealTypePill: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dealTypePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dealDescription: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
  },
  dealMembersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  dealMemberCol: {
    flex: 1,
  },
  dealMemberRole: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
  },
  dealMemberName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 1,
  },
  dealDate: {
    fontSize: 10,
    color: colors.textMuted,
  },
  refSubFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  refSubFilterPill: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  refSubFilterPillActive: {
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimson,
  },
  refSubFilterText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  refSubFilterTextActive: {
    color: colors.crimson,
    fontWeight: '700',
  },
  refCard: {
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
  refHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.crimson,
  },
  refMemberName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  refMemberCompany: {
    fontSize: 10.5,
    color: colors.primary,
    fontWeight: '600',
  },
  refTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  badgeGiven: {
    backgroundColor: colors.emeraldLight,
  },
  badgeReceived: {
    backgroundColor: colors.purpleLight,
  },
  refTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textEmerald: {
    color: colors.emerald,
  },
  textPurple: {
    color: colors.purpleAccent,
  },
  refDetailsBox: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  refProspectLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
  },
  refProspectName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  refProspectContact: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  refServiceText: {
    fontSize: 11.5,
    color: colors.primary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  refFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  refValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refValueLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  refValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.crimson,
  },
  statusPill: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  meetingCard: {
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
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  meetingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.crimson,
  },
  meetingMemberInfo: {
    flex: 1,
  },
  meetingMemberName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meetingMemberCompany: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  meetingStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: colors.emeraldLight,
  },
  statusScheduled: {
    backgroundColor: colors.accentBlueLight,
  },
  meetingStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  textBlue: {
    color: colors.accentBlue,
  },
  meetingScheduleInfo: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.cardBgElevated,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleText: {
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  agendaBox: {
    marginBottom: 8,
  },
  agendaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  agendaText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  minutesBox: {
    backgroundColor: colors.emeraldLight,
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
    marginTop: 4,
  },
  minutesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  minutesTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.emerald,
  },
  minutesText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  refDirectionTag: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  emptyRefCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 8,
  },
  emptyRefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptyRefSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  emptyGiveBtn: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  emptyGiveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
