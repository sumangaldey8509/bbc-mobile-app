import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Building2,
  ShieldCheck,
  CalendarPlus,
  Lock,
  QrCode,
  Check,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { SearchScreenSkeleton } from '../components/SkeletonLoader';

export const SearchScreen: React.FC = () => {
  const {
    users,
    activeSearchQuery,
    setActiveSearchQuery,
    openDigitalBusinessCard,
    openLogOneToOne,
    openRequestAdminAccess,
    requestedAdminAccessIds,
    refreshMembers,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshMembers();
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMembers();
    } finally {
      setIsRefreshing(false);
    }
  };

  const industries = [
    'All',
    'Heavy Engineering',
    'Healthcare',
    'Agro & Tea',
    'Textiles',
    'IT & AI',
    'Logistics',
  ];

  const filteredUsers = users.filter(user => {
    const q = activeSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.companyName.toLowerCase().includes(q) ||
      user.industry.toLowerCase().includes(q) ||
      user.gstNumber.toLowerCase().includes(q) ||
      user.chapter.toLowerCase().includes(q) ||
      user.location.toLowerCase().includes(q);

    const matchesIndustry =
      selectedIndustry === 'All' ||
      (selectedIndustry === 'Heavy Engineering' && user.industry.includes('Engineering')) ||
      (selectedIndustry === 'Healthcare' && user.industry.includes('Healthcare')) ||
      (selectedIndustry === 'Agro & Tea' && user.industry.includes('Tea')) ||
      (selectedIndustry === 'Textiles' && user.industry.includes('Textiles')) ||
      (selectedIndustry === 'IT & AI' && user.industry.includes('IT')) ||
      (selectedIndustry === 'Logistics' && user.industry.includes('Logistics'));

    return matchesQuery && matchesIndustry;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Top Search Bar */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputContainer}>
            <Search color={colors.textSecondary} size={18} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search members by name, company, GST, industry..."
              placeholderTextColor={colors.textMuted}
              value={activeSearchQuery}
              onChangeText={setActiveSearchQuery}
              autoFocus={false}
            />
            {activeSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setActiveSearchQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            <SearchScreenSkeleton />
          </ScrollView>
        ) : (
          <>
            {/* Industry Filter Pills */}
            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {industries.map(ind => {
                  const isSelected = selectedIndustry === ind;
                  return (
                    <TouchableOpacity
                      key={ind}
                      style={[styles.filterPill, isSelected && styles.filterPillActive]}
                      onPress={() => setSelectedIndustry(ind)}
                    >
                      <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                        {ind}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Search Results Summary */}
            <View style={styles.resultsMetaRow}>
              <Text style={styles.resultsCountText}>
                Showing <Text style={styles.textCrimson}>{filteredUsers.length}</Text> Business Owners
              </Text>
              <Text style={styles.verifiedCouncilTag}>● Verified Directory</Text>
            </View>

            {/* Members List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.crimson}
                  colors={[colors.crimson, colors.accentBlue]}
                />
              }
            >
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Search color={colors.textMuted} size={40} />
              <Text style={styles.emptyTitle}>No Business Owners Found</Text>
              <Text style={styles.emptySubtitle}>Try searching with different keywords, company name, or GST number.</Text>
            </View>
          ) : (
            filteredUsers.map(member => {
              const isAccessRequested = requestedAdminAccessIds.includes(member.id);

              return (
                <View key={member.id} style={styles.memberCard}>
                  {/* Top Profile Info */}
                  <View style={styles.cardHeader}>
                    <TouchableOpacity onPress={() => openDigitalBusinessCard(member)} activeOpacity={0.8}>
                      <InitialsAvatar
                        name={member.name}
                        uri={member.avatar || undefined}
                        size={52}
                        style={styles.avatar}
                      />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        {member.isGstVerified && <ShieldCheck color={colors.emerald} size={15} />}
                      </View>
                      <Text style={styles.designation}>{member.designation || 'Member'}</Text>
                      {member.companyName ? (
                        <View style={styles.companyRow}>
                          <Building2 color={colors.primary} size={12} />
                          <Text style={styles.companyName} numberOfLines={1}>{member.companyName}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.chapterText}>
                        {member.chapter} • Member since {member.yearJoined}
                      </Text>
                    </View>
                  </View>

                  {/* GSTIN & Turnover Grid */}
                  <View style={styles.specGrid}>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>GST NUMBER</Text>
                      <Text style={styles.specGst}>{member.gstNumber || 'Not provided'}</Text>
                    </View>

                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>ANNUAL TURNOVER</Text>
                      <Text style={styles.specValue}>{member.turnover || 'Not disclosed'}</Text>
                    </View>

                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>LOCATION</Text>
                      <Text style={styles.specValue}>{member.location || '—'}</Text>
                    </View>

                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>MEMBERSHIP TIER</Text>
                      <Text style={styles.specTier}>{member.membershipTier}</Text>
                    </View>
                  </View>

                  {/* Bio snippet */}
                  <Text style={styles.bioSnippet} numberOfLines={2}>
                    {member.bio || 'Curated Table Member'}
                  </Text>

                  {/* Action Buttons Row */}
                  <View style={styles.cardActions}>
                    {/* View Card */}
                    <TouchableOpacity
                      style={styles.cardBtn}
                      onPress={() => openDigitalBusinessCard(member)}
                      activeOpacity={0.7}
                    >
                      <QrCode color={colors.primary} size={14} />
                      <Text style={styles.cardBtnText}>Visiting Card</Text>
                    </TouchableOpacity>

                    {/* Schedule 1-to-1 */}
                    <TouchableOpacity
                      style={styles.scheduleBtn}
                      onPress={() => openLogOneToOne(member)}
                      activeOpacity={0.7}
                    >
                      <CalendarPlus color={colors.white} size={14} />
                      <Text style={styles.scheduleBtnText}>1-to-1</Text>
                    </TouchableOpacity>

                    {/* Request Full Details to Admin */}
                    <TouchableOpacity
                      style={[styles.adminRequestBtn, isAccessRequested && styles.adminRequestBtnSuccess]}
                      onPress={() => openRequestAdminAccess(member)}
                      activeOpacity={0.7}
                    >
                      {isAccessRequested ? (
                        <>
                          <Check color={colors.emerald} size={13} strokeWidth={3} />
                          <Text style={styles.adminSuccessText}>Request Sent</Text>
                        </>
                      ) : (
                        <>
                          <Lock color={colors.accentBlue} size={13} />
                          <Text style={styles.adminRequestText}>Request Intro</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
        </>
        )}
      </View>
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
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.cardBg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13.5,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  filterSection: {
    paddingVertical: 6,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterPillActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  filterText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  resultsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  resultsCountText: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  textCrimson: {
    color: colors.crimson,
    fontWeight: '700',
  },
  verifiedCouncilTag: {
    fontSize: 10.5,
    color: colors.emerald,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 250,
  },
  memberCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: colors.crimson,
    backgroundColor: colors.cardBgElevated,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  designation: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  chapterText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    rowGap: 8,
  },
  specItem: {
    width: '50%',
  },
  specLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  specGst: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald,
    marginTop: 1,
  },
  specValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  specTier: {
    fontSize: 11,
    color: colors.crimson,
    fontWeight: '700',
    marginTop: 1,
  },
  bioSnippet: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  cardBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.crimson,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  scheduleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  adminRequestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBlueLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.accentBlueBorder,
    gap: 4,
  },
  adminRequestBtnSuccess: {
    backgroundColor: colors.emeraldLight,
    borderColor: colors.emeraldBorder,
  },
  adminRequestText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlueDark,
  },
  adminSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald,
  },
});
