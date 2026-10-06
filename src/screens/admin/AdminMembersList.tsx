import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  UserPlus,
  ChevronRight,
  Check,
  CircleCheck,
  Circle,
  Trash2,
  X,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { AdminMember, memberFullName } from '../../services/adminApi';

interface Props {
  members: AdminMember[];
  /** Backend _id of the signed-in admin — excluded from bulk selection. */
  currentUserId?: string;
  onAdd: () => void;
  onEdit: (member: AdminMember) => void;
  /** Resolves true when the members were actually deleted (so selection can reset). */
  onBulkDelete: (ids: string[]) => Promise<boolean>;
}

export const AdminMembersList: React.FC<Props> = ({
  members,
  currentUserId,
  onAdd,
  onEdit,
  onBulkDelete,
}) => {
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => {
      const roleNames = (m.roles ?? []).map(r => r.name).join(' ');
      return (
        memberFullName(m).toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        roleNames.toLowerCase().includes(q)
      );
    });
  }, [members, query]);

  const selectableIds = useMemo(
    () => filtered.filter(m => m._id !== currentUserId).map(m => m._id),
    [filtered, currentUserId]
  );
  const allSelected = selectableIds.length > 0 && selectableIds.every(id => selected.has(id));

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(selectableIds));
  };

  const enterSelectWith = (id: string) => {
    setSelectMode(true);
    setSelected(new Set([id]));
  };

  const handleRowPress = (member: AdminMember) => {
    if (!selectMode) return onEdit(member);
    if (member._id === currentUserId) return;
    toggle(member._id);
  };

  const runBulkDelete = async () => {
    if (selected.size === 0 || deleting) return;
    setDeleting(true);
    try {
      const ok = await onBulkDelete([...selected]);
      if (ok) exitSelectMode();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      {selectMode ? (
        <View style={styles.selectBar}>
          <TouchableOpacity style={styles.selectBarBtn} onPress={exitSelectMode}>
            <X color={colors.textSecondary} size={16} />
            <Text style={styles.selectBarBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectCount}>{selected.size} selected</Text>
          <TouchableOpacity style={styles.selectBarBtn} onPress={toggleAll}>
            <Text style={styles.selectBarBtnText}>
              {allSelected ? 'Clear all' : 'Select all'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Search color={colors.textMuted} size={16} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search members, email or role"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={styles.selectToggle}
            onPress={() => setSelectMode(true)}
            activeOpacity={0.8}
          >
            <Check color={colors.textSecondary} size={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.85}>
            <UserPlus color={colors.white} size={16} />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.countText}>
        {filtered.length} of {members.length} members
      </Text>

      <View style={styles.list}>
        {filtered.map(member => {
          const initials = memberFullName(member)
            .split(' ')
            .map(p => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          const active = member.isActive ?? true;
          const isSelf = member._id === currentUserId;
          const isChecked = selected.has(member._id);
          return (
            <TouchableOpacity
              key={member._id}
              style={[styles.row, isChecked && styles.rowSelected]}
              onPress={() => handleRowPress(member)}
              onLongPress={() => !selectMode && !isSelf && enterSelectWith(member._id)}
              activeOpacity={0.7}
            >
              {selectMode ? (
                <View style={styles.checkWrap}>
                  {isSelf ? (
                    <Circle color={colors.cardBorderDarker} size={22} />
                  ) : isChecked ? (
                    <CircleCheck color={colors.crimson} size={22} />
                  ) : (
                    <Circle color={colors.cardBorderDarker} size={22} />
                  )}
                </View>
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials || '?'}</Text>
                  <View
                    style={[styles.statusDot, active ? styles.dotActive : styles.dotInactive]}
                  />
                </View>
              )}

              <View style={styles.rowMain}>
                <Text style={styles.name} numberOfLines={1}>
                  {memberFullName(member)}
                  {isSelf && <Text style={styles.youTag}>  (you)</Text>}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {member.email}
                </Text>
                <View style={styles.chipRow}>
                  {(member.roles ?? []).map(r => (
                    <View key={r._id} style={styles.roleChip}>
                      <Text style={styles.roleChipText}>{r.name}</Text>
                    </View>
                  ))}
                  {!member.isEmailVerified && (
                    <View style={[styles.roleChip, styles.unverifiedChip]}>
                      <Text style={[styles.roleChipText, styles.unverifiedText]}>unverified</Text>
                    </View>
                  )}
                </View>
              </View>

              {!selectMode && <ChevronRight color={colors.textMuted} size={16} />}
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No members match “{query}”.</Text>
        )}
      </View>

      {selectMode && (
        <TouchableOpacity
          style={[
            styles.deleteBar,
            (selected.size === 0 || deleting) && styles.deleteBarDisabled,
          ]}
          onPress={runBulkDelete}
          disabled={selected.size === 0 || deleting}
          activeOpacity={0.85}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Trash2 color={colors.white} size={16} />
              <Text style={styles.deleteBarText}>
                Delete {selected.size > 0 ? selected.size : ''}{' '}
                {selected.size === 1 ? 'member' : 'members'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  toolbar: { flexDirection: 'row', gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13.5, color: colors.textPrimary },
  selectToggle: {
    width: 44,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 44,
    backgroundColor: colors.crimson,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBarBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  selectBarBtnText: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary },
  selectCount: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 8,
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
  rowSelected: { borderColor: colors.crimson, backgroundColor: colors.crimsonGlow },
  checkWrap: { width: 42, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  statusDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.cardBg,
  },
  dotActive: { backgroundColor: colors.emerald },
  dotInactive: { backgroundColor: colors.textMuted },
  rowMain: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  youTag: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  email: { fontSize: 12, color: colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  roleChip: {
    backgroundColor: colors.crimsonLight,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.crimsonDark,
    textTransform: 'capitalize',
  },
  unverifiedChip: { backgroundColor: colors.amberLight },
  unverifiedText: { color: colors.amberAccent },
  emptyText: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  deleteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
  },
  deleteBarDisabled: { opacity: 0.5 },
  deleteBarText: { color: colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
});
