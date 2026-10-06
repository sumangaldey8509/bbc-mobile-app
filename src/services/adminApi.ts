import { apiRequest, ApiError } from './apiClient';

/**
 * Admin-only data access for the Admin Console module.
 *
 * NOTE: curated-table-be currently exposes /api/users and /api/roles without an
 * auth guard. `POST /api/users` creates a login-capable member (hashes the
 * password, sends an email verification OTP).
 */

export interface AdminRoleRef {
  _id: string;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface AdminMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string | null;
  roles?: AdminRoleRef[];
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  memberCount: number;
}

export interface RolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

interface BackendRole {
  _id: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  memberCount?: number;
}

function adaptRole(r: BackendRole): Role {
  return {
    id: r._id,
    name: r.name,
    description: r.description ?? '',
    permissions: r.permissions ?? [],
    isActive: r.isActive ?? true,
    memberCount: r.memberCount ?? 0,
  };
}

export async function listRoles(): Promise<Role[]> {
  const data = await apiRequest<BackendRole[]>('/roles', { method: 'GET' });
  return (Array.isArray(data) ? data : []).map(adaptRole);
}

export async function createRole(payload: RolePayload): Promise<Role> {
  return adaptRole(await apiRequest<BackendRole>('/roles', { method: 'POST', body: payload }));
}

export async function updateRole(id: string, payload: RolePayload): Promise<Role> {
  return adaptRole(
    await apiRequest<BackendRole>(`/roles/${id}`, { method: 'PUT', body: payload })
  );
}

export function deleteRole(id: string) {
  return apiRequest<null>(`/roles/${id}`, { method: 'DELETE' });
}

export interface CreateMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  countryCode?: string;
  phoneNumber?: string | null;
  roles?: string[]; // Role ObjectIds
}

export interface UpdateMemberPayload {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  phoneNumber?: string | null;
  roles?: string[];
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export function listMembers() {
  return apiRequest<AdminMember[]>('/users', { method: 'GET' });
}

export function getMember(id: string) {
  return apiRequest<AdminMember>(`/users/${id}`, { method: 'GET' });
}

/**
 * Creates a login-capable member via POST /api/users. The server hashes the
 * password and sends an email verification OTP.
 */
export function createMember(payload: CreateMemberPayload) {
  return apiRequest<AdminMember>('/users', { method: 'POST', body: payload });
}

export function updateMember(id: string, payload: UpdateMemberPayload) {
  return apiRequest<AdminMember>(`/users/${id}`, { method: 'PUT', body: payload });
}

/** Delete one member via DELETE /api/users/:id. */
export function deleteMember(id: string) {
  return apiRequest<null>(`/users/${id}`, { method: 'DELETE' });
}

export interface BulkDeleteResult {
  deletedIds: string[];
  failed: { id: string; message: string }[];
}

/**
 * Delete one or many members by fanning out to DELETE /api/users/:id
 * (the backend exposes only single-record delete). Runs the requests in
 * parallel and reports which ones failed.
 */
export async function deleteMembers(ids: string[]): Promise<BulkDeleteResult> {
  const results = await Promise.allSettled(ids.map(id => deleteMember(id)));

  const deletedIds: string[] = [];
  const failed: { id: string; message: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      deletedIds.push(ids[i]);
    } else if (result.reason instanceof ApiError && result.reason.status === 404) {
      // Already gone — the desired end state, treat as success.
      deletedIds.push(ids[i]);
    } else {
      failed.push({
        id: ids[i],
        message: result.reason?.message || 'Delete failed',
      });
    }
  });

  return { deletedIds, failed };
}

/**
 * Fallback roster built from the roles populated on the member list — used only
 * when GET /api/roles is unreachable so the UI can still show something.
 */
export function deriveRoles(members: AdminMember[]): Role[] {
  const map = new Map<string, Role>();
  for (const member of members) {
    for (const role of member.roles ?? []) {
      const existing = map.get(role._id);
      if (existing) {
        existing.memberCount += 1;
      } else {
        map.set(role._id, {
          id: role._id,
          name: role.name,
          description: role.description ?? '',
          permissions: role.permissions ?? [],
          isActive: true,
          memberCount: 1,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Members holding a given role id (client-side cross-reference). */
export function membersWithRole(members: AdminMember[], roleId: string): AdminMember[] {
  return members.filter(m => (m.roles ?? []).some(r => r._id === roleId));
}

export function memberFullName(m: AdminMember): string {
  return `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.email;
}
