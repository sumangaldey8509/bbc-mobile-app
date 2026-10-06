import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, Plus, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Role } from '../../services/adminApi';

interface Props {
  roles: Role[];
  onCreate: () => void;
  onEdit: (role: Role) => void;
}

export const AdminRolesList: React.FC<Props> = ({ roles, onCreate, onEdit }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createBtn} onPress={onCreate} activeOpacity={0.85}>
        <Plus color={colors.white} size={16} />
        <Text style={styles.createBtnText}>Create Role</Text>
      </TouchableOpacity>

      <Text style={styles.count}>
        {roles.length} {roles.length === 1 ? 'role' : 'roles'}
      </Text>

      <View style={styles.list}>
        {roles.map(role => (
          <TouchableOpacity
            key={role.id}
            style={styles.card}
            onPress={() => onEdit(role)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.nameWrap}>
                <Shield color={colors.crimson} size={15} />
                <Text style={styles.roleName}>{role.name}</Text>
                {!role.isActive && (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveText}>inactive</Text>
                  </View>
                )}
              </View>
              <View style={styles.rightWrap}>
                <Text style={styles.memberCount}>
                  {role.memberCount} {role.memberCount === 1 ? 'member' : 'members'}
                </Text>
                <ChevronRight color={colors.textMuted} size={16} />
              </View>
            </View>

            {!!role.description && <Text style={styles.description}>{role.description}</Text>}

            {role.permissions.length > 0 ? (
              <View style={styles.permWrap}>
                {role.permissions.map(p => (
                  <View key={p} style={styles.permChip}>
                    <Text style={styles.permChipText}>{p}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.permEmpty}>No permissions set</Text>
            )}
          </TouchableOpacity>
        ))}

        {roles.length === 0 && (
          <Text style={styles.emptyText}>No roles yet — create the first one.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 13,
  },
  createBtnText: { fontSize: 13.5, fontWeight: '800', color: colors.white, letterSpacing: 0.3 },
  count: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  list: { gap: 10 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  roleName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  inactiveBadge: {
    backgroundColor: colors.amberLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  inactiveText: { fontSize: 9.5, fontWeight: '700', color: colors.amberAccent },
  rightWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberCount: { fontSize: 11.5, fontWeight: '600', color: colors.textMuted },
  description: { fontSize: 12.5, color: colors.textSecondary, lineHeight: 17 },
  permWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  permChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  permChipText: { fontSize: 10.5, fontWeight: '600', color: colors.primary },
  permEmpty: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  emptyText: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
});
