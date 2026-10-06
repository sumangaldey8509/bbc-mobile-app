import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Users2,
  TrendingUp,
  FileSpreadsheet,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Sparkles,
  ShieldCheck,
  Building,
  Video,
  Coffee,
  Check,
  Award,
  ArrowUpRight,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { MeetingSummarySkeleton } from '../components/SkeletonLoader';

export const MeetingSummaryScreen: React.FC = () => {
  const {
    meetingSummaries,
    oneToOneMeetings,
    users,
    currentUser,
    openLogOneToOne,
    markMeetingCompleted,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Upcoming' | 'MemberHistory' | 'ChapterMinutes'>('Upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [completingMeetingId, setCompletingMeetingId] = useState<string | null>(null);
  const [expandedMeetingId, setExpandedMeetingId] = useState<string>(meetingSummaries[0]?.id || '');

  useEffect(() => {
    // Simulate backend fetch of 1-to-1s and chapter records
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const toggleExpand = (id: string) => {
    setExpandedMeetingId(prev => (prev === id ? '' : id));
  };

  const handleDownloadMinutes = (id: string, title: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      Alert.alert(
        'Meeting Record Downloaded',
        `Meeting summary PDF for "${title}" has been saved to your device.`
      );
    }, 700);
  };

  const handleCompleteMeeting = (meetingId: string, partnerName: string) => {
    setCompletingMeetingId(meetingId);
    setTimeout(() => {
      markMeetingCompleted(
        meetingId,
        `1-to-1 Strategy Session with ${partnerName} completed. Strategic synergy and cross-referral avenues discussed.`
      );
      setCompletingMeetingId(null);
      Alert.alert(
        'Meeting Marked as Completed!',
        `Your 1-to-1 session with ${partnerName} has been recorded in your meeting history.`
      );
    }, 600);
  };

  // Filter 1-to-1s
  const upcomingMeetings = oneToOneMeetings.filter(
    m => m.status === 'Scheduled' || m.status === 'Pending Confirmation'
  );
  const completedMeetings = oneToOneMeetings.filter(m => m.status === 'Completed');

  // Member-by-Member Meeting Counts & Stats
  const otherMembers = users.filter(u => u.id !== currentUser.id);

  const memberMeetingStats = otherMembers.map(member => {
    const totalDone = completedMeetings.filter(
      m =>
        (m.withUserId === member.id && (m.creatorId === currentUser.id || !m.creatorId)) ||
        (m.creatorId === member.id && m.withUserId === currentUser.id)
    ).length;

    const totalUpcoming = upcomingMeetings.filter(
      m =>
        (m.withUserId === member.id && (m.creatorId === currentUser.id || !m.creatorId)) ||
        (m.creatorId === member.id && m.withUserId === currentUser.id)
    ).length;

    return {
      member,
      totalDone,
      totalUpcoming,
    };
  });

  // Calculate totals
  const totalCompletedCount = completedMeetings.length;
  const membersMetCount = memberMeetingStats.filter(s => s.totalDone > 0).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <MeetingSummarySkeleton />
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
          {/* Executive Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.badgeRow}>
              <Sparkles color={colors.crimson} size={14} />
              <Text style={styles.badgeText}>COUNCIL 1-TO-1 & CHAPTER SESSIONS</Text>
            </View>
            <Text style={styles.heroTitle}>Meetings</Text>
            <Text style={styles.heroSubtitle}>
              Schedule strategy 1-to-1s with council members, manage upcoming appointments, review member engagement counts, and download chapter minutes.
            </Text>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.scheduleCtaBtn}
              onPress={() => openLogOneToOne()}
              activeOpacity={0.85}
            >
              <Plus color={colors.white} size={18} />
              <Text style={styles.scheduleCtaText}>Schedule 1-to-1 Meeting</Text>
            </TouchableOpacity>
          </View>

          {/* Segmented Tab Controls */}
          <View style={styles.tabBarContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Upcoming' && styles.tabButtonActive]}
              onPress={() => setActiveTab('Upcoming')}
              activeOpacity={0.7}
            >
              <Clock color={activeTab === 'Upcoming' ? colors.crimson : colors.textSecondary} size={15} />
              <Text style={[styles.tabButtonText, activeTab === 'Upcoming' && styles.tabButtonTextActive]}>
                Upcoming ({upcomingMeetings.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'MemberHistory' && styles.tabButtonActive]}
              onPress={() => setActiveTab('MemberHistory')}
              activeOpacity={0.7}
            >
              <Users2 color={activeTab === 'MemberHistory' ? colors.crimson : colors.textSecondary} size={15} />
              <Text style={[styles.tabButtonText, activeTab === 'MemberHistory' && styles.tabButtonTextActive]}>
                Member Stats
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'ChapterMinutes' && styles.tabButtonActive]}
              onPress={() => setActiveTab('ChapterMinutes')}
              activeOpacity={0.7}
            >
              <FileSpreadsheet color={activeTab === 'ChapterMinutes' ? colors.crimson : colors.textSecondary} size={15} />
              <Text style={[styles.tabButtonText, activeTab === 'ChapterMinutes' && styles.tabButtonTextActive]}>
                Chapter Records
              </Text>
            </TouchableOpacity>
          </View>

          {/* ============================================================ */}
          {/* TAB 1: UPCOMING 1-TO-1 MEETINGS */}
          {/* ============================================================ */}
          {activeTab === 'Upcoming' && (
            <View style={styles.tabContent}>
              {upcomingMeetings.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Calendar color={colors.textMuted} size={40} />
                  <Text style={styles.emptyTitle}>No Upcoming Meetings</Text>
                  <Text style={styles.emptySubtitle}>
                    You do not have any 1-to-1 meetings scheduled. Connect with a fellow council member to collaborate!
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyActionBtn}
                    onPress={() => openLogOneToOne()}
                    activeOpacity={0.8}
                  >
                    <Plus color={colors.white} size={16} />
                    <Text style={styles.emptyActionText}>Schedule a 1-to-1 Now</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {upcomingMeetings.map(meeting => {
                    const isCreator = meeting.creatorId === currentUser.id || !meeting.creatorId;
                    const partnerName = isCreator ? meeting.withUserName : (meeting.creatorName || meeting.withUserName);
                    const partnerCompany = isCreator ? meeting.withUserCompany : (meeting.creatorCompany || meeting.withUserCompany);
                    const partnerAvatar = isCreator ? meeting.withUserAvatar : (meeting.creatorAvatar || meeting.withUserAvatar);
                    const isCompleting = completingMeetingId === meeting.id;

                    return (
                      <View key={meeting.id} style={styles.meetingCard}>
                        {/* Status & Creator Tag Banner */}
                        <View style={styles.cardTopBadgeRow}>
                          <View style={styles.statusPillScheduled}>
                            <Clock color={colors.accentBlue} size={12} />
                            <Text style={styles.statusTextScheduled}>UPCOMING 1-TO-1</Text>
                          </View>

                          <View style={[styles.creatorBadge, isCreator ? styles.creatorBadgeMe : styles.creatorBadgeOther]}>
                            <Text style={[styles.creatorBadgeText, isCreator ? styles.creatorTextMe : styles.creatorTextOther]}>
                              {isCreator ? 'Scheduled by You' : `Invitation from ${meeting.creatorName || 'Member'}`}
                            </Text>
                          </View>
                        </View>

                        {/* Member Information Header */}
                        <View style={styles.partnerRow}>
                          <Image source={{ uri: partnerAvatar }} style={styles.partnerAvatar} />
                          <View style={styles.partnerInfo}>
                            <Text style={styles.partnerName}>{partnerName}</Text>
                            <Text style={styles.partnerCompany} numberOfLines={1}>{partnerCompany}</Text>
                          </View>
                        </View>

                        {/* Meeting Schedule & Location Metadata */}
                        <View style={styles.meetingMetaBox}>
                          <View style={styles.metaRow}>
                            <Calendar color={colors.crimson} size={14} />
                            <Text style={styles.metaTextBold}>{meeting.date}</Text>
                            <Text style={styles.metaDivider}>•</Text>
                            <Clock color={colors.textSecondary} size={14} />
                            <Text style={styles.metaText}>{meeting.time}</Text>
                          </View>

                          <View style={styles.metaRow}>
                            <MapPin color={colors.accentBlue} size={14} />
                            <Text style={styles.metaText} numberOfLines={1}>{meeting.locationOrLink}</Text>
                          </View>
                        </View>

                        {/* Agenda */}
                        <View style={styles.agendaBox}>
                          <Text style={styles.agendaLabel}>AGENDA & DISCUSSION GOAL</Text>
                          <Text style={styles.agendaText}>{meeting.agenda}</Text>
                        </View>

                        {/* Action Items if any */}
                        {meeting.actionItems && meeting.actionItems.length > 0 && (
                          <View style={styles.actionItemsBox}>
                            <Text style={styles.actionItemsLabel}>PREPARATION ITEMS</Text>
                            {meeting.actionItems.map((item, idx) => (
                              <View key={idx} style={styles.actionItemRow}>
                                <Text style={styles.actionDot}>•</Text>
                                <Text style={styles.actionItemText}>{item}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Action Buttons */}
                        <View style={styles.cardActionsRow}>
                          <TouchableOpacity
                            style={styles.cardSecBtn}
                            onPress={() =>
                              Alert.alert(
                                'Meeting Venue / Video Link',
                                `Location details: ${meeting.locationOrLink}\n\nTime: ${meeting.time}`
                              )
                            }
                            activeOpacity={0.7}
                          >
                            <MapPin color={colors.primary} size={14} />
                            <Text style={styles.cardSecBtnText}>Directions / Link</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.cardPrimaryBtn, isCompleting && { opacity: 0.75 }]}
                            onPress={() => handleCompleteMeeting(meeting.id, partnerName)}
                            disabled={isCompleting}
                            activeOpacity={0.8}
                          >
                            {isCompleting ? (
                              <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                              <>
                                <CheckCircle2 color={colors.white} size={15} />
                                <Text style={styles.cardPrimaryBtnText}>Mark Completed</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* ============================================================ */}
          {/* TAB 2: MEMBER MEETING HISTORY & COLLABORATION COUNTS */}
          {/* ============================================================ */}
          {activeTab === 'MemberHistory' && (
            <View style={styles.tabContent}>
              {/* Executive Collaboration Metrics Grid */}
              <View style={styles.statsSummaryGrid}>
                <View style={styles.statTile}>
                  <View style={styles.statIconBadgeCrimson}>
                    <CheckCircle2 color={colors.crimson} size={16} />
                  </View>
                  <Text style={styles.statTileValue}>{totalCompletedCount}</Text>
                  <Text style={styles.statTileLabel}>1-to-1s Completed</Text>
                </View>

                <View style={styles.statTile}>
                  <View style={styles.statIconBadgeBlue}>
                    <Users2 color={colors.accentBlue} size={16} />
                  </View>
                  <Text style={styles.statTileValue}>
                    {membersMetCount}/{otherMembers.length}
                  </Text>
                  <Text style={styles.statTileLabel}>Members Connected</Text>
                </View>

                <View style={styles.statTile}>
                  <View style={styles.statIconBadgeEmerald}>
                    <Award color={colors.emerald} size={16} />
                  </View>
                  <Text style={styles.statTileValue}>
                    {Math.round((membersMetCount / (otherMembers.length || 1)) * 100)}%
                  </Text>
                  <Text style={styles.statTileLabel}>Chapter Synergy</Text>
                </View>
              </View>

              {/* Breakdown Title */}
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Meetings Done with Members</Text>
                  <Text style={styles.sectionSubtitle}>
                    Track how many 1-to-1 strategy sessions you have held with each council member.
                  </Text>
                </View>
              </View>

              {/* Member-by-Member Breakdown Cards */}
              <View style={styles.memberStatsList}>
                {memberMeetingStats.map(({ member, totalDone, totalUpcoming }) => (
                  <View key={member.id} style={styles.memberStatCard}>
                    <View style={styles.memberStatHeader}>
                      <Image source={{ uri: member.avatar }} style={styles.memberStatAvatar} />
                      <View style={styles.memberStatInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.memberStatName}>{member.name}</Text>
                          <ShieldCheck color={colors.emerald} size={14} />
                        </View>
                        <Text style={styles.memberStatCompany} numberOfLines={1}>
                          {member.companyName}
                        </Text>
                        <Text style={styles.memberStatIndustry} numberOfLines={1}>
                          {member.industry}
                        </Text>
                      </View>

                      {/* Meeting Count Counter Badge */}
                      <View style={styles.countBadgeWrapper}>
                        <View
                          style={[
                            styles.doneCountBadge,
                            totalDone > 0 ? styles.doneCountBadgeActive : styles.doneCountBadgeZero,
                          ]}
                        >
                          <Text
                            style={[
                              styles.doneCountNumber,
                              totalDone > 0 ? styles.doneCountNumberActive : styles.doneCountNumberZero,
                            ]}
                          >
                            {totalDone}
                          </Text>
                          <Text
                            style={[
                              styles.doneCountText,
                              totalDone > 0 ? styles.doneCountTextActive : styles.doneCountTextZero,
                            ]}
                          >
                            {totalDone === 1 ? 'Meeting Done' : 'Meetings Done'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Footer Row with Upcoming Note & Direct CTA */}
                    <View style={styles.memberStatFooter}>
                      <Text style={styles.statStatusNote}>
                        {totalUpcoming > 0
                          ? `📅 ${totalUpcoming} upcoming meeting scheduled`
                          : totalDone > 0
                          ? `✅ Active collaboration partner`
                          : `☕ No meetings held yet`}
                      </Text>

                      <TouchableOpacity
                        style={styles.scheduleMemberBtn}
                        onPress={() => openLogOneToOne(member)}
                        activeOpacity={0.8}
                      >
                        <Plus color={colors.primary} size={14} />
                        <Text style={styles.scheduleMemberBtnText}>Schedule 1-to-1</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Completed Meeting History Log */}
              {completedMeetings.length > 0 && (
                <View style={styles.historySection}>
                  <Text style={styles.historySectionTitle}>Recent Completed 1-to-1 Minutes</Text>
                  {completedMeetings.map(m => (
                    <View key={m.id} style={styles.historyCard}>
                      <View style={styles.historyCardHeader}>
                        <View>
                          <Text style={styles.historyPartnerName}>{m.withUserName}</Text>
                          <Text style={styles.historyDate}>{m.date} • {m.locationOrLink}</Text>
                        </View>
                        <View style={styles.completedPill}>
                          <Check color={colors.emerald} size={12} strokeWidth={3} />
                          <Text style={styles.completedPillText}>Completed</Text>
                        </View>
                      </View>

                      <Text style={styles.historyAgendaText}>
                        <Text style={styles.boldText}>Discussion: </Text>{m.agenda}
                      </Text>

                      {m.meetingMinutes && (
                        <View style={styles.minutesBox}>
                          <Text style={styles.minutesLabel}>MINUTES & OUTCOME DECISIONS</Text>
                          <Text style={styles.minutesText}>{m.meetingMinutes}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ============================================================ */}
          {/* TAB 3: CHAPTER BI-WEEKLY MEETING RECORDS (MoM) */}
          {/* ============================================================ */}
          {activeTab === 'ChapterMinutes' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Chapter Bi-Weekly Meeting Records</Text>
                  <Text style={styles.sectionSubtitle}>
                    Official Minutes of Meetings (MoM), member presence logs, deals announced, and chapter resolutions.
                  </Text>
                </View>
              </View>

              <View style={styles.meetingsList}>
                {meetingSummaries.map(item => {
                  const isExpanded = expandedMeetingId === item.id;
                  const isDownloadingThis = downloadingId === item.id;

                  return (
                    <View key={item.id} style={styles.meetingCard}>
                      {/* Meeting Header */}
                      <TouchableOpacity
                        style={styles.chapterMeetingHeader}
                        onPress={() => toggleExpand(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.headerLeft}>
                          <View style={styles.chapterBadge}>
                            <Text style={styles.chapterBadgeText}>{item.chapter}</Text>
                          </View>
                          <Text style={styles.meetingTitle}>{item.title}</Text>
                          <View style={styles.dateTimeRow}>
                            <Calendar color={colors.crimson} size={12} />
                            <Text style={styles.dateTimeText}>{item.date}</Text>
                          </View>
                        </View>

                        <View style={styles.expandIconBox}>
                          {isExpanded ? (
                            <ChevronUp color={colors.primary} size={18} />
                          ) : (
                            <ChevronDown color={colors.textSecondary} size={18} />
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* KPI Metrics Box for this Meeting */}
                      <View style={styles.kpiRow}>
                        <View style={styles.kpiCol}>
                          <View style={styles.kpiIconBadge}>
                            <Users2 color={colors.accentBlue} size={14} />
                          </View>
                          <View>
                            <Text style={styles.kpiVal}>{item.attendeesCount}</Text>
                            <Text style={styles.kpiLbl}>Members Present</Text>
                          </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.kpiCol}>
                          <View style={styles.kpiIconBadge}>
                            <TrendingUp color={colors.emerald} size={14} />
                          </View>
                          <View>
                            <Text style={styles.kpiValEmerald}>{item.totalBusinessAnnounced}</Text>
                            <Text style={styles.kpiLbl}>Deals Announced</Text>
                          </View>
                        </View>
                      </View>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <View style={styles.expandedBody}>
                          {/* Key Highlights */}
                          <View style={styles.pointsSection}>
                            <Text style={styles.pointsTitle}>KEY DISCUSSION POINTS & DECISIONS</Text>
                            {item.keyHighlights.map((pt, idx) => (
                              <View key={idx} style={styles.bulletItem}>
                                <Text style={styles.bulletDot}>•</Text>
                                <Text style={styles.bulletText}>{pt}</Text>
                              </View>
                            ))}
                          </View>

                          {/* Next Steps */}
                          {item.nextSteps && item.nextSteps.length > 0 && (
                            <View style={styles.pointsSection}>
                              <Text style={styles.pointsTitle}>ACTION ITEMS & NEXT STEPS</Text>
                              {item.nextSteps.map((step, idx) => (
                                <View key={idx} style={styles.bulletItem}>
                                  <Text style={styles.bulletDot}>➔</Text>
                                  <Text style={styles.bulletText}>{step}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Download MoM PDF Button */}
                          <TouchableOpacity
                            style={[styles.downloadPdfBtn, isDownloadingThis && { opacity: 0.75 }]}
                            onPress={() => handleDownloadMinutes(item.id, item.title)}
                            disabled={isDownloadingThis}
                            activeOpacity={0.8}
                          >
                            {isDownloadingThis ? (
                              <ActivityIndicator size="small" color={colors.crimson} style={{ marginRight: 6 }} />
                            ) : (
                              <Download color={colors.crimson} size={16} />
                            )}
                            <Text style={styles.downloadPdfText}>
                              {isDownloadingThis ? 'Saving Meeting Record...' : 'Download Meeting Summary (PDF)'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
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
  heroCard: {
    backgroundColor: colors.cardBg,
    margin: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  scheduleCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimson,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scheduleCtaText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13.5,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.crimsonLight,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.crimson,
    fontWeight: '800',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listContainer: {
    gap: 14,
  },
  emptyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  emptyActionText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  meetingCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardTopBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPillScheduled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusTextScheduled: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentBlue,
    letterSpacing: 0.5,
  },
  creatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  creatorBadgeMe: {
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  creatorBadgeOther: {
    backgroundColor: colors.crimsonLight,
  },
  creatorBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  creatorTextMe: {
    color: colors.textSecondary,
  },
  creatorTextOther: {
    color: colors.crimson,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  partnerCompany: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  meetingMetaBox: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaDivider: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  agendaBox: {
    marginBottom: 10,
  },
  agendaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  agendaText: {
    fontSize: 12.5,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  actionItemsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionItemsLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 3,
  },
  actionDot: {
    color: colors.crimson,
    fontWeight: '900',
    fontSize: 12,
  },
  actionItemText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cardSecBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBgElevated,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  cardSecBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  cardPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  cardPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statIconBadgeCrimson: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.crimsonLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIconBadgeBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIconBadgeEmerald: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statTileValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statTileLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  memberStatsList: {
    gap: 12,
    marginBottom: 20,
  },
  memberStatCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  memberStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberStatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  memberStatInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberStatName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  memberStatCompany: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  memberStatIndustry: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  countBadgeWrapper: {
    marginLeft: 8,
  },
  doneCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneCountBadgeActive: {
    backgroundColor: colors.crimsonLight,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
  },
  doneCountBadgeZero: {
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  doneCountNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  doneCountNumberActive: {
    color: colors.crimson,
  },
  doneCountNumberZero: {
    color: colors.textMuted,
  },
  doneCountText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  doneCountTextActive: {
    color: colors.crimson,
  },
  doneCountTextZero: {
    color: colors.textMuted,
  },
  memberStatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  statStatusNote: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  scheduleMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  scheduleMemberBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  historySection: {
    marginTop: 8,
    gap: 12,
  },
  historySectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyPartnerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  historyDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  completedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.emerald,
  },
  historyAgendaText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  minutesBox: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  minutesLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.emerald,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  minutesText: {
    fontSize: 11.5,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  chapterMeetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  chapterBadge: {
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  chapterBadgeText: {
    color: colors.crimson,
    fontWeight: '800',
    fontSize: 10,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  expandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  kpiRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  kpiCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kpiIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  kpiValEmerald: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.emerald,
  },
  kpiLbl: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 8,
  },
  expandedBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 12,
  },
  pointsSection: {
    gap: 6,
  },
  pointsTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    color: colors.crimson,
    fontWeight: '900',
    fontSize: 12,
  },
  bulletText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 17,
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimsonLight,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    marginTop: 4,
    gap: 6,
  },
  downloadPdfText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.crimson,
  },
  meetingsList: {
    gap: 12,
  },
});
