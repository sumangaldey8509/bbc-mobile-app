import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from 'expo-blur';
import {
  X,
  Share2,
  Copy,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  Sparkles,
  QrCode,
  Download,
  UserPlus,
  UserCheck,
  Check,
  Clock,
  Lock,
  UserX,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { InitialsAvatar } from './InitialsAvatar';
import { PremiumToast, ToastType } from './PremiumToast';
import { ConfirmDialog } from './ConfirmDialog';

const { width } = Dimensions.get('window');

const maskEmail = (email?: string): string => {
  if (!email) return '●●●●●●●●●●●●@●●●●.com';
  const parts = email.split('@');
  const nameLen = Math.max(parts[0]?.length || 8, 8);
  const domain = parts[1] || 'domain.com';
  const domainParts = domain.split('.');
  const domainLen = Math.max(domainParts[0]?.length || 6, 6);
  const ext = domainParts[1] || 'com';
  return `${'●'.repeat(nameLen)}@${'●'.repeat(domainLen)}.${ext}`;
};

const maskPhone = (phone?: string): string => {
  if (!phone) return '+91 ●●●●● ●●●●●';
  const hasCountryCode = phone.startsWith('+');
  return hasCountryCode ? '+91 ●●●●● ●●●●●' : '●●●●● ●●●●●';
};

export const DigitalBusinessCardModal: React.FC = () => {
  const {
    showBusinessCardModal,
    selectedBusinessCardUser,
    closeDigitalBusinessCard,
    currentUser,
    openLogOneToOne,
    openGiveReferral,
    connectionStatuses,
    acceptConnection,
    rejectConnection,
    dismissNotification,
    notifications,
    sendConnection,
    cancelConnection,
    removeConnection,
  } = useApp();

  const [cardSide, setCardSide] = useState<'front' | 'qr'>('front');
  const [requestedPhysicalCard, setRequestedPhysicalCard] = useState(false);
  const [isResponding, setIsResponding] = useState<'accept' | 'ignore' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRemoveMenu, setShowRemoveMenu] = useState(false);

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

  const user = selectedBusinessCardUser || currentUser;
  const isMe = user.id === currentUser.id;

  const connInfo = user?.id ? connectionStatuses[user.id] : undefined;
  const status = connInfo?.status || 'none';
  const isConnected = isMe || status === 'accepted';

  const matchingNotif = notifications.find(
    n =>
      (n.type === 'connection_request' || (n.type as string) === 'connection') &&
      String(n.senderId) === String(user.id)
  );
  const connectionId = connInfo?.connectionId || matchingNotif?.connectionId;

  const handleAcceptRequest = async () => {
    setIsResponding('accept');
    try {
      await acceptConnection({ senderId: user.id, connectionId });
      if (matchingNotif) {
        dismissNotification(matchingNotif.id);
      }
      showToast('success', 'Connected!', `You are now connected with ${user.name}.`);
    } catch (err: any) {
      const isWithdrawn =
        err?.status === 410 ||
        err?.code === 'CONNECTION_WITHDRAWN' ||
        (err?.message && err.message.toLowerCase().includes('withdrawn'));
      if (isWithdrawn) {
        if (matchingNotif) dismissNotification(matchingNotif.id);
        showToast('warning', 'Request Withdrawn', 'This connection request was withdrawn by the sender.');
      } else {
        showToast('error', 'Notice', err?.message || 'Could not accept request');
      }
    } finally {
      setIsResponding(null);
    }
  };

  const handleIgnoreRequest = async () => {
    setIsResponding('ignore');
    try {
      await rejectConnection({ senderId: user.id, connectionId });
      if (matchingNotif) {
        dismissNotification(matchingNotif.id);
      }
      showToast('info', 'Request Ignored', `Connection request from ${user.name} has been ignored.`);
    } catch (err: any) {
      showToast('error', 'Notice', err?.message || 'Could not ignore request');
    } finally {
      setIsResponding(null);
    }
  };

  const handleSendConnection = async () => {
    setIsConnecting(true);
    try {
      await sendConnection(user.id);
      showToast('success', 'Request Sent', `Connection request sent to ${user.name}.`);
    } catch (err: any) {
      showToast('error', 'Notice', err?.message || 'Could not send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancelOutgoingRequest = () => {
    setConfirmConfig({
      visible: true,
      title: 'Cancel Connection Request',
      message: `Connection request already sent to ${user.name}. Would you like to cancel it?`,
      confirmLabel: 'Cancel Request',
      cancelLabel: 'Keep Pending',
      destructive: true,
      loading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
          await cancelConnection({ targetUserId: user.id, connectionId });
          setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
          showToast('info', 'Request Cancelled', `Connection request to ${user.name} has been cancelled.`);
        } catch (err: any) {
          setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
          showToast('error', 'Error', err?.message || 'Could not cancel request');
        }
      },
    });
  };

  const handleRemoveConnectionClick = () => {
    setConfirmConfig({
      visible: true,
      title: 'Remove Connection',
      message: `Are you sure you want to remove your connection with ${user.name}?`,
      confirmLabel: 'Yes, Remove',
      cancelLabel: 'Cancel',
      destructive: true,
      loading: false,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
          await removeConnection(user.id, connectionId);
          setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
          showToast('info', 'Connection Removed', `You have removed your connection with ${user.name}.`);
        } catch (err: any) {
          setConfirmConfig(prev => ({ ...prev, visible: false, loading: false }));
          showToast('error', 'Error', err?.message || 'Could not remove connection');
        }
      },
    });
  };

  const renderBottomConnectionButton = () => {
    if (isConnecting) {
      return (
        <View style={[styles.bottomConnBtn, styles.bottomConnBtnDefault]}>
          <ActivityIndicator size="small" color={colors.accentBlue} />
        </View>
      );
    }

    if (status === 'accepted') {
      return (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.bottomConnBtn,
            styles.bottomConnBtnAccepted,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => setShowRemoveMenu(true)}
        >
          <UserCheck color={colors.emerald} size={16} strokeWidth={2.5} />
          <Text style={styles.bottomConnTextAccepted}>Connected</Text>
        </Pressable>
      );
    }

    if (status === 'pending_outgoing') {
      return (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.bottomConnBtn,
            styles.bottomConnBtnPending,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleCancelOutgoingRequest}
        >
          <Clock color={colors.textSecondary} size={16} strokeWidth={2} />
          <Text style={styles.bottomConnTextPending}>Pending</Text>
        </Pressable>
      );
    }

    if (status === 'pending_incoming') {
      return (
        <View style={styles.bottomIncomingRow}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.bottomAcceptBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleAcceptRequest}
            disabled={isResponding !== null}
          >
            {isResponding === 'accept' ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Check color={colors.white} size={15} strokeWidth={2.5} />
                <Text style={styles.bottomAcceptText}>Accept Request</Text>
              </>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.bottomIgnoreBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleIgnoreRequest}
            disabled={isResponding !== null}
          >
            {isResponding === 'ignore' ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <>
                <X color={colors.textSecondary} size={15} strokeWidth={2} />
                <Text style={styles.bottomIgnoreText}>Ignore</Text>
              </>
            )}
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.bottomConnBtn,
          styles.bottomConnBtnDefault,
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleSendConnection}
      >
        <UserPlus color={colors.accentBlue} size={16} strokeWidth={2} />
        <Text style={styles.bottomConnTextDefault}>Connect</Text>
      </Pressable>
    );
  };

  if (!showBusinessCardModal) return null;

  // vCard text payload for QR Code (only includes direct contact when connected)
  const vCardPayload = isConnected
    ? `BEGIN:VCARD\nVERSION:3.0\nN:${user.name}\nFN:${user.name}\nORG:${user.companyName || ''}\nTITLE:${user.designation || ''}\nTEL:${user.contact?.phone || ''}\nEMAIL:${user.contact?.email || ''}\nURL:${user.contact?.website || ''}\nADR:;;${user.contact?.officeAddress || ''}\nNOTE:Bengal Business Council Member (${user.membershipTier || 'Member'})\nEND:VCARD`
    : `BEGIN:VCARD\nVERSION:3.0\nN:${user.name}\nFN:${user.name}\nORG:${user.companyName || ''}\nTITLE:${user.designation || ''}\nURL:${user.contact?.website || ''}\nADR:;;${user.contact?.officeAddress || ''}\nNOTE:Bengal Business Council Member (${user.membershipTier || 'Member'})\nEND:VCARD`;

  const handleCopyVCard = () => {
    if (!isConnected) {
      Alert.alert(
        'Direct Contact Protected',
        `Connect with ${user.name} to view and copy their direct phone number and email address.`
      );
      return;
    }
    Alert.alert(
      'Contact Copied',
      `${user.name}'s business card details have been copied to your clipboard.`
    );
  };

  const handleShareCard = () => {
    Alert.alert(
      'Share Digital Card',
      `Shared link to ${user.name}'s profile: https://bengalbusinesscouncil.com/members/${user.id}`
    );
  };

  const handleRequestPhysicalCard = () => {
    setRequestedPhysicalCard(true);
    Alert.alert(
      'Printed Card Order Placed',
      'Your request for 100 printed visiting cards has been received. Your cards will be delivered to your office within 5 working days.'
    );
  };

  return (
    <Modal
      visible={showBusinessCardModal}
      transparent
      animationType="slide"
      onRequestClose={closeDigitalBusinessCard}
    >
      <View style={styles.overlay}>
        {/* Backdrop Dismiss Area */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeDigitalBusinessCard} />

        <View style={styles.modalSheet}>
          {/* Top Drag Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.badgePill}>
                <Sparkles color={colors.crimson} size={11} />
                <Text style={styles.sheetBadge}>OFFICIAL DIGITAL CARD</Text>
              </View>
              <Text style={styles.sheetTitle}>{isMe ? 'My Business Card' : `${user.name.split(' ')[0]}'s Profile`}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeDigitalBusinessCard} activeOpacity={0.7}>
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          {/* Connection Request Action Banner on Top */}
          {status === 'pending_incoming' && !isMe && (
            <View style={styles.requestBanner}>
              <View style={styles.requestBannerContent}>
                <View style={styles.requestIconBox}>
                  <UserPlus color={colors.accentBlue} size={18} strokeWidth={2.2} />
                </View>
                <View style={styles.requestTextCol}>
                  <Text style={styles.requestBannerTitle}>Connection Request</Text>
                  <Text style={styles.requestBannerSubtitle} numberOfLines={1}>
                    {user.name} wants to connect with you
                  </Text>
                </View>
              </View>

              <View style={styles.requestActionRow}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.acceptRequestBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleAcceptRequest}
                  disabled={isResponding !== null}
                >
                  {isResponding === 'accept' ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Check color={colors.white} size={15} strokeWidth={2.5} />
                      <Text style={styles.acceptRequestBtnText}>Accept</Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.ignoreRequestBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleIgnoreRequest}
                  disabled={isResponding !== null}
                >
                  {isResponding === 'ignore' ? (
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                  ) : (
                    <>
                      <X color={colors.textSecondary} size={15} strokeWidth={2} />
                      <Text style={styles.ignoreRequestBtnText}>Ignore</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {status === 'accepted' && !isMe && (
            <View style={styles.connectedBanner}>
              <UserCheck color={colors.emerald} size={16} strokeWidth={2.5} />
              <Text style={styles.connectedBannerText}>You and {user.name} are connected</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Card Flip Selector Tab */}
            <View style={styles.flipTabRow}>
              <TouchableOpacity
                style={[styles.flipTab, cardSide === 'front' && styles.flipTabActive]}
                onPress={() => setCardSide('front')}
                activeOpacity={0.8}
              >
                <CreditCard color={cardSide === 'front' ? colors.crimson : colors.textSecondary} size={15} />
                <Text style={[styles.flipTabText, cardSide === 'front' && styles.flipTabTextActive]}>
                  Visiting Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.flipTab, cardSide === 'qr' && styles.flipTabActive]}
                onPress={() => setCardSide('qr')}
                activeOpacity={0.8}
              >
                <QrCode color={cardSide === 'qr' ? colors.crimson : colors.textSecondary} size={15} />
                <Text style={[styles.flipTabText, cardSide === 'qr' && styles.flipTabTextActive]}>
                  Scan QR (vCard)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Visiting Card View */}
            {cardSide === 'front' ? (
              <View style={styles.visitingCardContainer}>
                {/* Crest Top Banner */}
                <View style={styles.cardTopBanner}>
                  <View style={styles.crestRow}>
                    <View style={styles.crestBadge}>
                      <Text style={styles.crestBadgeText}>BBC</Text>
                    </View>
                    <View>
                      <Text style={styles.councilName}>BENGAL BUSINESS COUNCIL</Text>
                      <Text style={styles.councilMotto}>Executive Council Member</Text>
                    </View>
                  </View>
                  <View style={styles.tierPill}>
                    <Text style={styles.tierPillText}>{user.membershipTier}</Text>
                  </View>
                </View>

                {/* Member Details */}
                <View style={styles.cardMainContent}>
                  <View style={styles.memberPhotoRow}>
                    <InitialsAvatar
                      name={user.name}
                      uri={user.avatar || undefined}
                      size={54}
                      style={styles.cardAvatar}
                    />
                    <View style={styles.memberInfoCol}>
                      <View style={styles.verifiedRow}>
                        <Text style={styles.cardMemberName}>{user.name}</Text>
                        {user.isGstVerified && <ShieldCheck color={colors.emerald} size={16} />}
                      </View>
                      <Text style={styles.cardDesignation}>{user.designation || 'Member'}</Text>
                      {user.companyName ? (
                        <Text style={styles.cardCompany}>{user.companyName}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Business Specifications */}
                  <View style={styles.cardMetaGrid}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>INDUSTRY</Text>
                      <Text style={styles.metaValue} numberOfLines={1}>{user.industry || 'General'}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>GSTIN {user.isGstVerified ? '(VERIFIED)' : ''}</Text>
                      <Text style={styles.metaValueGst}>{user.gstNumber || 'Not provided'}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>ANNUAL TURNOVER</Text>
                      <Text style={styles.metaValue}>{user.turnover || 'Not disclosed'}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>CHAPTER</Text>
                      <Text style={styles.metaValue}>{user.chapter}</Text>
                    </View>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  {isConnected ? (
                    <Text style={styles.cardFooterContact}>
                      {[user.contact?.email, user.contact?.phone].filter(Boolean).join(' • ') || 'Bengal Business Council Verified Member'}
                    </Text>
                  ) : (
                    <View style={styles.cardFooterBlurredContainer}>
                      <View style={styles.cardFooterBlurredTextWrap}>
                        <Text style={[styles.cardFooterContact, styles.cardFooterBlurredText]}>
                          {maskEmail(user.contact?.email)} • {maskPhone(user.contact?.phone)}
                        </Text>
                        {Platform.OS !== 'web' && (
                          <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
                        )}
                      </View>
                      <View style={styles.cardFooterLockPill}>
                        <Lock color={colors.accentBlue} size={10} strokeWidth={2.2} />
                        <Text style={styles.cardFooterLockText}>Connect to unlock contact</Text>
                      </View>
                    </View>
                  )}
                  <Text style={styles.cardFooterSub}>Member Since {user.yearJoined}</Text>
                </View>
              </View>
            ) : (
              /* QR Code Side */
              <View style={styles.qrContainer}>
                <View style={styles.qrWhiteBox}>
                  <QRCode
                    value={vCardPayload}
                    size={width * 0.45}
                    color="#0B192C"
                    backgroundColor="#FFFFFF"
                  />
                  {!isConnected && (
                    <View style={styles.qrLockOverlay}>
                      {Platform.OS !== 'web' ? (
                        <BlurView intensity={45} tint="light" style={StyleSheet.absoluteFill} />
                      ) : (
                        <View style={styles.qrWebBlur} />
                      )}
                      <View style={styles.qrLockCenter}>
                        <View style={styles.qrLockIconBox}>
                          <Lock color={colors.white} size={22} />
                        </View>
                        <Text style={styles.qrLockTitle}>vCard Locked</Text>
                        <Text style={styles.qrLockSubtitle}>Connect with {user.name} to unlock full vCard QR</Text>
                      </View>
                    </View>
                  )}
                </View>
                <Text style={styles.qrHelpText}>
                  {isConnected
                    ? `Point any phone camera to scan and automatically add ${user.name} to your address book.`
                    : `Connect with ${user.name} to unlock their full vCard QR code.`}
                </Text>
              </View>
            )}

            {/* Business Contact Details Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsCardHeader}>BUSINESS CONTACT DETAILS</Text>

              {user.companyName ? (
                <View style={styles.contactRow}>
                  <Building2 color={colors.primary} size={15} />
                  <Text style={styles.contactText}>{user.companyName}</Text>
                </View>
              ) : null}

              {/* Email Row */}
              <View style={styles.contactRow}>
                <Mail color={colors.textSecondary} size={15} />
                {isConnected ? (
                  <Text style={styles.contactText}>{user.contact?.email || '—'}</Text>
                ) : (
                  <View style={styles.blurredContactRow}>
                    <View style={styles.blurredFieldWrapper}>
                      <Text style={[styles.contactText, styles.blurredFieldText]}>
                        {maskEmail(user.contact?.email)}
                      </Text>
                      {Platform.OS !== 'web' && (
                        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
                      )}
                    </View>
                    <View style={styles.lockBadge}>
                      <Lock color={colors.accentBlue} size={11} strokeWidth={2.2} />
                      <Text style={styles.lockBadgeText}>Connect to view</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Phone Row */}
              <View style={styles.contactRow}>
                <Phone color={colors.textSecondary} size={15} />
                {isConnected ? (
                  <Text style={styles.contactText}>{user.contact?.phone || '—'}</Text>
                ) : (
                  <View style={styles.blurredContactRow}>
                    <View style={styles.blurredFieldWrapper}>
                      <Text style={[styles.contactText, styles.blurredFieldText]}>
                        {maskPhone(user.contact?.phone)}
                      </Text>
                      {Platform.OS !== 'web' && (
                        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
                      )}
                    </View>
                    <View style={styles.lockBadge}>
                      <Lock color={colors.accentBlue} size={11} strokeWidth={2.2} />
                      <Text style={styles.lockBadgeText}>Connect to view</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.contactRow}>
                <Globe color={colors.textSecondary} size={15} />
                <Text style={styles.contactText}>{user.contact?.website || '—'}</Text>
              </View>

              <View style={styles.contactRow}>
                <MapPin color={colors.textSecondary} size={15} />
                <Text style={styles.contactText}>{user.contact?.officeAddress || '—'}</Text>
              </View>
            </View>

            {/* Requirement Documents / Brochures */}
            {user.requirementDocs && user.requirementDocs.length > 0 && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsCardHeader}>COMPANY BROCHURES & DOCUMENTS</Text>
                {user.requirementDocs.map((doc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.docItemRow}
                    onPress={() => {
                      if (doc.publicLink) {
                        Linking.openURL(doc.publicLink).catch(() => {
                          Alert.alert('Error', 'Could not open document link.');
                        });
                      } else {
                        Alert.alert('View Document', `Opening ${doc.title}`);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <FileText color={colors.crimson} size={18} />
                    <View style={styles.docItemInfo}>
                      <Text style={styles.docItemTitle} numberOfLines={1}>{doc.title}</Text>
                      <Text style={styles.docItemMeta}>{doc.type || 'Document'} {doc.size ? `• ${doc.size}` : ''}</Text>
                    </View>
                    <Download color={colors.accentBlue} size={16} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {/* If viewing another member (!isMe), show connection button as top action */}
              {!isMe && (
                <View style={styles.bottomConnectionWrapper}>
                  {renderBottomConnectionButton()}
                </View>
              )}

              {/* Request Physical Card if Me */}
              {isMe ? (
                <TouchableOpacity
                  style={[styles.primaryActionBtn, requestedPhysicalCard && styles.btnSuccess]}
                  onPress={handleRequestPhysicalCard}
                  disabled={requestedPhysicalCard}
                  activeOpacity={0.8}
                >
                  {requestedPhysicalCard ? (
                    <View style={styles.btnRowInner}>
                      <CheckCircle2 color={colors.white} size={18} />
                      <Text style={styles.primaryBtnText}>Visiting Card Order Placed</Text>
                    </View>
                  ) : (
                    <View style={styles.btnRowInner}>
                      <CreditCard color={colors.white} size={18} />
                      <Text style={styles.primaryBtnText}>Order Printed Visiting Cards</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.twoBtnRow}>
                  <TouchableOpacity
                    style={styles.primaryActionBtnHalf}
                    onPress={() => {
                      closeDigitalBusinessCard();
                      openLogOneToOne(user);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryBtnText}>Schedule 1-to-1</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.blueActionBtnHalf}
                    onPress={() => {
                      closeDigitalBusinessCard();
                      openGiveReferral(user);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.blueBtnText}>Give Referral</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.twoBtnRow}>
                <TouchableOpacity style={styles.secondaryActionBtn} onPress={handleCopyVCard} activeOpacity={0.8}>
                  <Copy color={colors.primary} size={16} />
                  <Text style={styles.secondaryBtnText}>Copy Contact</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryActionBtn} onPress={handleShareCard} activeOpacity={0.8}>
                  <Share2 color={colors.primary} size={16} />
                  <Text style={styles.secondaryBtnText}>Share Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Popup Menu for Connected Member */}
          <Modal
            visible={showRemoveMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRemoveMenu(false)}
          >
            <Pressable
              style={styles.menuOverlay}
              onPress={() => setShowRemoveMenu(false)}
            >
              <Pressable
                style={styles.menuContainer}
                onPress={(e) => e.stopPropagation?.()}
              >
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle} numberOfLines={1}>
                    {user?.name}
                  </Text>
                  <Text style={styles.menuSubtitle} numberOfLines={1}>
                    {user?.companyName || 'Council Member'}
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
                    setShowRemoveMenu(false);
                    handleRemoveConnectionClick();
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
                  onPress={() => setShowRemoveMenu(false)}
                >
                  <Text style={styles.menuCancelText}>Cancel</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>

          {/* Confirmation Dialog */}
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

          <PremiumToast
            visible={toast.visible}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 25, 44, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalSheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    maxHeight: '92%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  requestBanner: {
    backgroundColor: colors.cardBgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  requestBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentBlueLight,
    borderWidth: 1,
    borderColor: colors.accentBlueBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestTextCol: {
    flex: 1,
  },
  requestBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  requestBannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  requestActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptRequestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
  },
  acceptRequestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  ignoreRequestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
  },
  ignoreRequestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  connectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emeraldLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.emeraldBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  connectedBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.emerald,
  },
  cardFooterBlurredContainer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cardFooterBlurredTextWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(226, 232, 240, 0.45)',
  },
  cardFooterBlurredText: {
    color: 'transparent',
    textShadowColor: 'rgba(71, 85, 105, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1.2,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(6px)',
          userSelect: 'none',
          pointerEvents: 'none',
        } as any)
      : {}),
  },
  cardFooterLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentBlueBorder,
  },
  cardFooterLockText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.accentBlueDark,
  },
  blurredContactRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  blurredFieldWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(226, 232, 240, 0.45)',
  },
  blurredFieldText: {
    color: 'transparent',
    textShadowColor: 'rgba(71, 85, 105, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 2,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(6px)',
          userSelect: 'none',
          pointerEvents: 'none',
        } as any)
      : {}),
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accentBlueBorder,
  },
  lockBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.accentBlueDark,
  },
  qrLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  qrWebBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(8px)',
        } as any)
      : {}),
  },
  qrLockCenter: {
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  qrLockIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  qrLockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  qrLockSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 180,
  },
  sheetHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleGroup: {
    flex: 1,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.crimsonLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  sheetBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
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
  },
  scrollBody: {
    padding: 16,
  },
  flipTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  flipTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  flipTabActive: {
    backgroundColor: colors.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  flipTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  flipTabTextActive: {
    color: colors.crimson,
    fontWeight: '800',
  },
  visitingCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTopBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crestBadge: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  crestBadgeText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  councilName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  councilMotto: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tierPill: {
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
  },
  cardMainContent: {
    paddingVertical: 4,
  },
  memberPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: colors.crimson,
    backgroundColor: colors.cardBgElevated,
  },
  memberInfoCol: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardMemberName: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardDesignation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  cardCompany: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  metaItem: {
    width: '50%',
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 11.5,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  metaValueGst: {
    fontSize: 11,
    color: colors.accentBlue,
    fontWeight: '800',
    marginTop: 2,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterContact: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardFooterSub: {
    fontSize: 9.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  qrWhiteBox: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  qrHelpText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  detailsCardHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 12.5,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  docItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  docItemMeta: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 6,
    gap: 10,
  },
  twoBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  primaryActionBtn: {
    backgroundColor: colors.crimson,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryActionBtnHalf: {
    flex: 1,
    backgroundColor: colors.crimson,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  blueActionBtnHalf: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnSuccess: {
    backgroundColor: colors.emerald,
    shadowColor: colors.emerald,
  },
  btnRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '800',
  },
  blueBtnText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '800',
  },
  bottomConnectionWrapper: {
    marginBottom: 10,
  },
  bottomConnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
  },
  bottomConnBtnDefault: {
    backgroundColor: colors.accentBlueLight,
    borderColor: colors.accentBlueBorder,
  },
  bottomConnTextDefault: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accentBlueDark,
  },
  bottomConnBtnAccepted: {
    backgroundColor: colors.emeraldLight,
    borderColor: colors.emeraldBorder,
  },
  bottomConnTextAccepted: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.emerald,
  },
  bottomConnBtnPending: {
    backgroundColor: colors.cardBgElevated,
    borderColor: colors.cardBorder,
  },
  bottomConnTextPending: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  bottomIncomingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bottomAcceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    borderRadius: 14,
    paddingVertical: 13,
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
  },
  bottomAcceptText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.white,
  },
  bottomIgnoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
  },
  bottomIgnoreText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textSecondary,
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
