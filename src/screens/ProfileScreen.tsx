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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  QrCode,
  Share2,
  Home,
  ArrowLeft,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { ProfileScreenSkeleton } from '../components/SkeletonLoader';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentUser, openDigitalBusinessCard, logout, refreshProfileStatus } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshProfileStatus();
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
      await refreshProfileStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGoHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header showSearchBar={false} showHomeButton={true} />

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <ProfileScreenSkeleton />
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
        {/* Cover & Profile Banner */}
        <View style={styles.coverContainer}>
          {currentUser.coverImage ? (
            <Image source={{ uri: currentUser.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>
                {currentUser.companyName || currentUser.name}
              </Text>
            </View>
          )}
          <View style={styles.coverOverlay} />

          {/* Floating Return to Home Button */}
          <TouchableOpacity
            style={styles.floatingHomeBtn}
            onPress={handleGoHome}
            activeOpacity={0.8}
            accessibilityLabel="Go to Homepage"
          >
            <ArrowLeft color={colors.white} size={14} />
            <Text style={styles.floatingHomeBtnText}>Home</Text>
          </TouchableOpacity>

          <View style={styles.profileBadgeTop}>
            <Text style={styles.profileBadgeTopText}>{currentUser.membershipTier.toUpperCase()}</Text>
          </View>
        </View>

        {/* Profile Card Overlay */}
        <View style={styles.profileInfoCard}>
          <View style={styles.avatarRow}>
            <InitialsAvatar
              name={currentUser.name}
              uri={currentUser.avatar || undefined}
              size={72}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cardBtn}
              onPress={() => openDigitalBusinessCard()}
              activeOpacity={0.8}
            >
              <QrCode color={colors.white} size={15} />
              <Text style={styles.cardBtnText}>Digital Card</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nameSection}>
            <View style={styles.nameVerifiedRow}>
              <Text style={styles.name}>{currentUser.name}</Text>
              {currentUser.isGstVerified && <ShieldCheck color={colors.emerald} size={18} />}
            </View>
            <Text style={styles.designation}>{currentUser.designation || 'Member'}</Text>
            {currentUser.companyName ? (
              <View style={styles.companyRow}>
                <Building2 color={colors.primary} size={14} />
                <Text style={styles.companyName}>{currentUser.companyName}</Text>
              </View>
            ) : null}
            <Text style={styles.chapterText}>
              {currentUser.chapter} • Member Since {currentUser.yearJoined}
            </Text>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{currentUser.stats.oneToOneCount}</Text>
              <Text style={styles.metricLabel}>1-to-1s</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{currentUser.stats.referralsGiven}</Text>
              <Text style={styles.metricLabel}>Referrals</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricCrimson}>₹ {(currentUser.stats.businessValueInLakhs / 100).toFixed(2)} Cr</Text>
              <Text style={styles.metricLabel}>Total Deals</Text>
            </View>
          </View>
        </View>

        {/* Business Specifications Grid */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>VERIFIED BUSINESS PROFILE</Text>

          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>GST NUMBER {currentUser.isGstVerified ? '(VERIFIED)' : ''}</Text>
              <Text style={styles.specGst}>{currentUser.gstNumber || 'Not provided'}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>ANNUAL TURNOVER</Text>
              <Text style={styles.specValue}>{currentUser.turnover || 'Not disclosed'}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>INDUSTRY</Text>
              <Text style={styles.specValue}>{currentUser.industry || 'General'}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>OFFICE LOCATION</Text>
              <Text style={styles.specValue}>{currentUser.location || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Company Bio */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>ABOUT THE COMPANY</Text>
          <Text style={styles.bioText}>{currentUser.bio || 'No company bio provided yet.'}</Text>
        </View>

        {/* Verified Capability Documents / Brochures */}
        {currentUser.requirementDocs && currentUser.requirementDocs.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>COMPANY BROCHURES & DOCUMENTS</Text>
            {currentUser.requirementDocs.map((doc, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.docItem}
                onPress={() => {
                  if (doc.publicLink) {
                    Linking.openURL(doc.publicLink).catch(() => {
                      Alert.alert('Error', 'Could not open document link.');
                    });
                  } else {
                    Alert.alert('View Document', `Opening ${doc.title}`);
                  }
                }}
                activeOpacity={0.8}
              >
                <FileText color={colors.crimson} size={18} />
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
                  <Text style={styles.docMeta}>{doc.type || 'Document'} {doc.size ? `• ${doc.size}` : ''} • Verified Document</Text>
                </View>
                <Text style={styles.docAction}>View</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Official Contact Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>OFFICIAL CONTACT DETAILS</Text>

          <View style={styles.contactItem}>
            <Mail color={colors.primary} size={15} />
            <Text style={styles.contactText}>{currentUser.contact?.email || '—'}</Text>
          </View>

          <View style={styles.contactItem}>
            <Phone color={colors.primary} size={15} />
            <Text style={styles.contactText}>{currentUser.contact?.phone || '—'}</Text>
          </View>

          <View style={styles.contactItem}>
            <Globe color={colors.primary} size={15} />
            <Text style={styles.contactText}>{currentUser.contact?.website || '—'}</Text>
          </View>

          <View style={styles.contactItem}>
            <MapPin color={colors.primary} size={15} />
            <Text style={styles.contactText}>{currentUser.contact?.officeAddress || '—'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsBox}>
          <TouchableOpacity
            style={styles.homeActionBtn}
            onPress={handleGoHome}
            activeOpacity={0.8}
            accessibilityLabel="Go to Homepage"
          >
            <Home color={colors.white} size={16} />
            <Text style={styles.homeBtnText}>Go to Homepage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => openDigitalBusinessCard()}
            activeOpacity={0.8}
          >
            <CreditCard color={colors.white} size={16} />
            <Text style={styles.primaryBtnText}>View Digital Visiting Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => {
              Alert.alert(
                'Member Profile Link',
                `Curated Table profile link: https://curatedtable.app/members/${currentUser.id}`
              );
            }}
            activeOpacity={0.8}
          >
            <Share2 color={colors.primary} size={16} />
            <Text style={styles.secondaryBtnText}>Share My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutActionBtn}
            onPress={() => {
              logout();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>Sign Out / Switch Account</Text>
          </TouchableOpacity>
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
  coverContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  coverPlaceholderText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 25, 44, 0.45)',
  },
  floatingHomeBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 25, 44, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    gap: 5,
    zIndex: 10,
  },
  floatingHomeBtnText: {
    color: colors.white,
    fontSize: 11.5,
    fontWeight: '700',
  },
  homeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  homeBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.white,
  },
  profileBadgeTop: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: colors.crimson,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  profileBadgeTopText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  profileInfoCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    marginTop: -40,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.crimson,
    backgroundColor: colors.cardBgElevated,
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.crimson,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  cardBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.white,
  },
  nameSection: {
    marginBottom: 14,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  designation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  chapterText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricCrimson: {
    fontSize: 16,
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
    height: 24,
    backgroundColor: colors.cardBorder,
  },
  sectionCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald,
    marginTop: 2,
  },
  specValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  docMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  docAction: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.crimson,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  contactText: {
    fontSize: 12.5,
    color: colors.textPrimary,
    flex: 1,
  },
  actionsBox: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  logoutActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimsonLight,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.crimson,
  },
});
