import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MailCheck, CircleCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { AdminMember, memberFullName } from '../../services/adminApi';

interface Props {
  members: AdminMember[];
  verifyingId: string | null;
  onVerify: (member: AdminMember) => void;
}

export const AdminPendingList: React.FC<Props> = ({ members, verifyingId, onVerify }) => {
  const pending = members.filter(m => !m.isEmailVerified);

  if (pending.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <CircleCheck color={colors.emerald} size={34} />
        <Text style={styles.emptyTitle}>All caught up</Text>
        <Text style={styles.emptyText}>Every member has a verified email address.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{pending.length} awaiting email verification</Text>
      <View style={styles.list}>
        {pending.map(member => {
          const busy = verifyingId === member._id;
          return (
            <View key={member._id} style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {memberFullName(member)}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {member.email}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.verifyBtn, busy && styles.verifyBtnBusy]}
                onPress={() => onVerify(member)}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <MailCheck color={colors.white} size={14} />
                    <Text style={styles.verifyText}>Verify</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <Text style={styles.hint}>
        Marking verified sets the member&apos;s email as confirmed without an OTP.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  count: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  email: { fontSize: 12, color: colors.textSecondary },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.emerald,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 78,
    justifyContent: 'center',
  },
  verifyBtnBusy: { opacity: 0.7 },
  verifyText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 12, lineHeight: 15 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  emptyText: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
});
