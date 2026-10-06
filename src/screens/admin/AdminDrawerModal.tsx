import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  X,
  LayoutDashboard,
  Users,
  Shield,
  TriangleAlert,
  ChevronRight,
  IdCard,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';

type IconComponent = React.ComponentType<{ color?: string; size?: number }>;

const { width } = Dimensions.get('window');

export type AdminSection = 'overview' | 'members' | 'roles' | 'pending' | 'profiles';

interface AdminModuleMeta {
  key: AdminSection;
  label: string;
  sublabel: string;
  icon: IconComponent;
  color: string;
  bg: string;
}

export const ADMIN_SECTIONS: AdminModuleMeta[] = [
  {
    key: 'overview',
    label: 'Overview',
    sublabel: 'Council metrics & role breakdown',
    icon: LayoutDashboard,
    color: colors.accentBlue,
    bg: colors.accentBlueLight,
  },
  {
    key: 'members',
    label: 'Members',
    sublabel: 'Directory, create & manage members',
    icon: Users,
    color: colors.crimson,
    bg: colors.crimsonLight,
  },
  {
    key: 'roles',
    label: 'Roles & Permissions',
    sublabel: 'Access levels across the council',
    icon: Shield,
    color: colors.purpleAccent,
    bg: colors.purpleLight,
  },
  {
    key: 'profiles',
    label: 'Profile Reviews',
    sublabel: 'Approve, reject or review submitted profiles',
    icon: IdCard,
    color: colors.emerald,
    bg: colors.emeraldLight,
  },
  {
    key: 'pending',
    label: 'Pending Verifications',
    sublabel: 'Members with unverified email',
    icon: TriangleAlert,
    color: colors.amberAccent,
    bg: colors.amberLight,
  },
];

export const adminSectionLabel = (key: AdminSection): string =>
  ADMIN_SECTIONS.find(s => s.key === key)?.label ?? 'Admin Console';

interface Props {
  visible: boolean;
  activeSection: AdminSection;
  counts?: Partial<Record<AdminSection, number>>;
  onSelect: (section: AdminSection) => void;
  onClose: () => void;
}

export const AdminDrawerModal: React.FC<Props> = ({
  visible,
  activeSection,
  counts,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerBadge}>ADMIN MODULES</Text>
              <Text style={styles.headerTitle}>Admin Console</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {ADMIN_SECTIONS.map(item => {
              const Icon = item.icon;
              const active = item.key === activeSection;
              const count = counts?.[item.key];
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.item, active && styles.itemActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item.key);
                    onClose();
                  }}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                    <Icon color={item.color} size={18} />
                  </View>
                  <View style={styles.textCol}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.label, active && styles.labelActive]}>
                        {item.label}
                      </Text>
                      {typeof count === 'number' && count > 0 && (
                        <View style={styles.countPill}>
                          <Text style={styles.countText}>{count}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sublabel}>{item.sublabel}</Text>
                  </View>
                  <ChevronRight color={colors.textMuted} size={16} />
                </TouchableOpacity>
              );
            })}

            <Text style={styles.footnote}>
              More admin modules will appear here as they are added.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: Math.min(width * 0.84, 360),
    height: '100%',
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 30,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.cardBgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1.2,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  list: { padding: 14, gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  itemActive: {
    borderColor: colors.crimsonBorder,
    backgroundColor: colors.crimsonGlow,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  labelActive: { color: colors.crimson },
  sublabel: { fontSize: 11.5, color: colors.textSecondary },
  countPill: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: colors.crimson,
    alignItems: 'center',
  },
  countText: { color: colors.white, fontSize: 10.5, fontWeight: '800' },
  footnote: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 10,
    lineHeight: 15,
  },
});
