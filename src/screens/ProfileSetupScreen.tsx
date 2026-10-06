import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import {
  LogOut,
  X,
  Check,
  Plus,
  FileText,
  Clock,
  RefreshCw,
  CircleAlert,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import { PremiumToast, ToastType } from '../components/PremiumToast';
import { PhotoField } from '../components/PhotoField';
import { ChipAutocompleteField } from '../components/ChipAutocompleteField';
import { SearchSelectField } from '../components/SearchSelectField';
import { getInitials } from '../utils/initials';
import { searchIndustriesRequest, createIndustryRequest } from '../services/industryApi';
import {
  searchStatesRequest,
  searchCitiesRequest,
  createCityRequest,
} from '../services/locationApi';
import {
  ProfileFormState,
  emptyProfileForm,
  profileToForm,
  computeLocalCompletion,
  getMyProfileRequest,
  saveMyProfileRequest,
  submitMyProfileRequest,
  uploadFileRequest,
  FIELD_LABELS,
  PickedFile,
  TURNOVER_UNITS,
} from '../services/profileApi';
import { ProfileDetails } from '../types';


export const ProfileSetupScreen: React.FC = () => {
  const { currentUser, logout, refreshProfileStatus } = useApp();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm());
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [avatarTs, setAvatarTs] = useState<string | null>(null);
  const [coverTs, setCoverTs] = useState<string | null>(null);
  const [stateId, setStateId] = useState<string | null>(null);
  const [docTitleDraft, setDocTitleDraft] = useState('');

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
  }>({ visible: false, type: 'info', title: '', message: '' });
  const showToast = (type: ToastType, title: string, message: string) =>
    setToast({ visible: true, type, title, message });

  const status = profile?.status ?? 'draft';
  const underReview = status === 'submitted' || status === 'under_review';
  const completion = useMemo(() => computeLocalCompletion(form), [form]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyProfileRequest();
      setProfile(res.profile);
      setForm(profileToForm(res.profile));
      setAvatarTs(res.profile?.avatarUpdatedAt ?? null);
      setCoverTs(res.profile?.coverImageUpdatedAt ?? null);

      // Resolve the saved state's id so the City field can search within it.
      const savedState = res.profile?.state?.trim();
      if (savedState) {
        try {
          const matches = await searchStatesRequest(savedState);
          const exact = matches.find(s => s.name.toLowerCase() === savedState.toLowerCase());
          setStateId(exact?.id ?? null);
        } catch {
          setStateId(null);
        }
      }
    } catch (err: any) {
      showToast('error', 'Could Not Load Profile', err?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const pickDocument = async () => {
    if (!docTitleDraft.trim()) {
      showToast('warning', 'Add a Title', 'Give the document a title first.');
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const file: PickedFile = {
      uri: asset.uri,
      name: asset.name || 'document.pdf',
      type: asset.mimeType || 'application/pdf',
    };
    setUploadingDoc(true);
    try {
      const res = await uploadFileRequest(file, 'document');
      setForm(prev => ({
        ...prev,
        requirementDocs: [
          ...prev.requirementDocs,
          { title: docTitleDraft.trim(), publicLink: res.url },
        ],
      }));
      setDocTitleDraft('');
    } catch (err: any) {
      showToast('error', 'Upload Failed', err?.message || 'Could not upload the document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSave = async (silent = false) => {
    setSaving(true);
    try {
      const res = await saveMyProfileRequest(form);
      setProfile(res.profile);
      if (!silent) showToast('success', 'Saved', 'Your profile draft has been saved.');
      return res;
    } catch (err: any) {
      showToast('error', 'Could Not Save', err?.message || 'Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await handleSave(true);
      const res = await submitMyProfileRequest();
      setProfile(res.profile);
      await refreshProfileStatus();
      showToast('success', 'Submitted', 'Your profile is now with the secretariat for review.');
    } catch (err: any) {
      showToast('error', 'Could Not Submit', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    await load();
    await refreshProfileStatus();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.crimson} />
          <Text style={styles.loadingText}>Loading your profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <PremiumToast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <View style={styles.header}>
        <BrandLogo size="small" showTagline={false} />
        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <LogOut color={colors.crimson} size={15} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {underReview ? 'Profile Under Review' : 'Complete Your Profile'}
          </Text>
          <Text style={styles.subtitle}>
            {underReview
              ? 'The secretariat is reviewing your details. You will get full access once it is approved.'
              : `Namaskar ${currentUser.name.split(' ')[0]} — every field below is required. Submit for review to unlock the app.`}
          </Text>

          {/* Completion meter */}
          <View style={styles.meterCard}>
            <View style={styles.meterRow}>
              <Text style={styles.meterPct}>{completion.percent}%</Text>
              <Text style={styles.meterLabel}>
                {completion.filled}/{completion.total} required fields
              </Text>
            </View>
            <View style={styles.meterTrack}>
              <View style={[styles.meterFill, { width: `${completion.percent}%` }]} />
            </View>
            {!underReview && completion.missingRequired.length > 0 && (
              <Text style={styles.meterMissing}>
                Required to submit:{' '}
                {completion.missingRequired.map(f => FIELD_LABELS[f] || f).join(', ')}
              </Text>
            )}
            {!underReview && completion.canSubmit && completion.percent < 100 && (
              <Text style={styles.meterNudge}>
                You can submit now. Add your{' '}
                {completion.missing.map(f => FIELD_LABELS[f] || f).join(' & ').toLowerCase()} to
                reach 100% — members with a photo &amp; cover get noticed more and receive more
                recommendations.
              </Text>
            )}
          </View>

          {status === 'rejected' && !!profile?.reviewNote && (
            <View style={styles.rejectBanner}>
              <CircleAlert color={colors.crimsonDark} size={16} />
              <View style={styles.flex}>
                <Text style={styles.rejectTitle}>Changes requested</Text>
                <Text style={styles.rejectNote}>{profile.reviewNote}</Text>
              </View>
            </View>
          )}

          {underReview ? (
            <View style={styles.reviewCard}>
              <Clock color={colors.amberAccent} size={34} />
              <Text style={styles.reviewCardTitle}>
                {status === 'under_review' ? 'Under Review' : 'Submitted for Review'}
              </Text>
              <Text style={styles.reviewCardText}>
                {profile?.submittedAt
                  ? `Submitted ${new Date(profile.submittedAt).toLocaleDateString()}`
                  : 'Awaiting the secretariat.'}
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleCheckStatus}>
                <RefreshCw color={colors.white} size={15} />
                <Text style={styles.primaryBtnText}>Check Status</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Photos */}
              <Text style={styles.sectionTitle}>PHOTOS (OPTIONAL)</Text>
              <View style={styles.card}>
                <Text style={styles.photoBenefit}>
                  A photo and cover aren&apos;t required, but a complete profile gets you noticed
                  by other members and surfaces you in more recommendations.
                </Text>
                <View style={styles.photoRow}>
                  <PhotoField
                    kind="avatar"
                    name={currentUser.name}
                    url={form.avatar}
                    updatedAt={avatarTs}
                    onChange={(url, ts) => {
                      set('avatar', url);
                      setAvatarTs(ts);
                      setProfile(prev => (prev ? { ...prev, avatar: url } : prev));
                    }}
                    onError={msg => showToast('error', 'Photo', msg)}
                  />
                  <View style={styles.flex}>
                    <Text style={styles.photoLabel}>Profile photo</Text>
                    <Text style={styles.photoHint}>
                      {form.avatar
                        ? 'Tap the photo to view, change or remove it.'
                        : `Tap to add one. Until then, members see your initials (${getInitials(currentUser.name)}).`}
                    </Text>
                  </View>
                </View>

                <PhotoField
                  kind="cover"
                  name={currentUser.name}
                  url={form.coverImage}
                  updatedAt={coverTs}
                  onChange={(url, ts) => {
                    set('coverImage', url);
                    setCoverTs(ts);
                    setProfile(prev => (prev ? { ...prev, coverImage: url } : prev));
                  }}
                  onError={msg => showToast('error', 'Cover Photo', msg)}
                />
              </View>

              {/* Business */}
              <Text style={styles.sectionTitle}>BUSINESS</Text>
              <View style={styles.card}>
                <Field label="Designation">
                  <TextInput
                    style={styles.input}
                    value={form.designation}
                    onChangeText={t => set('designation', t)}
                    placeholder="Founder & Managing Director"
                    placeholderTextColor={colors.textMuted}
                  />
                </Field>
                <Field label="Company name">
                  <TextInput
                    style={styles.input}
                    value={form.companyName}
                    onChangeText={t => set('companyName', t)}
                    placeholder="Bengal Precision Dynamics Pvt Ltd"
                    placeholderTextColor={colors.textMuted}
                  />
                </Field>
                <Field label="Annual turnover">
                  <View style={styles.turnoverRow}>
                    <TextInput
                      style={[styles.input, styles.flex]}
                      value={form.turnover}
                      onChangeText={t => set('turnover', t.replace(/[^\d.]/g, ''))}
                      placeholder="Amount"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                    <View style={styles.unitGroup}>
                      {TURNOVER_UNITS.map(u => {
                        const active = form.turnoverUnit === u.value;
                        return (
                          <TouchableOpacity
                            key={u.value}
                            style={[styles.unitBtn, active && styles.unitBtnActive]}
                            onPress={() => set('turnoverUnit', u.value)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.unitText, active && styles.unitTextActive]}>
                              {u.short}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  <Text style={styles.hint}>
                    e.g. 35 Cr · K = thousand, L = lakh, Cr = crore
                  </Text>
                </Field>
                {profile?.yearJoined != null && (
                  <Text style={styles.memberSince}>
                    Member since {profile.yearJoined} · set from your join date
                  </Text>
                )}
                <Field label="GST number">
                  <TextInput
                    style={styles.input}
                    value={form.gstNumber}
                    onChangeText={t => set('gstNumber', t.toUpperCase())}
                    placeholder="19AAECB4821M1Z5"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                  />
                  {profile?.isGstVerified && (
                    <Text style={styles.gstVerified}>✓ Verified by the secretariat</Text>
                  )}
                </Field>
              </View>

              {/* Industry & Location */}
              <Text style={styles.sectionTitle}>INDUSTRY &amp; LOCATION</Text>
              <View style={styles.card}>
                <ChipAutocompleteField
                  label="Industry"
                  values={form.industry}
                  onChange={v => set('industry', v)}
                  placeholder="Search or add an industry"
                  search={q => searchIndustriesRequest(q).catch(() => [])}
                  createEntry={createIndustryRequest}
                  hint="Pick from the list, or type your own — it's added for others too."
                />
                <SearchSelectField
                  label="State / UT"
                  value={form.state}
                  placeholder="Select your state"
                  search={q => searchStatesRequest(q).catch(() => [])}
                  onSelect={opt => {
                    setForm(prev => ({
                      ...prev,
                      state: opt?.name ?? '',
                      city: opt?.name === form.state ? prev.city : '',
                    }));
                    setStateId(opt?.id ?? null);
                  }}
                />
                <SearchSelectField
                  label="City"
                  value={form.city}
                  placeholder={stateId ? 'Search your city' : 'Select a state first'}
                  disabled={!stateId}
                  disabledHint="Choose a state / UT above to pick a city."
                  search={q => (stateId ? searchCitiesRequest(stateId, q) : Promise.resolve([])).catch(() => [])}
                  createEntry={
                    stateId ? name => createCityRequest(stateId, name) : undefined
                  }
                  onSelect={opt => set('city', opt?.name ?? '')}
                  hint="Not listed? Type it and choose “Add”."
                />
              </View>

              {/* About */}
              <Text style={styles.sectionTitle}>ABOUT</Text>
              <View style={styles.card}>
                <Field label="Bio">
                  <TextInput
                    style={[styles.input, styles.multiline]}
                    value={form.bio}
                    onChangeText={t => set('bio', t)}
                    placeholder="What your business does, who you serve…"
                    placeholderTextColor={colors.textMuted}
                    multiline
                  />
                </Field>
              </View>

              {/* Contact */}
              <Text style={styles.sectionTitle}>CONTACT</Text>
              <View style={styles.card}>
                <Field label="Website (optional)">
                  <TextInput
                    style={styles.input}
                    value={form.website}
                    onChangeText={t => set('website', t)}
                    placeholder="https://yourcompany.in"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </Field>
                <Field label="Office address">
                  <TextInput
                    style={[styles.input, styles.multiline]}
                    value={form.officeAddress}
                    onChangeText={t => set('officeAddress', t)}
                    placeholder="Plot, block, area, city, PIN"
                    placeholderTextColor={colors.textMuted}
                    multiline
                  />
                </Field>
              </View>

              {/* Documents (optional) */}
              <Text style={styles.sectionTitle}>DOCUMENTS (OPTIONAL)</Text>
              <View style={styles.card}>
                {form.requirementDocs.map((doc, i) => (
                  <View key={`${doc.publicLink}-${i}`} style={styles.docRow}>
                    <FileText color={colors.accentBlue} size={16} />
                    <Text style={styles.docTitle} numberOfLines={1}>
                      {doc.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setForm(prev => ({
                          ...prev,
                          requirementDocs: prev.requirementDocs.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <X color={colors.textMuted} size={15} />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.docAddRow}>
                  <TextInput
                    style={[styles.input, styles.flex]}
                    value={docTitleDraft}
                    onChangeText={setDocTitleDraft}
                    placeholder="Document title, then attach"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.docAddBtn}
                    onPress={pickDocument}
                    disabled={uploadingDoc}
                  >
                    {uploadingDoc ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Plus color={colors.white} size={16} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, saving && styles.btnDisabled]}
                  onPress={() => handleSave(false)}
                  disabled={saving || submitting}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.secondaryBtnText}>Save Draft</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    styles.flex,
                    (!completion.canSubmit || submitting) && styles.btnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!completion.canSubmit || submitting || saving}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Check color={colors.white} size={16} />
                      <Text style={styles.primaryBtnText}>
                        {status === 'rejected' ? 'Resubmit for Review' : 'Submit for Review'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Field: React.FC<{ label: string; style?: any; children: React.ReactNode }> = ({
  label,
  style,
  children,
}) => (
  <View style={[styles.field, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 12.5, color: colors.textMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    backgroundColor: colors.crimsonLight,
  },
  signOutText: { fontSize: 12, fontWeight: '700', color: colors.crimson },
  scroll: { padding: 16, gap: 4 },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 4, marginBottom: 12 },
  meterCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 8,
  },
  meterRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  meterPct: { fontSize: 24, fontWeight: '800', color: colors.crimson },
  meterLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 3 },
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  meterFill: { height: 8, borderRadius: 4, backgroundColor: colors.crimson },
  meterMissing: { fontSize: 11, color: colors.crimsonDark, marginTop: 8, lineHeight: 15, fontWeight: '600' },
  meterNudge: { fontSize: 11.5, color: colors.textSecondary, marginTop: 8, lineHeight: 16 },
  rejectBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.crimsonLight,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  rejectTitle: { fontSize: 12.5, fontWeight: '800', color: colors.crimsonDark },
  rejectNote: { fontSize: 12.5, color: colors.crimsonDark, marginTop: 2, lineHeight: 17 },
  reviewCard: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    padding: 24,
    marginTop: 12,
  },
  reviewCardTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  reviewCardText: { fontSize: 12.5, color: colors.textSecondary, textAlign: 'center' },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 12,
  },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
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
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  turnoverRow: { flexDirection: 'row', gap: 8 },
  unitGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    overflow: 'hidden',
  },
  unitBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  unitBtnActive: { backgroundColor: colors.primary },
  unitText: { fontSize: 12.5, fontWeight: '800', color: colors.textSecondary },
  unitTextActive: { color: colors.white },
  memberSince: { fontSize: 11.5, color: colors.textMuted, marginTop: -2 },
  gstVerified: { fontSize: 11, color: colors.emerald, fontWeight: '700', marginTop: 4 },
  photoBenefit: { fontSize: 11.5, color: colors.textSecondary, lineHeight: 16 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photoLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  photoHint: { fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 15 },
  chipInputRow: { flexDirection: 'row', gap: 8 },
  chipAddBtn: {
    width: 44,
    borderRadius: 10,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  chip: {
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
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  docTitle: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  docAddRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  docAddBtn: {
    width: 44,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryBtnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  secondaryBtn: {
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorderDarker,
    backgroundColor: colors.cardBg,
  },
  secondaryBtnText: { color: colors.primary, fontSize: 13.5, fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
});
