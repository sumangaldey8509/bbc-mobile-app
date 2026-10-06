import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ShieldAlert, RotateCw, Menu } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PremiumToast, ToastType } from '../../components/PremiumToast';
import {
  AdminMember,
  Role,
  RolePayload,
  CreateMemberPayload,
  UpdateMemberPayload,
  listMembers,
  createMember,
  updateMember,
  deleteMembers,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  deriveRoles,
  memberFullName,
} from '../../services/adminApi';
import {
  AdminProfileReview,
  listProfileReviewsRequest,
  getProfileForAdminRequest,
  reviewProfileRequest,
} from '../../services/profileApi';
import { AdminOverview } from './AdminOverview';
import { AdminMembersList } from './AdminMembersList';
import { AdminRolesList } from './AdminRolesList';
import { AdminPendingList } from './AdminPendingList';
import { AdminProfileReviews } from './AdminProfileReviews';
import { AdminProfileReviewModal } from './AdminProfileReviewModal';
import { AdminMemberFormModal } from './AdminMemberFormModal';
import { AdminRoleFormModal } from './AdminRoleFormModal';
import { AdminDrawerModal, AdminSection, adminSectionLabel } from './AdminDrawerModal';

export const AdminConsoleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isAdmin, currentUser } = useApp();

  const [section, setSection] = useState<AdminSection>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const [profileReviews, setProfileReviews] = useState<AdminProfileReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<AdminProfileReview | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
  }>({ visible: false, type: 'info', title: '', message: '' });

  const showToast = (type: ToastType, title: string, message: string) =>
    setToast({ visible: true, type, title, message });

  const pendingCount = useMemo(
    () => members.filter(m => !m.isEmailVerified).length,
    [members]
  );
  const pendingReviewCount = useMemo(
    () => profileReviews.filter(r => r.status === 'submitted' || r.status === 'under_review').length,
    [profileReviews]
  );

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [memberData, roleResult, reviewResult] = await Promise.all([
        listMembers(),
        listRoles().catch(() => null), // roles are non-fatal — fall back below
        listProfileReviewsRequest(['submitted', 'under_review', 'approved', 'rejected']).catch(
          () => [] as AdminProfileReview[]
        ),
      ]);
      const nextMembers = Array.isArray(memberData) ? memberData : [];
      setMembers(nextMembers);
      setRoles(roleResult ?? deriveRoles(nextMembers));
      setProfileReviews(Array.isArray(reviewResult) ? reviewResult : []);
    } catch (err: any) {
      setError(err?.message || 'Could not load the Admin Console.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load('initial');
  }, [isAdmin, load]);

  const openCreate = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  const openEdit = (member: AdminMember) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleCreate = async (payload: CreateMemberPayload) => {
    setSubmitting(true);
    try {
      await createMember(payload);
      setFormOpen(false);
      await load('refresh');
      showToast(
        'success',
        'Member Created',
        `${payload.firstName} ${payload.lastName} was added; a verification code was emailed.`
      );
    } catch (err: any) {
      showToast('error', 'Could Not Create Member', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, payload: UpdateMemberPayload) => {
    setSubmitting(true);
    try {
      await updateMember(id, payload);
      setFormOpen(false);
      await load('refresh');
      showToast('success', 'Member Updated', 'Changes were saved.');
    } catch (err: any) {
      showToast('error', 'Could Not Save Changes', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const runDelete = async (ids: string[]): Promise<boolean> => {
    setConfirmLoading(true);
    try {
      const { deletedIds, failed } = await deleteMembers(ids);
      await load('refresh');
      setConfirm(null);
      if (failed.length > 0) {
        showToast(
          'warning',
          'Partially Removed',
          `${deletedIds.length} removed, ${failed.length} failed (${failed[0].message}).`
        );
        return false;
      }
      showToast(
        'success',
        'Members Removed',
        `${deletedIds.length} ${deletedIds.length === 1 ? 'member' : 'members'} removed.`
      );
      return true;
    } catch (err: any) {
      setConfirm(null);
      showToast('error', 'Could Not Remove Members', err?.message || 'Please try again.');
      return false;
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleBulkDelete = (ids: string[]): Promise<boolean> =>
    new Promise(resolve => {
      if (ids.length === 0) return resolve(false);
      const count = ids.length;
      setConfirm({
        title: `Remove ${count} ${count === 1 ? 'member' : 'members'}?`,
        message:
          'The selected accounts will be permanently removed from the council. This cannot be undone.',
        confirmLabel: count === 1 ? 'Remove Member' : 'Remove Members',
        onConfirm: async () => resolve(await runDelete(ids)),
        onCancel: () => {
          setConfirm(null);
          resolve(false);
        },
      });
    });

  const confirmDelete = (member: AdminMember) => {
    setFormOpen(false);
    setConfirm({
      title: 'Remove Member',
      message: `Permanently remove ${memberFullName(member)}? This cannot be undone.`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        void runDelete([member._id]);
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleVerify = async (member: AdminMember) => {
    setVerifyingId(member._id);
    try {
      await updateMember(member._id, { isEmailVerified: true });
      await load('refresh');
      showToast('success', 'Email Verified', `${memberFullName(member)} is now verified.`);
    } catch (err: any) {
      showToast('error', 'Could Not Verify Member', err?.message || 'Please try again.');
    } finally {
      setVerifyingId(null);
    }
  };

  // --- Profile reviews ---
  const openReview = async (userId: string) => {
    try {
      const full = await getProfileForAdminRequest(userId);
      setSelectedReview(full);
      setReviewModalOpen(true);
    } catch (err: any) {
      showToast('error', 'Could Not Open Profile', err?.message || 'Please try again.');
    }
  };

  const handleDecision = async (
    status: 'approved' | 'rejected' | 'under_review',
    note: string
  ) => {
    if (status === 'rejected' && !note.trim()) {
      showToast('warning', 'Reason Required', 'Add a note explaining what needs to change.');
      return;
    }
    if (!selectedReview) return;
    setReviewSubmitting(true);
    try {
      await reviewProfileRequest(selectedReview.userId._id, status, note.trim() || undefined);
      setReviewModalOpen(false);
      setSelectedReview(null);
      await load('refresh');
      showToast('success', 'Profile Updated', `Profile ${status.replace('_', ' ')}.`);
    } catch (err: any) {
      showToast('error', 'Could Not Save Review', err?.message || 'Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // --- Roles ---
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleFormOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormOpen(true);
  };

  const handleCreateRole = async (payload: RolePayload) => {
    setRoleSubmitting(true);
    try {
      await createRole(payload);
      setRoleFormOpen(false);
      await load('refresh');
      showToast('success', 'Role Created', `The “${payload.name}” role is ready to assign.`);
    } catch (err: any) {
      showToast('error', 'Could Not Create Role', err?.message || 'Please try again.');
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleUpdateRole = async (id: string, payload: RolePayload) => {
    setRoleSubmitting(true);
    try {
      await updateRole(id, payload);
      setRoleFormOpen(false);
      await load('refresh');
      showToast('success', 'Role Updated', 'Changes were saved.');
    } catch (err: any) {
      showToast('error', 'Could Not Save Role', err?.message || 'Please try again.');
    } finally {
      setRoleSubmitting(false);
    }
  };

  const runDeleteRole = async (role: Role) => {
    setConfirmLoading(true);
    try {
      await deleteRole(role.id);
      await load('refresh');
      setConfirm(null);
      showToast('success', 'Role Deleted', `The “${role.name}” role was removed.`);
    } catch (err: any) {
      setConfirm(null);
      showToast('error', 'Could Not Delete Role', err?.message || 'Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmDeleteRole = (role: Role) => {
    setRoleFormOpen(false);
    setConfirm({
      title: `Delete “${role.name}” role?`,
      message:
        role.memberCount > 0
          ? `This role is assigned to ${role.memberCount} ${role.memberCount === 1 ? 'member' : 'members'}. Reassign them first — the server will reject the delete otherwise.`
          : 'This role will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete Role',
      onConfirm: () => {
        void runDeleteRole(role);
      },
      onCancel: () => setConfirm(null),
    });
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.deniedWrap}>
          <ShieldAlert color={colors.crimson} size={40} />
          <Text style={styles.deniedTitle}>Admin Access Required</Text>
          <Text style={styles.deniedText}>
            The Admin Console is only available to council administrators.
          </Text>
          <TouchableOpacity style={styles.deniedBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.deniedBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.textPrimary} size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerBadge}>ADMIN CONSOLE</Text>
          <Text style={styles.headerTitle}>{adminSectionLabel(section)}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => load('refresh')}>
            <RotateCw color={colors.textSecondary} size={17} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setDrawerOpen(true)}>
            <Menu color={colors.textPrimary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.crimson} />
          <Text style={styles.loadingText}>Loading Admin Console…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerFill}>
          <Text style={styles.errorTitle}>{error}</Text>
          <Text style={styles.errorHint}>
            Check that the API is reachable at your configured EXPO_PUBLIC_API_URL.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load('initial')}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load('refresh')}
              tintColor={colors.crimson}
              colors={[colors.crimson]}
            />
          }
        >
          {section === 'overview' && <AdminOverview members={members} roles={roles} />}
          {section === 'members' && (
            <AdminMembersList
              members={members}
              currentUserId={currentUser.id}
              onAdd={openCreate}
              onEdit={openEdit}
              onBulkDelete={handleBulkDelete}
            />
          )}
          {section === 'roles' && (
            <AdminRolesList roles={roles} onCreate={openCreateRole} onEdit={openEditRole} />
          )}
          {section === 'pending' && (
            <AdminPendingList
              members={members}
              verifyingId={verifyingId}
              onVerify={handleVerify}
            />
          )}
          {section === 'profiles' && (
            <AdminProfileReviews reviews={profileReviews} onOpen={openReview} />
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <AdminMemberFormModal
        visible={formOpen}
        member={editingMember}
        roles={roles}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={confirmDelete}
      />

      <AdminRoleFormModal
        visible={roleFormOpen}
        role={editingRole}
        submitting={roleSubmitting}
        onClose={() => setRoleFormOpen(false)}
        onCreate={handleCreateRole}
        onUpdate={handleUpdateRole}
        onDelete={confirmDeleteRole}
      />

      <AdminProfileReviewModal
        visible={reviewModalOpen}
        review={selectedReview}
        submitting={reviewSubmitting}
        onClose={() => setReviewModalOpen(false)}
        onDecision={handleDecision}
      />

      <AdminDrawerModal
        visible={drawerOpen}
        activeSection={section}
        counts={{
          members: members.length,
          roles: roles.length,
          profiles: pendingReviewCount,
          pending: pendingCount,
        }}
        onSelect={setSection}
        onClose={() => setDrawerOpen(false)}
      />

      <ConfirmDialog
        visible={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel ?? 'Confirm'}
        destructive
        loading={confirmLoading}
        onConfirm={() => confirm?.onConfirm()}
        onCancel={() => confirm?.onCancel()}
      />

      <PremiumToast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerTitleCol: { alignItems: 'center', flex: 1, paddingHorizontal: 8 },
  headerBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 1.2,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  scroll: { flex: 1 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  loadingText: { fontSize: 12.5, color: colors.textMuted },
  errorTitle: { fontSize: 14, fontWeight: '700', color: colors.crimsonDark, textAlign: 'center' },
  errorHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.crimson,
    borderRadius: 10,
  },
  retryText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  deniedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  deniedTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  deniedText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  deniedBtn: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 11,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  deniedBtnText: { color: colors.white, fontWeight: '700' },
});
