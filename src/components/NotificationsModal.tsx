import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  X,
  Bell,
  Calendar,
  Clock,
  MapPin,
  CheckCheck,
  Trash2,
  Users2,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const NotificationsModal: React.FC = () => {
  const {
    showNotificationsModal,
    closeNotifications,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    openLogOneToOne,
    users,
  } = useApp();

  if (!showNotificationsModal) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Modal
      visible={showNotificationsModal}
      transparent
      animationType="slide"
      onRequestClose={closeNotifications}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeNotifications} />

        <View style={styles.sheetContainer}>
          {/* Top Notch Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgePill}>
                <Bell color={colors.crimson} size={12} />
                <Text style={styles.badgeText}>COUNCIL ALERTS</Text>
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              {notifications.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={clearAllNotifications}
                  activeOpacity={0.7}
                >
                  <Trash2 color={colors.textSecondary} size={14} />
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={closeNotifications}
                activeOpacity={0.7}
              >
                <X color={colors.textPrimary} size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBox}>
                  <Bell color={colors.textSecondary} size={32} />
                </View>
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySubtitle}>
                  You're all caught up! Scheduled meetings and referral updates will appear here.
                </Text>
              </View>
            ) : (
              notifications.map(notif => {
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                    onPress={() => markNotificationRead(notif.id)}
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
                          <Text style={styles.senderCompany}>{notif.senderCompany}</Text>
                        )}
                      </View>
                      {!notif.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifMessage}>{notif.message}</Text>

                    {/* Meeting Specific Details Box */}
                    {notif.meetingDetails && (
                      <View style={styles.meetingMetaBox}>
                        <View style={styles.metaRow}>
                          <Calendar color={colors.crimson} size={12} />
                          <Text style={styles.metaText}>{notif.meetingDetails.date} • {notif.meetingDetails.time}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <MapPin color={colors.accentBlue} size={12} />
                          <Text style={styles.metaText} numberOfLines={1}>{notif.meetingDetails.location}</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 17,
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
    gap: 12,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  notifCard: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  notifCardUnread: {
    borderColor: colors.crimsonBorder,
    backgroundColor: '#FFF9F9',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 13.5,
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
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
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
    fontSize: 11.5,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
