import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { AdminProfileReview } from '../../services/profileApi';
import { ProfileStatus } from '../../types';
import { InitialsAvatar } from '../../components/InitialsAvatar';

interface Props {
  reviews: AdminProfileReview[];
  onOpen: (userId: string) => void;
}

const STATUS_META: Record<ProfileStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: colors.textMuted, bg: colors.cardBgElevated },
  submitted: { label: 'Submitted', color: colors.accentBlue, bg: colors.accentBlueLight },
  under_review: { label: 'Under Review', color: colors.amberAccent, bg: colors.amberLight },
  approved: { label: 'Approved', color: colors.emerald, bg: colors.emeraldLight },
  rejected: { label: 'Rejected', color: colors.crimson, bg: colors.crimsonLight },
};

const FILTERS: { key: string; label: string; match: (s: ProfileStatus) => boolean }[] = [
  { key: 'pending', label: 'Pending', match: s => s === 'submitted' || s === 'under_review' },
  { key: 'approved', label: 'Approved', match: s => s === 'approved' },
  { key: 'rejected', label: 'Rejected', match: s => s === 'rejected' },
  { key: 'all', label: 'All', match: () => true },
];

export const AdminProfileReviews: React.FC<Props> = ({ reviews, onOpen }) => {
  const [filter, setFilter] = useState('pending');

  const filtered = useMemo(() => {
    const f = FILTERS.find(x => x.key === filter)!;
    return reviews.filter(r => f.match(r.status));
  }, [reviews, filter]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          const count = reviews.filter(r => f.match(r.status)).length;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label} {count > 0 ? `(${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.list}>
        {filtered.map(r => {
          const meta = STATUS_META[r.status];
          const name =
            `${r.userId?.firstName ?? ''} ${r.userId?.lastName ?? ''}`.trim() ||
            r.userId?.email ||
            'Member';
          return (
            <TouchableOpacity
              key={r._id ?? r.userId?._id}
              style={styles.row}
              onPress={() => onOpen(r.userId._id)}
              activeOpacity={0.7}
            >
              <InitialsAvatar name={name} uri={r.avatar || undefined} size={40} />
              <View style={styles.main}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.company} numberOfLines={1}>
                  {r.companyName || r.userId?.email}
                </Text>
                <View style={styles.metaRow}>
                  <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                  {r.submittedAt && (
                    <Text style={styles.date}>
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </Text>
                  )}
                  {typeof r.completion?.percent === 'number' && (
                    <Text style={styles.date}>· {r.completion.percent}%</Text>
                  )}
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={16} />
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No profiles in this view.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  company: { fontSize: 12, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 9.5, fontWeight: '800' },
  date: { fontSize: 10.5, color: colors.textMuted },
  empty: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
});
