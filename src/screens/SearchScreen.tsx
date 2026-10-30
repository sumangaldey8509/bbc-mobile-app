import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Building2,
  ShieldCheck,
  CalendarPlus,
  QrCode,
  Check,
  ChevronDown,
  ChevronUp,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { UserTierBadge } from '../components/UserTierBadge';
import { SearchScreenSkeleton } from '../components/SkeletonLoader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PremiumToast, ToastType } from '../components/PremiumToast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SearchScreen: React.FC = () => {
  const {
    users,
    currentUser,
    activeSearchQuery,
    setActiveSearchQuery,
    openDigitalBusinessCard,
    openLogOneToOne,
    refreshMembers,
    connectionStatuses,
    sendConnection,
    acceptConnection,
    cancelConnection,
    removeConnection,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [connectingMemberId, setConnectingMemberId] = useState<string | null>(null);
  const [menuMember, setMenuMember] = useState<any | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ visible: true, type, title, message });
  };

  const handleRemoveConnectionClick = (member: any) => {
    setMenuMember(null);

    setConfirmConfig({
      visible: true,
      title: 'Remove Connection',
      message: `Are you sure you want to remove your connection with ${member.name}?`,
      confirmLabel: 'Yes, Remove',
      cancelLabel: 'Cancel',
      destructive: true,
      loading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
          const connInfo = connectionStatuses[member.id];
          await removeConnection(member.id, connInfo?.connectionId);
          setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
          showToast('info', 'Connection Removed', `You have removed your connection with ${member.name}.`);
        } catch (err: any) {
          setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
          showToast('error', 'Error', err?.message || 'Could not remove connection');
        }
      },
    });
  };

  const handleConnectionPress = async (member: any) => {
    const connInfo = connectionStatuses[member.id];
    const status = connInfo?.status || 'none';

    if (status === 'accepted') {
      setMenuMember(member);
      return;
    }

    if (status === 'pending_outgoing') {
      setConfirmConfig({
        visible: true,
        title: 'Cancel Connection Request',
        message: `Connection request already sent to ${member.name}. Would you like to cancel it?`,
        confirmLabel: 'Cancel Request',
        cancelLabel: 'Keep Pending',
        destructive: true,
        loading: false,
        onConfirm: async () => {
          setConfirmConfig(prev => ({ ...prev, loading: true }));
          try {
            await cancelConnection({ targetUserId: member.id, connectionId: connInfo?.connectionId });
            setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
            showToast('info', 'Request Cancelled', `Connection request to ${member.name} has been cancelled.`);
          } catch (err: any) {
            setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
            showToast('error', 'Error', err?.message || 'Could not cancel request');
          }
        },
      });
      return;
    }

    if (status === 'pending_incoming') {
      setConnectingMemberId(member.id);
      try {
        await acceptConnection({ senderId: member.id, connectionId: connInfo?.connectionId });
        showToast('success', 'Connected!', `You are now connected with ${member.name}.`);
      } catch (err: any) {
        const isWithdrawn =
          err?.status === 410 ||
          err?.code === 'CONNECTION_WITHDRAWN' ||
          (err?.message && err.message.toLowerCase().includes('withdrawn'));
        if (isWithdrawn) {
          showToast('warning', 'Request Withdrawn', 'This connection request was withdrawn by the sender.');
        } else {
          showToast('error', 'Notice', err?.message || 'Could not accept request');
        }
      } finally {
        setConnectingMemberId(null);
      }
      return;
    }

    // Default 'none' -> Send connection request
    setConnectingMemberId(member.id);
    try {
      await sendConnection(member.id);
      showToast('success', 'Request Sent', `Connection request sent to ${member.name}.`);
    } catch (err: any) {
      showToast('error', 'Notice', err?.message || 'Could not send connection request');
    } finally {
      setConnectingMemberId(null);
    }
  };

  const renderConnectionButton = (member: any) => {
    const isConnecting = connectingMemberId === member.id;
    const connInfo = connectionStatuses[member.id];
    const status = connInfo?.status || 'none';

    if (isConnecting) {
      return (
        <View style={[styles.connectionBtn, styles.connectionBtnDefault]}>
          <ActivityIndicator size="small" color={colors.accentBlue} />
        </View>
      );
    }

    if (status === 'accepted') {
      return (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.connectionBtn,
            styles.connectionBtnAccepted,
            pressed && { opacity: 0.7 },
          ]}
          onPress={(e) => {
            e?.stopPropagation?.();
            handleConnectionPress(member);
          }}
        >
          <UserCheck color={colors.emerald} size={13} strokeWidth={2.5} />
          <Text style={styles.connectionTextAccepted}>Connected</Text>
        </Pressable>
      );
    }

    if (status === 'pending_outgoing') {
      return (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.connectionBtn,
            styles.connectionBtnPending,
            pressed && { opacity: 0.7 },
          ]}
          onPress={(e) => {
            e?.stopPropagation?.();
            handleConnectionPress(member);
          }}
        >
          <Clock color={colors.textSecondary} size={13} strokeWidth={2} />
          <Text style={styles.connectionTextPending}>Pending</Text>
        </Pressable>
      );
    }

    if (status === 'pending_incoming') {
      return (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.connectionBtn,
            styles.connectionBtnIncoming,
            pressed && { opacity: 0.7 },
          ]}
          onPress={(e) => {
            e?.stopPropagation?.();
            handleConnectionPress(member);
          }}
        >
          <Check color={colors.white} size={13} strokeWidth={2.5} />
          <Text style={styles.connectionTextIncoming}>Accept</Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.connectionBtn,
          styles.connectionBtnDefault,
          pressed && { opacity: 0.7 },
        ]}
        onPress={(e) => {
          e?.stopPropagation?.();
          handleConnectionPress(member);
        }}
      >
        <UserPlus color={colors.accentBlue} size={13} strokeWidth={2} />
        <Text style={styles.connectionTextDefault}>Connect</Text>
      </Pressable>
    );
  };

  const toggleExpandMember = (memberId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMemberId(prev => (prev === memberId ? null : memberId));
  };

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
    // 1. Exclude the currently logged-in user
    const isCurrentUser =
      Boolean(currentUser?.id && user.id === currentUser.id) ||
      Boolean(
        currentUser?.contact?.email &&
        user.contact?.email &&
        user.contact.email.toLowerCase() === currentUser.contact.email.toLowerCase()
      );

    // 2. Exclude System Admin accounts
    const isSystemAdmin =
      Boolean(user.roles && user.roles.includes('admin')) ||
      user.name.toLowerCase().trim() === 'system admin';

    if (isCurrentUser || isSystemAdmin) {
      return false;
    }

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
                  const isExpanded = expandedMemberId === member.id;

                  return (
                    <View key={member.id} style={[styles.memberCard, isExpanded && styles.memberCardExpanded]}>
                      {/* Top Profile Info Header - Accordion Toggle */}
                      <TouchableOpacity
                        style={[styles.cardHeader, isExpanded && styles.cardHeaderExpanded]}
                        onPress={() => toggleExpandMember(member.id)}
                        activeOpacity={0.7}
                      >
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            openDigitalBusinessCard(member);
                          }}
                          activeOpacity={0.8}
                        >
                          <InitialsAvatar
                            name={member.name}
                            uri={member.avatar || undefined}
                            user={member}
                            size={50}
                            style={styles.avatar}
                          />
                        </TouchableOpacity>

                        <View style={styles.headerInfo}>
                          <View style={styles.nameRow}>
                            <UserTierBadge user={member} size={18} />
                            <Text style={styles.memberName}>{member.name}</Text>
                            {member.isGstVerified && <ShieldCheck color={colors.emerald} size={15} />}
                          </View>
                          <Text style={styles.designation} numberOfLines={1}>{member.designation || 'Member'}</Text>
                          {member.companyName ? (
                            <View style={styles.companyRow}>
                              <Building2 color={colors.primary} size={12} />
                              <Text style={styles.companyName} numberOfLines={1}>{member.companyName}</Text>
                            </View>
                          ) : null}
                          <Text style={styles.chapterText} numberOfLines={1}>
                            {member.chapter} • Member since {member.yearJoined}
                          </Text>
                        </View>

                        {/* Accordion Chevron Indicator */}
                        <View style={[styles.chevronBadge, isExpanded && styles.chevronBadgeActive]}>
                          {isExpanded ? (
                            <ChevronUp color={colors.crimson} size={18} />
                          ) : (
                            <ChevronDown color={colors.textSecondary} size={18} />
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Expandable Accordion Body */}
                      {isExpanded && (
                        <View style={styles.accordionBody}>
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
                          <Text style={styles.bioSnippet} numberOfLines={3}>
                            {member.bio || 'Bengal Business Council Member'}
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

                            {/* Send Connection Request */}
                            {renderConnectionButton(member)}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </>
        )}
        {/* Popup Menu for Connected Member */}
        <Modal
          visible={!!menuMember}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuMember(null)}
        >
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuMember(null)}
          >
            <Pressable
              style={styles.menuContainer}
              onPress={(e) => e.stopPropagation?.()}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle} numberOfLines={1}>
                  {menuMember?.name}
                </Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  {menuMember?.companyName || 'Council Member'}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { opacity: 0.7, backgroundColor: colors.cardBgElevated },
                ]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  if (menuMember) handleRemoveConnectionClick(menuMember);
                }}
              >
                <View style={styles.menuItemIconBox}>
                  <UserX color={colors.crimson} size={18} />
                </View>
                <View style={styles.menuItemTextCol}>
                  <Text style={styles.menuItemTitle}>Remove Connection</Text>
                  <Text style={styles.menuItemDesc}>Disconnect with this member</Text>
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.menuCancelBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  setMenuMember(null);
                }}
              >
                <Text style={styles.menuCancelText}>Cancel</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Unified Cross-Platform Confirmation Dialog */}
        <ConfirmDialog
          visible={confirmConfig.visible}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          cancelLabel={confirmConfig.cancelLabel}
          destructive={confirmConfig.destructive}
          loading={confirmConfig.loading}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(prev => ({ ...prev, visible: false }))}
        />

        {/* Unified Non-blocking Toast */}
        <PremiumToast
          visible={toast.visible}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
        />
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
  memberCardExpanded: {
    borderColor: 'rgba(217, 39, 46, 0.35)',
    shadowOpacity: 0.08,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderExpanded: {
    marginBottom: 12,
  },
  chevronBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  chevronBadgeActive: {
    backgroundColor: '#FFEBEB',
  },
  accordionBody: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  connectionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    gap: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
  },
  connectionBtnDefault: {
    backgroundColor: colors.accentBlueLight,
    borderColor: colors.accentBlueBorder,
  },
  connectionTextDefault: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlueDark,
  },
  connectionBtnAccepted: {
    backgroundColor: colors.emeraldLight,
    borderColor: colors.emeraldBorder,
  },
  connectionTextAccepted: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald,
  },
  connectionBtnPending: {
    backgroundColor: colors.cardBgElevated,
    borderColor: colors.cardBorder,
  },
  connectionTextPending: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  connectionBtnIncoming: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  connectionTextIncoming: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  menuContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  menuHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 12,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  menuItemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.crimson,
  },
  menuItemDesc: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  menuCancelBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  menuCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
