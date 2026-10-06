import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users2, BadgeCheck, UserCheck, Shield } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { AdminMember, Role } from '../../services/adminApi';

interface Props {
  members: AdminMember[];
  roles: Role[];
}

export const AdminOverview: React.FC<Props> = ({ members, roles }) => {
  const total = members.length;
  const verified = members.filter(m => m.isEmailVerified).length;
  const active = members.filter(m => m.isActive ?? true).length;

  const stats = [
    { label: 'Total Members', value: total, Icon: Users2, tint: colors.accentBlue, bg: colors.accentBlueLight },
    { label: 'Email Verified', value: verified, Icon: BadgeCheck, tint: colors.emerald, bg: colors.emeraldLight },
    { label: 'Active Accounts', value: active, Icon: UserCheck, tint: colors.purpleAccent, bg: colors.purpleLight },
    { label: 'Roles Defined', value: roles.length, Icon: Shield, tint: colors.crimson, bg: colors.crimsonLight },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <s.Icon color={s.tint} size={18} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>ROLE BREAKDOWN</Text>
      <View style={styles.card}>
        {roles.length === 0 ? (
          <Text style={styles.emptyText}>No roles found across the member base yet.</Text>
        ) : (
          roles.map((role, i) => (
            <View
              key={role.id}
              style={[styles.roleRow, i < roles.length - 1 && styles.roleRowBorder]}
            >
              <View style={styles.roleNameWrap}>
                <Shield color={colors.crimson} size={14} />
                <Text style={styles.roleName}>{role.name}</Text>
              </View>
              <Text style={styles.roleCount}>
                {role.memberCount} {role.memberCount === 1 ? 'member' : 'members'}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 6,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11.5, fontWeight: '600', color: colors.textSecondary },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  roleRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  roleNameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleName: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary, textTransform: 'capitalize' },
  roleCount: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  emptyText: { fontSize: 12.5, color: colors.textMuted, paddingVertical: 16, textAlign: 'center' },
});
