import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { X, Check, Clock, Ban, FileText, ExternalLink } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { AdminProfileReview, formatTurnover } from '../../services/profileApi';
import { InitialsAvatar } from '../../components/InitialsAvatar';

interface Props {
  visible: boolean;
  review: AdminProfileReview | null;
  submitting: boolean;
  onClose: () => void;
  onDecision: (status: 'approved' | 'rejected' | 'under_review', note: string) => void;
}

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

export const AdminProfileReviewModal: React.FC<Props> = ({
  visible,
  review,
  submitting,
  onClose,
  onDecision,
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) setNote(review?.reviewNote ?? '');
  }, [visible, review]);

  if (!review) return null;

  const name =
    `${review.userId?.firstName ?? ''} ${review.userId?.lastName ?? ''}`.trim() ||
    review.userId?.email;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {review.coverImage ? (
              <Image source={{ uri: review.coverImage }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Text style={styles.coverName} numberOfLines={1}>{name}</Text>
              </View>
            )}
            <View style={styles.identityRow}>
              <InitialsAvatar name={name} uri={review.avatar || undefined} size={48} />
              <View style={styles.flex}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.email}>{review.userId?.email}</Text>
              </View>
              {typeof review.completion?.percent === 'number' && (
                <Text style={styles.pct}>{review.completion.percent}%</Text>
              )}
            </View>

            <Row label="Designation" value={review.designation} />
            <Row label="Company" value={review.companyName} />
            <Row label="Industry" value={(review.industry ?? []).join(', ')} />
            <Row label="Location" value={[review.city, review.state].filter(Boolean).join(', ')} />
            <Row
              label="GST"
              value={
                review.gstNumber
                  ? `${review.gstNumber}${review.isGstVerified ? '  ✓ verified' : ''}`
                  : undefined
              }
            />
            <Row label="Turnover" value={formatTurnover(review.turnover, review.turnoverUnit)} />
            <Row label="Year joined" value={review.yearJoined ?? undefined} />
            <Row label="Website" value={review.website} />
            <Row label="Office address" value={review.officeAddress} />
            <View style={styles.bioBlock}>
              <Text style={styles.rowLabel}>Bio</Text>
              <Text style={styles.bioText}>{review.bio || '—'}</Text>
            </View>

            {(review.requirementDocs ?? []).length > 0 && (
              <View style={styles.docsBlock}>
                <Text style={styles.rowLabel}>Documents</Text>
                {review.requirementDocs.map((d, i) => (
                  <TouchableOpacity
                    key={`${d.publicLink}-${i}`}
                    style={styles.docRow}
                    onPress={() => Linking.openURL(d.publicLink)}
                  >
                    <FileText color={colors.accentBlue} size={15} />
                    <Text style={styles.docText} numberOfLines={1}>{d.title}</Text>
                    <ExternalLink color={colors.textMuted} size={13} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.noteLabel}>REVIEW NOTE (required to reject)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Feedback for the member…"
              placeholderTextColor={colors.textMuted}
              multiline
              editable={!submitting}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actBtn, styles.rejectBtn]}
              onPress={() => onDecision('rejected', note)}
              disabled={submitting}
            >
              <Ban color={colors.crimson} size={15} />
              <Text style={[styles.actText, { color: colors.crimson }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actBtn, styles.reviewBtn]}
              onPress={() => onDecision('under_review', note)}
              disabled={submitting}
            >
              <Clock color={colors.amberAccent} size={15} />
              <Text style={[styles.actText, { color: colors.amberAccent }]}>Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actBtn, styles.approveBtn]}
              onPress={() => onDecision('approved', note)}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Check color={colors.white} size={15} />
                  <Text style={[styles.actText, { color: colors.white }]}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 16, gap: 4 },
  cover: { width: '100%', height: 120, borderRadius: 12, marginBottom: 8 },
  coverPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  coverName: { fontSize: 15, fontWeight: '800', color: colors.white },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  name: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  email: { fontSize: 12, color: colors.textSecondary },
  pct: { fontSize: 15, fontWeight: '800', color: colors.emerald },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, flexShrink: 0 },
  rowValue: { fontSize: 13, color: colors.textPrimary, flex: 1, textAlign: 'right' },
  bioBlock: { paddingVertical: 8, gap: 4 },
  bioText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  docsBlock: { paddingVertical: 8, gap: 6 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  docText: { flex: 1, fontSize: 12.5, color: colors.textPrimary, fontWeight: '600' },
  noteLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    padding: 12,
    fontSize: 13.5,
    color: colors.textPrimary,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  actBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderRadius: 11,
  },
  rejectBtn: { backgroundColor: colors.crimsonLight, borderWidth: 1, borderColor: colors.crimsonBorder },
  reviewBtn: { backgroundColor: colors.amberLight, borderWidth: 1, borderColor: colors.amberBorder },
  approveBtn: { backgroundColor: colors.emerald },
  actText: { fontSize: 12.5, fontWeight: '800' },
});
