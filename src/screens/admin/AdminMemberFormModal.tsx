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
import { X, Check, UserPlus, Save, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import {
  AdminMember,
  Role,
  CreateMemberPayload,
  UpdateMemberPayload,
  memberFullName,
} from '../../services/adminApi';

interface Props {
  visible: boolean;
  member: AdminMember | null; // null => create mode
  roles: Role[];
  submitting: boolean;
  onClose: () => void;
  onCreate: (payload: CreateMemberPayload) => void;
  onUpdate: (id: string, payload: UpdateMemberPayload) => void;
  onDelete: (member: AdminMember) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AdminMemberFormModal: React.FC<Props> = ({
  visible,
  member,
  roles,
  submitting,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const isEdit = !!member;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    if (member) {
      setFirstName(member.firstName ?? '');
      setLastName(member.lastName ?? '');
      setEmail(member.email ?? '');
      setPassword('');
      setCountryCode(member.countryCode ?? '+91');
      setPhoneNumber(member.phoneNumber ?? '');
      setSelectedRoleIds((member.roles ?? []).map(r => r._id));
      setIsActive(member.isActive ?? true);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setCountryCode('+91');
      setPhoneNumber('');
      setSelectedRoleIds([]);
      setIsActive(true);
    }
  }, [visible, member]);

  const title = useMemo(
    () => (isEdit ? `Edit ${memberFullName(member as AdminMember)}` : 'Add New Member'),
    [isEdit, member]
  );

  const toggleRole = (id: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (firstName.trim().length < 2) return setError('First name must be at least 2 characters.');
    if (lastName.trim().length < 1) return setError('Last name is required.');

    if (isEdit) {
      onUpdate(member!._id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        countryCode: countryCode.trim() || '+91',
        phoneNumber: phoneNumber.trim() || null,
        roles: selectedRoleIds,
        isActive,
      });
      return;
    }

    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Temporary password must be at least 6 characters.');

    onCreate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      countryCode: countryCode.trim() || '+91',
      phoneNumber: phoneNumber.trim() || null,
      roles: selectedRoleIds,
    });
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
                {isEdit ? (
                  <Save color={colors.crimson} size={18} />
                ) : (
                  <UserPlus color={colors.crimson} size={18} />
                )}
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

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>FIRST NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Ananya"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>LAST NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Roy"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>EMAIL {isEdit && '(read-only)'}</Text>
                <TextInput
                  style={[styles.input, isEdit && styles.inputDisabled]}
                  value={email}
                  onChangeText={setEmail}
                  editable={!isEdit}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="name@company.com"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {!isEdit && (
                <View style={styles.field}>
                  <Text style={styles.label}>TEMPORARY PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    placeholder="Min. 6 characters"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text style={styles.hint}>
                    Shared with the member for first sign-in. A verification OTP is emailed automatically.
                  </Text>
                </View>
              )}

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldCode]}>
                  <Text style={styles.label}>CODE</Text>
                  <TextInput
                    style={styles.input}
                    value={countryCode}
                    onChangeText={setCountryCode}
                    placeholder="+91"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={[styles.field, styles.fieldPhone]}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNumber ?? ''}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="9830000000"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>ROLES</Text>
                {roles.length === 0 ? (
                  <Text style={styles.hint}>
                    No roles available yet. Roles appear here once the backend exposes them.
                  </Text>
                ) : (
                  <View style={styles.roleWrap}>
                    {roles.map(role => {
                      const active = selectedRoleIds.includes(role.id);
                      return (
                        <TouchableOpacity
                          key={role.id}
                          style={[styles.roleChip, active && styles.roleChipActive]}
                          onPress={() => toggleRole(role.id)}
                          activeOpacity={0.7}
                        >
                          {active && <Check color={colors.white} size={13} />}
                          <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                            {role.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {isEdit && (
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => setIsActive(v => !v)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.toggleLabel}>Account Active</Text>
                    <Text style={styles.hint}>Inactive members cannot sign in.</Text>
                  </View>
                  <View style={[styles.switch, isActive && styles.switchOn]}>
                    <View style={[styles.knob, isActive && styles.knobOn]} />
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.footer}>
              {isEdit && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDelete(member as AdminMember)}
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
                  <Text style={styles.submitText}>
                    {isEdit ? 'Save Changes' : 'Create Member'}
                  </Text>
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
    maxHeight: '100%',
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
  body: { padding: 18, gap: 14 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  field: { gap: 6 },
  fieldHalf: { flex: 1 },
  fieldCode: { flexGrow: 0, flexShrink: 0, flexBasis: 92 },
  fieldPhone: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
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
  inputDisabled: { backgroundColor: colors.cardBgElevated, color: colors.textSecondary },
  hint: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },
  errorBox: {
    backgroundColor: colors.crimsonLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
  },
  errorText: { color: colors.crimsonDark, fontSize: 12, fontWeight: '600' },
  roleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorderDarker,
    backgroundColor: colors.cardBgElevated,
  },
  roleChipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  roleChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'capitalize' },
  roleChipTextActive: { color: colors.white },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
