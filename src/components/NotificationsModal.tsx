import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  ArrowLeft,
  Bell,
  Heart,
  MessageSquare,
  Calendar,
  MapPin,
  CheckCheck,
  Trash2,
  Share2,
  Trophy,
  Filter,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { getPostByIdRequest } from '../services/postApi';

export const NotificationsModal: React.FC = () => {
  const {
    showNotificationsModal,
    closeNotifications,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    refreshNotifications,
    posts,
    openComments,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'comments' | 'meetings'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!showNotificationsModal) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNotificationPress = async (notif: any) => {
    markNotificationRead(notif.id);

    // If notification has an associated post and is a comment/like, open comments for that post with comment highlighted
    if (notif.postId) {
      let targetPost = posts.find(p => p.id === String(notif.postId));
      if (!targetPost) {
        try {
          targetPost = await getPostByIdRequest(String(notif.postId));
        } catch (err) {
          console.warn('[NotificationsModal] Could not fetch post:', err);
        }
      }

      if (targetPost) {
        closeNotifications();
        setTimeout(() => {
          openComments(targetPost, notif.commentId ? String(notif.commentId) : null);
        }, 200);
      }
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const lower = (notif.type || '').toLowerCase();
    if (activeFilter === 'likes') return lower === 'like';
    if (activeFilter === 'comments') return lower === 'comment';
    if (activeFilter === 'meetings') return lower === 'meeting' || lower === 'referral' || lower === 'deal';
    return true;
  });

  const renderTypeIcon = (type: string) => {
    const lower = (type || '').toLowerCase();
    switch (lower) {
      case 'like':
        return (
          <View style={[styles.typeIconBadge, { backgroundColor: '#FFEBEB' }]}>
            <Heart color={colors.crimson} size={12} fill={colors.crimson} />
            <Text style={[styles.typeBadgeText, { color: colors.crimson }]}>LIKE</Text>
          </View>
        );
      case 'comment':
        return (
          <View style={[styles.typeIconBadge, { backgroundColor: '#E0F2FE' }]}>
            <MessageSquare color={colors.accentBlue} size={12} />
            <Text style={[styles.typeBadgeText, { color: colors.accentBlue }]}>COMMENT</Text>
          </View>
        );
      case 'meeting':
        return (
          <View style={[styles.typeIconBadge, { backgroundColor: '#FEF3C7' }]}>
            <Calendar color="#D97706" size={12} />
            <Text style={[styles.typeBadgeText, { color: '#B45309' }]}>MEETING</Text>
          </View>
        );
      case 'referral':
        return (
          <View style={[styles.typeIconBadge, { backgroundColor: '#D1FAE5' }]}>
            <Share2 color={colors.emerald} size={12} />
            <Text style={[styles.typeBadgeText, { color: colors.emerald }]}>REFERRAL</Text>
          </View>
        );
      case 'deal':
        return (
          <View style={[styles.typeIconBadge, { backgroundColor: '#EDE9FE' }]}>
            <Trophy color="#7C3AED" size={12} />
            <Text style={[styles.typeBadgeText, { color: '#6D28D9' }]}>DEAL</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.typeIconBadge, { backgroundColor: colors.cardBgElevated }]}>
            <Bell color={colors.textSecondary} size={12} />
            <Text style={[styles.typeBadgeText, { color: colors.textSecondary }]}>ALERT</Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={showNotificationsModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={closeNotifications}
    >
      <SafeAreaView style={styles.fullScreenContainer} edges={['top', 'bottom', 'left', 'right']}>
        {/* Full-Screen Top Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={closeNotifications}
              activeOpacity={0.7}
              accessibilityLabel="Back"
            >
              <ArrowLeft color={colors.textPrimary} size={20} />
            </TouchableOpacity>

            <View style={styles.headerTitles}>
              <View style={styles.badgePill}>
                <Bell color={colors.crimson} size={11} />
                <Text style={styles.badgeText}>COUNCIL ALERTS</Text>
              </View>
              <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.actionPillBtn}
                onPress={markAllNotificationsRead}
                activeOpacity={0.7}
              >
                <CheckCheck color={colors.emerald} size={14} />
                <Text style={[styles.actionBtnText, { color: colors.emerald }]}>Read All</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.actionPillBtn}
                onPress={clearAllNotifications}
                activeOpacity={0.7}
              >
                <Trash2 color={colors.textSecondary} size={14} />
                <Text style={styles.actionBtnText}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeNotifications}
              activeOpacity={0.7}
              accessibilityLabel="Close Notifications"
            >
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'likes' && styles.filterChipActive]}
            onPress={() => setActiveFilter('likes')}
            activeOpacity={0.7}
          >
            <Heart
              color={activeFilter === 'likes' ? colors.white : colors.crimson}
              size={12}
              fill={activeFilter === 'likes' ? colors.white : 'transparent'}
            />
            <Text style={[styles.filterChipText, activeFilter === 'likes' && styles.filterChipTextActive]}>
              Likes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'comments' && styles.filterChipActive]}
            onPress={() => setActiveFilter('comments')}
            activeOpacity={0.7}
          >
            <MessageSquare
              color={activeFilter === 'comments' ? colors.white : colors.accentBlue}
              size={12}
            />
            <Text style={[styles.filterChipText, activeFilter === 'comments' && styles.filterChipTextActive]}>
              Comments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'meetings' && styles.filterChipActive]}
            onPress={() => setActiveFilter('meetings')}
            activeOpacity={0.7}
          >
            <Calendar
              color={activeFilter === 'meetings' ? colors.white : '#D97706'}
              size={12}
            />
            <Text style={[styles.filterChipText, activeFilter === 'meetings' && styles.filterChipTextActive]}>
              Meetings & Deals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Notification Cards */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.crimson}
              colors={[colors.crimson]}
            />
          }
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Bell color={colors.textSecondary} size={36} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications Found</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'all'
                  ? "You're all caught up! Likes, comments, and meeting alerts will show up here."
                  : `No ${activeFilter} notifications right now.`}
              </Text>
            </View>
          ) : (
            filteredNotifications.map(notif => {
              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                  onPress={() => handleNotificationPress(notif)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardTopRow}>
                    <Image source={{ uri: notif.senderAvatar }} style={styles.senderAvatar} />
                    <View style={styles.senderInfo}>
                      <View style={styles.senderHeader}>
                        <Text style={styles.senderName}>{notif.senderName}</Text>
                        <Text style={styles.timestamp}>{notif.timestamp}</Text>
                      </View>
                      {notif.senderCompany && (
                        <Text style={styles.senderCompany} numberOfLines={1}>
                          {notif.senderCompany}
                        </Text>
                      )}
                    </View>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </View>

                  <View style={styles.typeAndTitleRow}>
                    {renderTypeIcon(notif.type)}
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                  </View>

                  <Text style={styles.notifMessage}>{notif.message}</Text>

                  {/* Meeting Specific Details Box */}
                  {notif.meetingDetails && (
                    <View style={styles.meetingMetaBox}>
                      <View style={styles.metaRow}>
                        <Calendar color={colors.crimson} size={12} />
                        <Text style={styles.metaText}>
                          {notif.meetingDetails.date} • {notif.meetingDetails.time}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <MapPin color={colors.accentBlue} size={12} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {notif.meetingDetails.location}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerTitles: {
    gap: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  unreadBadge: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
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
    marginLeft: 2,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  body: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  notifCard: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  notifCardUnread: {
    borderColor: colors.crimsonBorder,
    backgroundColor: '#FFF8F8',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  senderInfo: {
    flex: 1,
  },
  senderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
  },
  senderCompany: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.crimson,
    marginLeft: 6,
  },
  typeAndTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeIconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  notifMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  meetingMetaBox: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
