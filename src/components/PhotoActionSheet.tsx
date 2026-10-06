import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Eye, RefreshCw, Trash2, X } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  title: string;
  onView: () => void;
  onChange: () => void;
  onRemove: () => void;
  onClose: () => void;
}

/** Bottom-sheet menu shown when a member taps an existing photo. */
export const PhotoActionSheet: React.FC<Props> = ({
  visible,
  title,
  onView,
  onChange,
  onRemove,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color={colors.textPrimary} size={16} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.row} onPress={onView} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: colors.accentBlueLight }]}>
            <Eye color={colors.accentBlue} size={17} />
          </View>
          <Text style={styles.rowText}>View photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={onChange} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: colors.crimsonLight }]}>
            <RefreshCw color={colors.crimson} size={17} />
          </View>
          <Text style={styles.rowText}>Change photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={onRemove} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: colors.crimsonLight }]}>
            <Trash2 color={colors.crimson} size={17} />
          </View>
          <Text style={[styles.rowText, { color: colors.crimson }]}>Remove photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 28,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  title: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});
