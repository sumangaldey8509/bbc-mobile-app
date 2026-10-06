import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
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
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { InitialsAvatar } from './InitialsAvatar';

const { width } = Dimensions.get('window');

export const DigitalBusinessCardModal: React.FC = () => {
  const {
    showBusinessCardModal,
    selectedBusinessCardUser,
    closeDigitalBusinessCard,
    currentUser,
    openLogOneToOne,
    openGiveReferral,
  } = useApp();

  const [cardSide, setCardSide] = useState<'front' | 'qr'>('front');
  const [requestedPhysicalCard, setRequestedPhysicalCard] = useState(false);

  const user = selectedBusinessCardUser || currentUser;
  const isMe = user.id === currentUser.id;

  if (!showBusinessCardModal) return null;

  // vCard text payload for QR Code
  const vCardPayload = `BEGIN:VCARD\nVERSION:3.0\nN:${user.name}\nFN:${user.name}\nORG:${user.companyName || ''}\nTITLE:${user.designation || ''}\nTEL:${user.contact?.phone || ''}\nEMAIL:${user.contact?.email || ''}\nURL:${user.contact?.website || ''}\nADR:;;${user.contact?.officeAddress || ''}\nNOTE:Curated Table Member (${user.membershipTier || 'Member'})\nEND:VCARD`;

  const handleCopyVCard = () => {
    Alert.alert(
      'Contact Copied',
      `${user.name}'s business card details have been copied to your clipboard.`
    );
  };

  const handleShareCard = () => {
    Alert.alert(
      'Share Digital Card',
      `Shared link to ${user.name}'s profile: https://curatedtable.app/members/${user.id}`
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
                      <Text style={styles.crestBadgeText}>CT</Text>
                    </View>
                    <View>
                      <Text style={styles.councilName}>CURATED TABLE</Text>
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
                  <Text style={styles.cardFooterContact}>
                    {[user.contact?.email, user.contact?.phone].filter(Boolean).join(' • ') || 'Curated Table Verified Member'}
                  </Text>
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
                </View>
                <Text style={styles.qrHelpText}>
                  Point any phone camera to scan and automatically add {user.name} to your address book.
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

              <View style={styles.contactRow}>
                <Mail color={colors.textSecondary} size={15} />
                <Text style={styles.contactText}>{user.contact?.email || '—'}</Text>
              </View>

              <View style={styles.contactRow}>
                <Phone color={colors.textSecondary} size={15} />
                <Text style={styles.contactText}>{user.contact?.phone || '—'}</Text>
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
            </View>
          </ScrollView>
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
});
