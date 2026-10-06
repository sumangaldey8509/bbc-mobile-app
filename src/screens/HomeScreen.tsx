import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatusRow } from '../components/StatusRow';
import { KpiDashboard } from '../components/KpiDashboard';
import { QuickActions } from '../components/QuickActions';
import { PostCard } from '../components/PostCard';
import { HomeScreenSkeleton } from '../components/SkeletonLoader';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { posts, refreshPosts } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'B2B Requirement' | 'Deal Won' | 'Partnership Ask'>('All');

  useEffect(() => {
    // Simulate initial fetch with skeleton loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPosts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterTabs: ('All' | 'B2B Requirement' | 'Deal Won' | 'Partnership Ask')[] = [
    'All',
    'B2B Requirement',
    'Deal Won',
    'Partnership Ask',
  ];

  const filteredPosts = posts.filter(p => {
    if (selectedFilter === 'All') return true;
    return p.tag === selectedFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header onSearchPress={() => navigation.navigate('Search')} />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <HomeScreenSkeleton />
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
          {/* Statuses / Stories Carousel */}
          <StatusRow />

          {/* Executive KPI Performance Dashboard */}
          <KpiDashboard onNavigateToBusinessDesk={() => navigation.navigate('BusinessDesk')} />

          {/* Fast Action Buttons */}
          <QuickActions />

          {/* Feed Header with Filters */}
          <View style={styles.feedHeaderRow}>
            <View>
              <Text style={styles.feedBadge}>COUNCIL POSTS</Text>
              <Text style={styles.feedTitle}>Business Posts & Opportunities</Text>
            </View>

            <View style={styles.filterIconBox}>
              <Filter color={colors.primary} size={15} />
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterTabs.map(tab => {
              const isSelected = selectedFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setSelectedFilter(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                    {tab === 'All' ? 'All Posts' : tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Feed Posts List */}
          <View style={styles.postsList}>
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDirectMessage={() => navigation.navigate('Messages')}
              />
            ))}
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
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  feedBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  filterIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterPillActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
});
