import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { colors } from '../theme/colors';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Cross-platform confirmation dialog.
 *
 * `Alert.alert` is a no-op on react-native-web, so anything that must work in
 * the browser uses this instead. Rendered in a `Modal`, so it can be mounted
 * anywhere in the tree.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={loading ? undefined : onCancel}
        accessibilityLabel="Dismiss dialog"
      />
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={onCancel}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              destructive ? styles.destructiveBtn : styles.confirmBtn,
              loading && styles.btnDisabled,
            ]}
            onPress={onConfirm}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  message: { fontSize: 13.5, color: colors.textSecondary, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelText: { fontSize: 13.5, fontWeight: '700', color: colors.textSecondary },
  confirmBtn: { backgroundColor: colors.primary },
  destructiveBtn: { backgroundColor: colors.crimson },
  btnDisabled: { opacity: 0.6 },
  confirmText: { fontSize: 13.5, fontWeight: '800', color: colors.white },
});
