import { Platform } from 'react-native';
import { apiRequest, uploadWithProgress } from './apiClient';
import {
  ProfileDetails,
  ProfileMeResponse,
  ProfileStatus,
  RequirementDoc,
} from '../types';

/** Fields that block submission (mirrors the backend). Photo & cover are NOT here. */
export const PROFILE_REQUIRED_FIELDS = [
  'designation',
  'companyName',
  'industry',
  'state',
  'city',
  'gstNumber',
  'turnover',
  'bio',
  'officeAddress',
] as const;

/** Everything that contributes to the completion % (required + encouraged extras). */
export const PROFILE_COMPLETION_FIELDS = [
  ...PROFILE_REQUIRED_FIELDS,
  'website',
  'avatar',
  'coverImage',
] as const;

export const FIELD_LABELS: Record<string, string> = {
  designation: 'Designation',
  companyName: 'Company name',
  industry: 'Industry',
  state: 'State',
  city: 'City',
  gstNumber: 'GST number',
  turnover: 'Annual turnover',
  avatar: 'Profile photo',
  coverImage: 'Cover image',
  bio: 'Bio',
  website: 'Website',
  officeAddress: 'Office address',
};

export type TurnoverUnit = 'k' | 'l' | 'cr';

export const TURNOVER_UNITS: { value: TurnoverUnit; short: string; label: string }[] = [
  { value: 'k', short: 'K', label: 'Thousand' },
  { value: 'l', short: 'L', label: 'Lakh' },
  { value: 'cr', short: 'Cr', label: 'Crore' },
];

export const formatTurnover = (
  amount?: number | null,
  unit?: string | null
): string => {
  if (amount == null || !Number.isFinite(amount)) return '';
  const u = TURNOVER_UNITS.find(x => x.value === (unit || 'cr')) ?? TURNOVER_UNITS[2];
  return `₹${amount} ${u.short}`;
};

export interface ProfileFormState {
  designation: string;
  companyName: string;
  industry: string[];
  state: string;
  city: string;
  gstNumber: string;
  turnover: string; // kept as text in the form
  turnoverUnit: TurnoverUnit;
  avatar: string;
  coverImage: string;
  bio: string;
  website: string;
  officeAddress: string;
  requirementDocs: RequirementDoc[];
}

export const emptyProfileForm = (): ProfileFormState => ({
  designation: '',
  companyName: '',
  industry: [],
  state: '',
  city: '',
  gstNumber: '',
  turnover: '',
  turnoverUnit: 'cr',
  avatar: '',
  coverImage: '',
  bio: '',
  website: '',
  officeAddress: '',
  requirementDocs: [],
});

export const profileToForm = (p: ProfileDetails | null): ProfileFormState => {
  if (!p) return emptyProfileForm();
  return {
    designation: p.designation ?? '',
    companyName: p.companyName ?? '',
    industry: p.industry ?? [],
    state: p.state ?? '',
    city: p.city ?? '',
    gstNumber: p.gstNumber ?? '',
    turnover: p.turnover != null ? String(p.turnover) : '',
    turnoverUnit: (p.turnoverUnit as TurnoverUnit) ?? 'cr',
    avatar: p.avatar ?? '',
    coverImage: p.coverImage ?? '',
    bio: p.bio ?? '',
    website: p.website ?? '',
    officeAddress: p.officeAddress ?? '',
    requirementDocs: p.requirementDocs ?? [],
  };
};

const fieldFilled = (form: ProfileFormState, key: string): boolean => {
  const v = (form as unknown as Record<string, unknown>)[key];
  if (Array.isArray(v)) return v.length > 0;
  if (key === 'turnover') {
    const n = Number(form.turnover);
    return Number.isFinite(n) && n > 0;
  }
  return typeof v === 'string' && v.trim().length > 0;
};

/** Live completion for the in-progress form (backend is authoritative on save). */
export const computeLocalCompletion = (form: ProfileFormState) => {
  const total = PROFILE_COMPLETION_FIELDS.length;
  const missing = PROFILE_COMPLETION_FIELDS.filter(f => !fieldFilled(form, f));
  const missingRequired = PROFILE_REQUIRED_FIELDS.filter(f => !fieldFilled(form, f));
  const filled = total - missing.length;
  return {
    percent: Math.round((filled / total) * 100),
    filled,
    total,
    missing: missing as unknown as string[],
    missingRequired: missingRequired as unknown as string[],
    canSubmit: missingRequired.length === 0,
  };
};

export const formToPayload = (form: ProfileFormState) => ({
  designation: form.designation.trim(),
  companyName: form.companyName.trim(),
  industry: form.industry,
  state: form.state.trim(),
  city: form.city.trim(),
  gstNumber: form.gstNumber.trim(),
  turnover: form.turnover.trim() ? Number(form.turnover.trim()) : null,
  turnoverUnit: form.turnoverUnit,
  avatar: form.avatar,
  coverImage: form.coverImage,
  bio: form.bio.trim(),
  website: form.website.trim(),
  officeAddress: form.officeAddress.trim(),
  requirementDocs: form.requirementDocs,
});

// --- Member endpoints ---

export function getMyProfileRequest() {
  return apiRequest<ProfileMeResponse>('/profile/me', { method: 'GET' });
}

export function saveMyProfileRequest(form: ProfileFormState) {
  return apiRequest<ProfileMeResponse>('/profile/me', {
    method: 'PUT',
    body: formToPayload(form),
  });
}

export function submitMyProfileRequest() {
  return apiRequest<ProfileMeResponse>('/profile/me/submit', { method: 'POST' });
}

/** Persist a single photo url to the profile (partial update). */
export function setProfilePhotoRequest(kind: 'avatar' | 'cover', url: string) {
  const field = kind === 'avatar' ? 'avatar' : 'coverImage';
  return apiRequest<ProfileMeResponse>('/profile/me', {
    method: 'PUT',
    body: { [field]: url },
  });
}

/** Remove a photo from the profile (Mongo + Cloudinary). */
export function removePhotoRequest(kind: 'avatar' | 'cover') {
  return apiRequest<ProfileMeResponse>('/profile/me/photo', {
    method: 'DELETE',
    body: { kind },
  });
}

// --- Uploads ---

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  format?: string;
}

export interface PickedFile {
  uri: string;
  name: string;
  type: string; // mime
}

const extFromName = (name: string, mime: string) => {
  const m = name.match(/\.[a-z0-9]+$/i);
  if (m) return name;
  const guess = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  return `${name || 'upload'}.${guess}`;
};

export async function uploadFileRequest(
  file: PickedFile,
  kind: 'avatar' | 'cover' | 'document',
  onProgress?: (percent: number) => void
) {
  const fd = new FormData();
  const filename = extFromName(file.name, file.type);

  if (Platform.OS === 'web') {
    // On web the picker returns a blob:/data: URL — multer needs a real file part.
    const resp = await fetch(file.uri);
    const blob = await resp.blob();
    fd.append('file', blob, filename);
  } else {
    // React Native FormData file shape
    fd.append(
      'file',
      { uri: file.uri, name: filename, type: file.type || 'application/octet-stream' } as unknown as Blob
    );
  }
  fd.append('kind', kind);
  return uploadWithProgress<UploadResult>('/uploads', fd, onProgress);
}

// --- Admin review endpoints ---

export interface AdminProfileReview extends Omit<ProfileDetails, 'userId'> {
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    countryCode?: string;
    phoneNumber?: string | null;
    isActive?: boolean;
    isEmailVerified?: boolean;
  };
  reviewedBy?: { _id: string; firstName: string; lastName: string } | null;
  completion?: { percent: number; missing: string[] };
}

export function listProfileReviewsRequest(statuses?: ProfileStatus[]) {
  const qs = statuses && statuses.length ? `?status=${statuses.join(',')}` : '';
  return apiRequest<AdminProfileReview[]>(`/profile/reviews${qs}`, { method: 'GET' });
}

export function getProfileForAdminRequest(userId: string) {
  return apiRequest<AdminProfileReview>(`/profile/${userId}`, { method: 'GET' });
}

export function reviewProfileRequest(
  userId: string,
  status: 'approved' | 'rejected' | 'under_review',
  note?: string
) {
  return apiRequest<ProfileDetails>(`/profile/${userId}/review`, {
    method: 'PATCH',
    body: { status, ...(note ? { note } : {}) },
  });
}
