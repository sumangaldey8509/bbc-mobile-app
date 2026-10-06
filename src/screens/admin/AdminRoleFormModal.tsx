import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Shield, Plus, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Role, RolePayload } from '../../services/adminApi';

interface Props {
  visible: boolean;
  role: Role | null; // null => create mode
  submitting: boolean;
  onClose: () => void;
  onCreate: (payload: RolePayload) => void;
  onUpdate: (id: string, payload: RolePayload) => void;
  onDelete: (role: Role) => void;
}

const NAME_RE = /^[a-zA-Z0-9 _-]+$/;

export const AdminRoleFormModal: React.FC<Props> = ({
  visible,
  role,
  submitting,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const isEdit = !!role;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permInput, setPermInput] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setPermInput('');
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setPermissions(role.permissions);
      setIsActive(role.isActive);
    } else {
      setName('');
      setDescription('');
      setPermissions([]);
      setIsActive(true);
    }
  }, [visible, role]);

  const title = useMemo(
    () => (isEdit ? `Edit “${role?.name}” role` : 'New Role'),
    [isEdit, role]
  );

  const addPermission = (raw?: string) => {
    const value = (raw ?? permInput).trim().toLowerCase();
    if (!value) return;
    setPermissions(prev => (prev.includes(value) ? prev : [...prev, value]));
    setPermInput('');
  };

  const removePermission = (p: string) => {
    setPermissions(prev => prev.filter(x => x !== p));
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return setError('Role name must be at least 2 characters.');
    if (!NAME_RE.test(trimmed)) {
      return setError('Role name may only contain letters, numbers, spaces, hyphens and underscores.');
    }

    const pending = permInput.trim().toLowerCase();
    const finalPerms =
      pending && !permissions.includes(pending) ? [...permissions, pending] : permissions;

    const payload: RolePayload = {
      name: trimmed,
      description: description.trim(),
      permissions: finalPerms,
      isActive,
    };

    if (isEdit) onUpdate(role!.id, payload);
    else onCreate(payload);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Shield color={colors.crimson} size={18} />
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color={colors.textPrimary} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>ROLE NAME</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  placeholder="e.g. chapter-head"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder="What this role is for"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>PERMISSIONS</Text>
                <View style={styles.permInputRow}>
                  <TextInput
                    style={[styles.input, styles.permInput]}
                    value={permInput}
                    onChangeText={text => {
                      if (text.endsWith(',')) addPermission(text.slice(0, -1));
                      else setPermInput(text);
                    }}
                    onSubmitEditing={() => addPermission()}
                    autoCapitalize="none"
                    placeholder="e.g. manage_members"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.permAddBtn} onPress={() => addPermission()}>
                    <Plus color={colors.white} size={16} />
                  </TouchableOpacity>
                </View>

                {permissions.length > 0 && (
                  <View style={styles.permWrap}>
                    {permissions.map(p => (
                      <TouchableOpacity
                        key={p}
                        style={styles.permChip}
                        onPress={() => removePermission(p)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.permChipText}>{p}</Text>
                        <X color={colors.textSecondary} size={12} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <Text style={styles.hint}>Tap a permission to remove it. Comma or Return adds one.</Text>
              </View>

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setIsActive(v => !v)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.toggleLabel}>Active</Text>
                  <Text style={styles.hint}>Inactive roles stay assigned but are hidden from pickers later.</Text>
                </View>
                <View style={[styles.switch, isActive && styles.switchOn]}>
                  <View style={[styles.knob, isActive && styles.knobOn]} />
                </View>
              </TouchableOpacity>

              {isEdit && role && role.memberCount > 0 && (
                <Text style={styles.hint}>
                  This role is assigned to {role.memberCount}{' '}
                  {role.memberCount === 1 ? 'member' : 'members'} and can&apos;t be deleted until they
                  are reassigned.
                </Text>
              )}
            </ScrollView>

            <View style={styles.footer}>
              {isEdit && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDelete(role as Role)}
                  disabled={submitting}
                >
                  <Trash2 color={colors.crimson} size={16} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitText}>{isEdit ? 'Save Role' : 'Create Role'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 18, gap: 16 },
  field: { gap: 6 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 14,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  permInputRow: { flexDirection: 'row', gap: 8 },
  permInput: { flex: 1 },
  permAddBtn: {
    width: 44,
    borderRadius: 10,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  permChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorderDarker,
    backgroundColor: colors.cardBgElevated,
  },
  permChipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  hint: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },
  errorBox: {
    backgroundColor: colors.crimsonLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
  },
  errorText: { color: colors.crimsonDark, fontSize: 12, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  toggleLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  switch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.cardBorderDarker,
    padding: 3,
  },
  switchOn: { backgroundColor: colors.emerald },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  knobOn: { alignSelf: 'flex-end' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  deleteBtn: {
    width: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    backgroundColor: colors.crimsonLight,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
});
