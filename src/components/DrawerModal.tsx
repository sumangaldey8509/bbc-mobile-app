import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  X,
  User,
  Home,
  FileSpreadsheet,
  Settings,
  Share2,
  Calendar,
  CreditCard,
  Building,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { InitialsAvatar } from './InitialsAvatar';

const { width } = Dimensions.get('window');

interface DrawerModalProps {
  onNavigate: (screenName: string) => void;
}

export const DrawerModal: React.FC<DrawerModalProps> = ({ onNavigate }) => {
  const { showDrawer, closeDrawer, currentUser, logout, openDigitalBusinessCard, isAdmin } = useApp();

  if (!showDrawer) return null;

  const adminMenuItems = isAdmin
    ? [
        {
          id: 'admin-console',
          label: 'Admin Console',
          sublabel: 'Manage members, roles & council administration',
          icon: ShieldCheck,
          color: colors.crimson,
          bgColor: colors.crimsonLight,
          action: () => {
            closeDrawer();
            onNavigate('AdminConsole');
          },
        },
      ]
    : [];

  const menuItems = [
    {
      id: 'home',
      label: 'Home / Dashboard',
      sublabel: 'Return to feed, quick actions & statistics',
      icon: Home,
      color: colors.primary,
      bgColor: colors.cardBgElevated,
      action: () => {
        closeDrawer();
        onNavigate('Home');
      },
    },
    {
      id: 'profile',
      label: 'My Business Profile',
      sublabel: 'View details, GST, and company documents',
      icon: User,
      color: colors.primary,
      bgColor: colors.cardBgElevated,
      action: () => {
        closeDrawer();
        onNavigate('Profile');
      },
    },
    {
      id: 'meeting-summary',
      label: 'Meetings',
      sublabel: '1-to-1s, schedules, member history & minutes',
      icon: FileSpreadsheet,
      color: colors.crimson,
      bgColor: colors.crimsonLight,
      action: () => {
        closeDrawer();
        onNavigate('MeetingSummary');
      },
    },
    {
      id: 'events',
      label: 'Events & Summits',
      sublabel: 'State summits, trade meets, and delegations',
      icon: Calendar,
      color: colors.accentBlue,
      bgColor: colors.accentBlueLight,
      action: () => {
        closeDrawer();
        onNavigate('Events');
      },
    },
    {
      id: 'card',
      label: 'Digital Visiting Card',
      sublabel: 'Share QR code and company profile card',
      icon: CreditCard,
      color: colors.emerald,
      bgColor: colors.emeraldLight,
      action: () => {
        closeDrawer();
        openDigitalBusinessCard();
      },
    },
    {
      id: 'invite',
      label: 'Invite Business Owners',
      sublabel: 'Share invite link with fellow entrepreneurs',
      icon: Sparkles,
      color: colors.accentBlue,
      bgColor: colors.accentBlueLight,
      action: () => {
        closeDrawer();
        Alert.alert(
          'Invite Link Copied',
          `Curated Table invitation link copied to clipboard: https://curatedtable.app/join?ref=${currentUser.id}`
        );
      },
    },
    {
      id: 'settings',
      label: 'Settings & Privacy',
      sublabel: 'App notifications & settings',
      icon: Settings,
      color: colors.textSecondary,
      bgColor: colors.cardBgElevated,
      action: () => {
        closeDrawer();
        Alert.alert('App Info', 'Curated Table App v1.0.0. All systems running normally.');
      },
    },
  ];

  type MenuEntry = (typeof menuItems)[number];

  const renderMenuItem = (item: MenuEntry) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={item.action}
        activeOpacity={0.7}
      >
        <View style={[styles.menuIconBox, { backgroundColor: item.bgColor }]}>
          <Icon color={item.color} size={18} />
        </View>
        <View style={styles.menuTextCol}>
          <Text style={styles.menuTitle}>{item.label}</Text>
          <Text style={styles.menuSub}>{item.sublabel}</Text>
        </View>
        <ChevronRight color={colors.textMuted} size={16} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={showDrawer} transparent animationType="fade" onRequestClose={closeDrawer}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeDrawer} />

        <View style={styles.drawerSheet}>
          {/* Header User Profile Banner */}
          <View style={styles.profileHeader}>
            <View style={styles.crestRow}>
              <BrandLogo size="small" showTagline={true} />
              <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
                <X color={colors.textPrimary} size={18} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.userProfileRow}
              onPress={() => {
                closeDrawer();
                onNavigate('Profile');
              }}
            >
              <InitialsAvatar
                name={currentUser.name}
                uri={currentUser.avatar || undefined}
                size={56}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{currentUser.name}</Text>
                  {currentUser.isGstVerified && <ShieldCheck color={colors.emerald} size={14} />}
                </View>
                <Text style={styles.userDesignation} numberOfLines={1}>
                  {currentUser.designation || 'Member'}
                </Text>
                {currentUser.companyName ? (
                  <Text style={styles.userCompany} numberOfLines={1}>
                    {currentUser.companyName}
                  </Text>
                ) : null}
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillText}>{currentUser.membershipTier}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Bar inside Drawer */}
          <View style={styles.drawerMetricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{currentUser.stats.oneToOneCount}</Text>
              <Text style={styles.metricLabel}>1-to-1s</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{currentUser.stats.referralsGiven}</Text>
              <Text style={styles.metricLabel}>Given</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricCrimson}>₹ {(currentUser.stats.businessValueInLakhs / 100).toFixed(1)} Cr</Text>
              <Text style={styles.metricLabel}>Business</Text>
            </View>
          </View>

          {/* Menu Items List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScroll}>
            {adminMenuItems.length > 0 && (
              <>
                <Text style={styles.menuSectionHeader}>ADMINISTRATION</Text>
                {adminMenuItems.map(renderMenuItem)}
              </>
            )}

            <Text style={styles.menuSectionHeader}>COUNCIL MENU</Text>
            {menuItems.map(renderMenuItem)}

            {/* Secretariat Information Box */}
            <View style={styles.secretariatBox}>
              <View style={styles.secHeader}>
                <Building color={colors.crimson} size={14} />
                <Text style={styles.secTitle}>COUNCIL OFFICE</Text>
              </View>
              <Text style={styles.secText}>
                Kolkata Office • Salt Lake Sector V
              </Text>
              <Text style={styles.secContact}>
                founders@credovation.com
              </Text>
            </View>

            {/* Logout / Switch Account */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                closeDrawer();
                logout();
              }}
            >
              <LogOut color={colors.crimson} size={16} />
              <Text style={styles.logoutText}>Sign Out / Switch Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 25, 44, 0.65)',
  },
  drawerSheet: {
    width: width * 0.84,
    backgroundColor: colors.cardBg,
    height: '100%',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 30,
    overflow: 'hidden',
  },
  profileHeader: {
    backgroundColor: colors.cardBgElevated,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.crimson,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userDesignation: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  userCompany: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  tierPill: {
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  tierPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
  },
  drawerMetricsRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricCrimson: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.crimson,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  menuScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  menuSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  secretariatBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  secTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.5,
  },
  secText: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  secContact: {
    fontSize: 11,
    color: colors.accentBlue,
    marginTop: 2,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimsonLight,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.crimsonBorder,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.crimson,
  },
});
