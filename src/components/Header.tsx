import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Bell, Search, ShieldCheck, QrCode, Home } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onSearchPress?: () => void;
  onSearchFocus?: () => void;
  showSearchBar?: boolean; // Kept for interface compatibility
  showHomeButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSearchPress, onSearchFocus, showHomeButton }) => {
  const navigation = useNavigation<any>();
  const { currentUser, openDrawer, openDigitalBusinessCard, openNotifications, notifications } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else if (onSearchFocus) {
      onSearchFocus();
    } else {
      navigation.navigate('Search');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Brand & Actions */}
      <View style={styles.topRow}>
        <View style={styles.leftBrandSection}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
            activeOpacity={0.7}
            accessibilityLabel="Open Navigation Menu"
          >
            <Menu color={colors.primary} size={22} />
          </TouchableOpacity>

          <BrandLogo size="small" showTagline={true} />
        </View>

        <View style={styles.rightActionIcons}>
          {/* Direct Return to Homepage Icon if enabled */}
          {showHomeButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              activeOpacity={0.7}
              accessibilityLabel="Go to Homepage"
            >
              <Home color={colors.primary} size={19} />
            </TouchableOpacity>
          )}

          {/* Clickable Search Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSearchPress}
            activeOpacity={0.7}
            accessibilityLabel="Search Member Directory"
          >
            <Search color={colors.textPrimary} size={19} />
          </TouchableOpacity>

          {/* Digital Visiting Card QR */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openDigitalBusinessCard()}
            activeOpacity={0.7}
            accessibilityLabel="View Digital Business Card"
          >
            <QrCode color={colors.primary} size={19} />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openNotifications}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Bell color={colors.textSecondary} size={19} />
            {unreadCount > 0 && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting & Verification Banner */}
      <View style={styles.memberGreetingRow}>
        <View>
          <Text style={styles.greetingText}>
            Namaskar, <Text style={styles.memberName}>{(currentUser.name || 'Member').split(' ')[0]}</Text>
          </Text>
          <Text style={styles.chapterBadgeText}>
            {currentUser.chapter || 'Kolkata Chapter'} • <Text style={styles.tierText}>{currentUser.membershipTier || 'Member'}</Text>
          </Text>
        </View>
        {currentUser.isGstVerified ? (
          <View style={styles.gstVerifiedPill}>
            <ShieldCheck color={colors.emerald} size={14} />
            <Text style={styles.gstVerifiedText}>GST Verified</Text>
          </View>
        ) : (
          <View style={[styles.gstVerifiedPill, { backgroundColor: colors.accentBlueLight, borderColor: colors.accentBlueBorder }]}>
            <ShieldCheck color={colors.accentBlue} size={14} />
            <Text style={[styles.gstVerifiedText, { color: colors.accentBlue }]}>Member</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftBrandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rightActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.crimson,
    borderWidth: 1,
    borderColor: colors.white,
  },
  memberGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  greetingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
  memberName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  chapterBadgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tierText: {
    color: colors.crimson,
    fontWeight: '700',
  },
  gstVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    gap: 4,
  },
  gstVerifiedText: {
    color: colors.emerald,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
