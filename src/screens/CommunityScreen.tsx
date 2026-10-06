import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users2,
  Calendar,
  MessageSquare,
  Building,
  CheckCircle2,
  Plus,
  Compass,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { CommunityScreenSkeleton } from '../components/SkeletonLoader';

export const CommunityScreen: React.FC = () => {
  const { communities, toggleJoinCommunity } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'All' | 'Joined' | 'Regional' | 'Industry SIG'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [isProposing, setIsProposing] = useState(false);

  useEffect(() => {
    // Simulate backend network fetch with skeleton loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 950);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 850);
  };

  const handleToggleJoin = (id: string) => {
    setJoiningId(id);
    setTimeout(() => {
      toggleJoinCommunity(id);
      setJoiningId(null);
    }, 600);
  };

  const filteredCommunities = communities.filter(c => {
    if (selectedTab === 'Joined') return c.isJoined;
    if (selectedTab === 'Regional') return c.type === 'Regional Chapter';
    if (selectedTab === 'Industry SIG') return c.type === 'Industry Special Interest Group (SIG)';
    return true;
  });

  const handleCreateChapterProposal = () => {
    setIsProposing(true);
    setTimeout(() => {
      setIsProposing(false);
      Alert.alert(
        'New Chapter Request',
        'Your request has been sent to the Council team. A minimum of 15 members are required to start a new chapter.'
      );
    }, 750);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <CommunityScreenSkeleton />
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
          {/* Banner Section */}
          <View style={styles.heroBanner}>
            <View style={styles.heroBadgeRow}>
              <Compass color={colors.crimson} size={16} />
              <Text style={styles.heroBadgeText}>BENGAL BUSINESS NETWORK</Text>
            </View>
            <Text style={styles.heroTitle}>Chapters & Industry Groups</Text>
            <Text style={styles.heroSubtitle}>
              Connect with local business chapters and specialized industry groups across West Bengal.
            </Text>

            <TouchableOpacity
              style={[styles.proposeBtn, isProposing && { opacity: 0.75 }]}
              onPress={handleCreateChapterProposal}
              disabled={isProposing}
              activeOpacity={0.8}
            >
              {isProposing ? (
                <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 6 }} />
              ) : (
                <Plus color={colors.white} size={16} strokeWidth={2.5} />
              )}
              <Text style={styles.proposeBtnText}>
                {isProposing ? 'Sending Request...' : 'Request New Chapter / Group'}
              </Text>
            </TouchableOpacity>
          </View>

        {/* Tab Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {(['All', 'Joined', 'Regional', 'Industry SIG'] as const).map(tab => {
            const isSelected = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {tab === 'All' ? 'All Groups' : tab === 'Industry SIG' ? 'Industry Groups' : tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Chapters List */}
        <View style={styles.communitiesList}>
          {filteredCommunities.map(community => {
            const isJoiningThis = joiningId === community.id;
            return (
              <View key={community.id} style={styles.communityCard}>
                {/* Banner Image */}
                <View style={styles.bannerContainer}>
                  <Image source={{ uri: community.banner }} style={styles.bannerImage} />
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{community.type.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.communityName}>{community.name}</Text>
                    <TouchableOpacity
                      style={[styles.joinBtn, community.isJoined && styles.joinedBtn, isJoiningThis && { opacity: 0.7 }]}
                      onPress={() => handleToggleJoin(community.id)}
                      disabled={isJoiningThis}
                      activeOpacity={0.8}
                    >
                      {isJoiningThis ? (
                        <ActivityIndicator size="small" color={community.isJoined ? colors.textPrimary : colors.white} style={{ transform: [{ scale: 0.8 }] }} />
                      ) : community.isJoined ? (
                        <>
                          <CheckCircle2 color={colors.emerald} size={14} />
                          <Text style={styles.joinedText}>Joined</Text>
                        </>
                      ) : (
                        <>
                          <Plus color={colors.white} size={14} />
                          <Text style={styles.joinText}>Join Chapter</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                <Text style={styles.description}>{community.description}</Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Users2 color={colors.crimson} size={14} />
                    <Text style={styles.statText}>{community.membersCount} Members</Text>
                  </View>

                  <View style={styles.statItem}>
                    <MessageSquare color={colors.accentBlue} size={14} />
                    <Text style={styles.statText}>{community.activeDiscussionsCount} Active Posts</Text>
                  </View>
                </View>

                {/* President / Leadership Highlight */}
                <View style={styles.presidentBox}>
                  <Image source={{ uri: community.presidentAvatar }} style={styles.presAvatar} />
                  <View style={styles.presInfo}>
                    <Text style={styles.presRole}>CHAPTER PRESIDENT</Text>
                    <Text style={styles.presName}>{community.presidentName}</Text>
                    <Text style={styles.presCompany}>{community.presidentCompany}</Text>
                  </View>
                </View>

                {/* Next Meeting Schedule Box */}
                <View style={styles.meetingBox}>
                  <View style={styles.meetingHeaderRow}>
                    <Calendar color={colors.crimson} size={14} />
                    <Text style={styles.meetingHeaderTitle}>NEXT CHAPTER MEETING</Text>
                  </View>
                  <Text style={styles.meetingTitle}>{community.nextMeeting.title}</Text>
                  <Text style={styles.meetingDateTime}>
                    {community.nextMeeting.date} • {community.nextMeeting.time}
                  </Text>
                  <View style={styles.venueRow}>
                    <Building color={colors.textMuted} size={12} />
                    <Text style={styles.venueText} numberOfLines={1}>
                      {community.nextMeeting.venue}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        </View>
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
  heroBanner: {
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
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  proposeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimson,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  proposeBtnText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabBtnActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  communitiesList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 16,
  },
  communityCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  bannerContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardBgElevated,
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.crimson,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.crimson,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  joinedBtn: {
    backgroundColor: colors.emeraldLight,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
  },
  joinText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  joinedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald,
  },
  description: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 11.5,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  presidentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  presAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.crimson,
  },
  presInfo: {
    flex: 1,
  },
  presRole: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  presName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presCompany: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  meetingBox: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  meetingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  meetingHeaderTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.5,
  },
  meetingTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meetingDateTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  venueText: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
});
