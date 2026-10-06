import { apiRequest } from './apiClient';
import { User, ProfileDetails } from '../types';
import { formatTurnover } from './profileApi';

/** Shape of the user object returned by curated-table-be. */
export interface BackendUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string | null;
  roles?: ({ _id?: string; name: string } | string)[];
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  profileDetails?: ProfileDetails | null;
}

interface LoginResponse {
  token: string;
  user: BackendUser;
}

/**
 * POST /api/auth/login — email OR phone number + password.
 * Returns the JWT and the backend user profile.
 */
export function loginRequest(identifier: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { identifier: identifier.trim(), password },
  });
}

/** GET /api/auth/me — resolves the logged-in profile from the stored token. */
export function getMeRequest() {
  return apiRequest<BackendUser>('/auth/me', { method: 'GET' });
}

const normEmail = (email: string) => email.trim().toLowerCase();

/** Backend error code returned by /auth/login when the account is unverified. */
export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED';

/**
 * POST /api/auth/verify-otp (type: email_verification) — checks the code WITHOUT
 * consuming it, so the client can then offer an optional "set new password" step.
 * The code is spent by completeVerificationRequest.
 */
export function verifyEmailOtpRequest(email: string, otp: string) {
  return apiRequest<{ verified: boolean }>('/auth/verify-otp', {
    method: 'POST',
    auth: false,
    body: { email: normEmail(email), otp: otp.trim(), type: 'email_verification' },
  });
}

/**
 * POST /api/auth/complete-verification — consumes the email-verification code,
 * flips isEmailVerified to true, and optionally sets a new password. Omit
 * `newPassword` to keep the administrator-assigned password.
 */
export function completeVerificationRequest(
  email: string,
  otp: string,
  newPassword?: string
) {
  return apiRequest<BackendUser>('/auth/complete-verification', {
    method: 'POST',
    auth: false,
    body: {
      email: normEmail(email),
      otp: otp.trim(),
      ...(newPassword ? { newPassword } : {}),
    },
  });
}

/** POST /api/auth/resend-otp (type: email_verification) — sends a fresh code. */
export function resendEmailOtpRequest(email: string) {
  return apiRequest<{ expiresAt: string }>('/auth/resend-otp', {
    method: 'POST',
    auth: false,
    body: { email: normEmail(email), type: 'email_verification' },
  });
}

/** POST /api/auth/forgot-password — emails a 6-digit reset code (valid 2 min). */
export function forgotPasswordRequest(email: string) {
  return apiRequest<{ expiresAt: string }>('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email: normEmail(email) },
  });
}

/**
 * POST /api/auth/verify-otp (type: forgot_password) — checks the reset code
 * WITHOUT consuming it. The code is spent later by resetPasswordRequest.
 */
export function verifyResetOtpRequest(email: string, otp: string) {
  return apiRequest<{ verified: boolean }>('/auth/verify-otp', {
    method: 'POST',
    auth: false,
    body: { email: normEmail(email), otp: otp.trim(), type: 'forgot_password' },
  });
}

/** POST /api/auth/resend-otp (type: forgot_password) — sends a fresh reset code. */
export function resendResetOtpRequest(email: string) {
  return apiRequest<{ expiresAt: string }>('/auth/resend-otp', {
    method: 'POST',
    auth: false,
    body: { email: normEmail(email), type: 'forgot_password' },
  });
}

/** POST /api/auth/reset-password — consumes the code and sets the new password. */
export function resetPasswordRequest(email: string, otp: string, newPassword: string) {
  return apiRequest<null>('/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: { email: normEmail(email), otp: otp.trim(), newPassword },
  });
}

/**
 * Maps a backend user and their profile onto the frontend `User` model.
 */
export function adaptBackendUser(
  backend: BackendUser,
  profileOverride?: ProfileDetails | null
): User {
  const profile = profileOverride !== undefined ? profileOverride : backend.profileDetails;
  const fullName = `${backend.firstName ?? ''} ${backend.lastName ?? ''}`.trim() || 'Member';
  const phone =
    backend.phoneNumber != null && backend.phoneNumber !== ''
      ? `${backend.countryCode ?? '+91'} ${backend.phoneNumber}`.trim()
      : '';
  const joinedYear =
    profile?.yearJoined ??
    (backend.createdAt ? new Date(backend.createdAt).getFullYear() : new Date().getFullYear());

  const roleNames = (backend.roles ?? [])
    .map(r => (typeof r === 'string' ? r : r.name))
    .filter(Boolean);
  const isAdmin = roleNames.includes('admin');

  const industryStr = Array.isArray(profile?.industry)
    ? profile.industry.join(', ')
    : typeof profile?.industry === 'string'
    ? profile.industry
    : '';

  const locationStr = [profile?.city, profile?.state].filter(Boolean).join(', ');
  const chapterStr = profile?.city
    ? `${profile.city} Chapter`
    : locationStr || 'Curated Table Member';

  const turnoverStr =
    profile?.turnover != null
      ? formatTurnover(profile.turnover, profile.turnoverUnit)
      : '';

  const docs = (profile?.requirementDocs || []).map(doc => ({
    title: doc.title,
    publicLink: doc.publicLink,
    size: 'Document',
    type: 'PDF',
  }));

  return {
    id: backend._id,
    name: fullName,
    roles: roleNames,
    designation: profile?.designation || '',
    companyName: profile?.companyName || '',
    industry: industryStr || '',
    chapter: chapterStr,
    location: locationStr || '',
    gstNumber: profile?.gstNumber || '',
    isGstVerified: Boolean(
      profile?.isGstVerified ||
      (profile?.gstNumber && profile?.status === 'approved') ||
      backend.isEmailVerified
    ),
    turnover: turnoverStr || '',
    yearJoined: joinedYear,
    avatar: profile?.avatar || '',
    coverImage: profile?.coverImage || '',
    membershipTier: isAdmin ? 'Founder Council' : 'Executive Member',
    bio: profile?.bio || '',
    requirementDocs: docs,
    contact: {
      email: backend.email || '',
      phone: phone || '',
      website: profile?.website || '',
      officeAddress: profile?.officeAddress || '',
    },
    stats: {
      oneToOneCount: 0,
      referralsGiven: 0,
      referralsReceived: 0,
      businessValueInLakhs: 0,
    },
  };
}

/**
 * Updates a User with fresh profile details from GET /api/profile/me.
 */
export function adaptBackendUserWithProfile(user: User, profile: ProfileDetails): User {
  const industryStr = Array.isArray(profile.industry)
    ? profile.industry.join(', ')
    : typeof profile.industry === 'string'
    ? profile.industry
    : '';

  const locationStr = [profile.city, profile.state].filter(Boolean).join(', ');
  const chapterStr = profile.city
    ? `${profile.city} Chapter`
    : locationStr || user.chapter || 'Curated Table Member';

  const turnoverStr =
    profile.turnover != null
      ? formatTurnover(profile.turnover, profile.turnoverUnit)
      : user.turnover;

  const docs = (profile.requirementDocs || []).map(doc => ({
    title: doc.title,
    publicLink: doc.publicLink,
    size: 'Document',
    type: 'PDF',
  }));

  return {
    ...user,
    designation: profile.designation || user.designation,
    companyName: profile.companyName || user.companyName,
    industry: industryStr || user.industry,
    chapter: chapterStr,
    location: locationStr || user.location,
    gstNumber: profile.gstNumber || user.gstNumber,
    isGstVerified: Boolean(
      profile.isGstVerified ||
      (profile.gstNumber && profile.status === 'approved') ||
      user.isGstVerified
    ),
    turnover: turnoverStr,
    yearJoined: profile.yearJoined ?? user.yearJoined,
    avatar: profile.avatar || user.avatar,
    coverImage: profile.coverImage || user.coverImage,
    bio: profile.bio || user.bio,
    requirementDocs: docs.length ? docs : user.requirementDocs,
    contact: {
      ...user.contact,
      website: profile.website || user.contact?.website,
      officeAddress: profile.officeAddress || user.contact?.officeAddress,
    },
  };
}
