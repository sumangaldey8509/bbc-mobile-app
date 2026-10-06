import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width: boxWidth,
  height,
  borderRadius = 6,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width: boxWidth as any,
          height,
          borderRadius,
          backgroundColor: '#E2E8F0',
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

// 1. Home Screen Skeleton
export const HomeScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Stories / Chapter Highlights Row */}
      <View style={styles.storiesRow}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={styles.storyItem}>
            <SkeletonBox width={62} height={62} borderRadius={31} />
            <SkeletonBox width={50} height={10} borderRadius={5} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>

      {/* KPI Dashboard Card Skeleton */}
      <View style={styles.cardContainer}>
        <View style={styles.kpiHeader}>
          <SkeletonBox width={90} height={12} borderRadius={6} />
          <SkeletonBox width={140} height={16} borderRadius={8} style={{ marginTop: 6 }} />
        </View>

        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
            <SkeletonBox width={32} height={32} borderRadius={16} />
            <SkeletonBox width={80} height={22} borderRadius={6} style={{ marginTop: 10 }} />
            <SkeletonBox width={100} height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
          <View style={styles.kpiBox}>
            <SkeletonBox width={32} height={32} borderRadius={16} />
            <SkeletonBox width={40} height={22} borderRadius={6} style={{ marginTop: 10 }} />
            <SkeletonBox width={90} height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
        </View>

        <View style={styles.kpiBottomRow}>
          <SkeletonBox width="100%" height={56} borderRadius={12} />
        </View>
      </View>

      {/* Quick Action Chips Skeleton */}
      <View style={styles.quickActionsRow}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} width={(width - 48) / 4} height={42} borderRadius={10} />
        ))}
      </View>

      {/* Filter Tabs Skeleton */}
      <View style={styles.filterTabsRow}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} width={88} height={30} borderRadius={15} style={{ marginRight: 8 }} />
        ))}
      </View>

      {/* Feed Post Card Skeletons */}
      {[1, 2].map(i => (
        <View key={i} style={styles.postCard}>
          <View style={styles.postHeader}>
            <SkeletonBox width={42} height={42} borderRadius={21} />
            <View style={styles.postHeaderText}>
              <SkeletonBox width={150} height={14} borderRadius={7} />
              <SkeletonBox width={100} height={11} borderRadius={5} style={{ marginTop: 5 }} />
            </View>
          </View>

          <SkeletonBox width="100%" height={14} borderRadius={7} style={{ marginTop: 12 }} />
          <SkeletonBox width="85%" height={14} borderRadius={7} style={{ marginTop: 6 }} />
          <SkeletonBox width="60%" height={14} borderRadius={7} style={{ marginTop: 6 }} />

          <SkeletonBox width="100%" height={160} borderRadius={12} style={{ marginTop: 12 }} />

          <View style={styles.postFooter}>
            <SkeletonBox width={70} height={24} borderRadius={6} />
            <SkeletonBox width={70} height={24} borderRadius={6} />
            <SkeletonBox width={70} height={24} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
};

// 2. Community Screen Skeleton
export const CommunityScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Hero Banner Skeleton */}
      <View style={styles.communityHeroBanner}>
        <SkeletonBox width={170} height={16} borderRadius={8} />
        <SkeletonBox width={220} height={22} borderRadius={8} style={{ marginTop: 10 }} />
        <SkeletonBox width="92%" height={13} borderRadius={6} style={{ marginTop: 8 }} />
        <SkeletonBox width="70%" height={13} borderRadius={6} style={{ marginTop: 5 }} />
        <SkeletonBox width="100%" height={44} borderRadius={12} style={{ marginTop: 16 }} />
      </View>

      {/* Filter Tabs Skeleton */}
      <View style={styles.communityTabsRow}>
        {[100, 80, 95, 120].map((w, idx) => (
          <SkeletonBox key={idx} width={w} height={34} borderRadius={18} style={{ marginRight: 8 }} />
        ))}
      </View>

      {/* Community Cards Skeleton */}
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.communityCard}>
          <SkeletonBox width="100%" height={130} borderRadius={14} />

          <View style={styles.communityCardBody}>
            <View style={styles.communityHeaderRow}>
              <SkeletonBox width={160} height={18} borderRadius={6} />
              <SkeletonBox width={76} height={32} borderRadius={8} />
            </View>

            <SkeletonBox width="94%" height={13} borderRadius={6} style={{ marginTop: 10 }} />
            <SkeletonBox width="75%" height={13} borderRadius={6} style={{ marginTop: 5 }} />

            <View style={styles.communityMetaRow}>
              <SkeletonBox width={90} height={24} borderRadius={6} />
              <SkeletonBox width={140} height={24} borderRadius={6} />
            </View>

            <View style={styles.communityLeaderRow}>
              <SkeletonBox width={32} height={32} borderRadius={16} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <SkeletonBox width={120} height={13} borderRadius={6} />
                <SkeletonBox width={80} height={10} borderRadius={5} style={{ marginTop: 4 }} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// 3. Search / Directory Screen Skeleton
export const SearchScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBarSkeleton}>
        <SkeletonBox width="100%" height={46} borderRadius={14} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterTabsRow}>
        {[90, 85, 110, 95].map((w, idx) => (
          <SkeletonBox key={idx} width={w} height={32} borderRadius={16} style={{ marginRight: 8 }} />
        ))}
      </View>

      {/* Member Cards */}
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.memberCardSkeleton}>
          <View style={styles.memberRowTop}>
            <SkeletonBox width={54} height={54} borderRadius={27} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonBox width={140} height={16} borderRadius={7} />
              <SkeletonBox width={110} height={12} borderRadius={5} style={{ marginTop: 6 }} />
              <SkeletonBox width={160} height={13} borderRadius={5} style={{ marginTop: 6 }} />
            </View>
            <SkeletonBox width={65} height={28} borderRadius={14} />
          </View>

          <View style={styles.memberBioSkeleton}>
            <SkeletonBox width="96%" height={12} borderRadius={6} />
            <SkeletonBox width="70%" height={12} borderRadius={6} style={{ marginTop: 4 }} />
          </View>

          <View style={styles.memberCardActions}>
            <SkeletonBox width="48%" height={36} borderRadius={10} />
            <SkeletonBox width="48%" height={36} borderRadius={10} />
          </View>
        </View>
      ))}
    </View>
  );
};

// 4. Business Desk Screen Skeleton
export const BusinessDeskSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Volume Summary Card */}
      <View style={styles.deskHeroCard}>
        <SkeletonBox width={130} height={14} borderRadius={6} />
        <SkeletonBox width={190} height={28} borderRadius={8} style={{ marginTop: 8 }} />
        <View style={styles.deskStatsRow}>
          <SkeletonBox width="30%" height={46} borderRadius={10} />
          <SkeletonBox width="30%" height={46} borderRadius={10} />
          <SkeletonBox width="30%" height={46} borderRadius={10} />
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.quickActionsRow}>
        <SkeletonBox width="48%" height={44} borderRadius={12} />
        <SkeletonBox width="48%" height={44} borderRadius={12} />
      </View>

      {/* Tab Selector */}
      <View style={styles.filterTabsRow}>
        {[100, 100, 90].map((w, idx) => (
          <SkeletonBox key={idx} width={w} height={34} borderRadius={17} style={{ marginRight: 8 }} />
        ))}
      </View>

      {/* Deal / Referral Cards */}
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.dealCardSkeleton}>
          <View style={styles.dealCardTop}>
            <SkeletonBox width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <SkeletonBox width={130} height={15} borderRadius={6} />
              <SkeletonBox width={90} height={12} borderRadius={5} style={{ marginTop: 4 }} />
            </View>
            <SkeletonBox width={80} height={22} borderRadius={6} />
          </View>
          <SkeletonBox width="100%" height={14} borderRadius={6} style={{ marginTop: 10 }} />
          <SkeletonBox width="80%" height={14} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
};

// 5. Messages Screen Skeleton
export const MessagesScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBarSkeleton}>
        <SkeletonBox width="100%" height={44} borderRadius={12} />
      </View>

      {/* Chat List Items */}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={styles.chatItemSkeleton}>
          <SkeletonBox width={50} height={50} borderRadius={25} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonBox width={130} height={15} borderRadius={6} />
              <SkeletonBox width={50} height={12} borderRadius={5} />
            </View>
            <SkeletonBox width={90} height={12} borderRadius={5} style={{ marginTop: 4 }} />
            <SkeletonBox width="85%" height={12} borderRadius={5} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

// 6. Profile Screen Skeleton
export const ProfileScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Profile Header Box */}
      <View style={styles.profileHeaderSkeleton}>
        <SkeletonBox width={84} height={84} borderRadius={42} style={{ alignSelf: 'center' }} />
        <SkeletonBox width={170} height={20} borderRadius={8} style={{ alignSelf: 'center', marginTop: 12 }} />
        <SkeletonBox width={130} height={13} borderRadius={6} style={{ alignSelf: 'center', marginTop: 6 }} />
        <SkeletonBox width={160} height={14} borderRadius={6} style={{ alignSelf: 'center', marginTop: 6 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <SkeletonBox width={130} height={38} borderRadius={19} />
          <SkeletonBox width={130} height={38} borderRadius={19} />
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.cardContainer}>
        <View style={styles.kpiGrid}>
          <SkeletonBox width="30%" height={54} borderRadius={10} />
          <SkeletonBox width="30%" height={54} borderRadius={10} />
          <SkeletonBox width="30%" height={54} borderRadius={10} />
        </View>
      </View>

      {/* Bio / Business Details Card */}
      <View style={styles.cardContainer}>
        <SkeletonBox width={120} height={16} borderRadius={6} />
        <SkeletonBox width="100%" height={13} borderRadius={6} style={{ marginTop: 10 }} />
        <SkeletonBox width="92%" height={13} borderRadius={6} style={{ marginTop: 5 }} />
        <SkeletonBox width="75%" height={13} borderRadius={6} style={{ marginTop: 5 }} />
      </View>
    </View>
  );
};

// 7. Events Screen Skeleton
export const EventsScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Featured Banner */}
      <View style={styles.communityHeroBanner}>
        <SkeletonBox width={120} height={14} borderRadius={6} />
        <SkeletonBox width={200} height={20} borderRadius={8} style={{ marginTop: 8 }} />
        <SkeletonBox width="90%" height={13} borderRadius={6} style={{ marginTop: 6 }} />
        <SkeletonBox width="100%" height={120} borderRadius={12} style={{ marginTop: 12 }} />
      </View>

      {/* Event Cards */}
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.communityCard}>
          <SkeletonBox width="100%" height={110} borderRadius={12} />
          <View style={styles.communityCardBody}>
            <SkeletonBox width={160} height={16} borderRadius={6} />
            <SkeletonBox width={120} height={12} borderRadius={5} style={{ marginTop: 6 }} />
            <SkeletonBox width="100%" height={38} borderRadius={10} style={{ marginTop: 12 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

// 8. Meeting Summary Screen Skeleton
export const MeetingSummarySkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.communityHeroBanner}>
        <SkeletonBox width={140} height={16} borderRadius={6} />
        <SkeletonBox width={220} height={22} borderRadius={8} style={{ marginTop: 8 }} />
        <SkeletonBox width="85%" height={13} borderRadius={6} style={{ marginTop: 6 }} />
      </View>

      <View style={styles.cardContainer}>
        <SkeletonBox width={110} height={16} borderRadius={6} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <SkeletonBox width={40} height={40} borderRadius={20} />
        </View>
      </View>

      <View style={styles.cardContainer}>
        <SkeletonBox width={130} height={16} borderRadius={6} />
        <SkeletonBox width="100%" height={13} borderRadius={6} style={{ marginTop: 10 }} />
        <SkeletonBox width="94%" height={13} borderRadius={6} style={{ marginTop: 5 }} />
        <SkeletonBox width="70%" height={13} borderRadius={6} style={{ marginTop: 5 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  storiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  storyItem: {
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
  },
  kpiHeader: {
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: colors.cardBgElevated,
    borderRadius: 12,
    padding: 12,
  },
  kpiBottomRow: {
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  communityHeroBanner: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  communityTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  communityCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  communityCardBody: {
    padding: 16,
  },
  communityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  communityLeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  searchBarSkeleton: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  memberCardSkeleton: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  memberRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberBioSkeleton: {
    marginTop: 12,
  },
  memberCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  deskHeroCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  deskStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  dealCardSkeleton: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  dealCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatItemSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: colors.cardBg,
  },
  profileHeaderSkeleton: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
});
