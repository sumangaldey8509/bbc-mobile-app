import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Mail,
  Lock,
  KeyRound,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { BrandLogo } from '../components/BrandLogo';
import { PremiumToast, ToastType } from '../components/PremiumToast';
import {
  forgotPasswordRequest,
  verifyResetOtpRequest,
  resendResetOtpRequest,
  resetPasswordRequest,
} from '../services/authApi';

interface Props {
  navigation: any;
  route?: { params?: { email?: string } };
}

type Step = 'email' | 'otp' | 'password' | 'done';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_SECONDS = 120;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
  }>({ visible: false, type: 'info', title: '', message: '' });

  const showToast = (type: ToastType, title: string, message: string) =>
    setToast({ visible: true, type, title, message });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [secondsLeft]);

  const startTimer = () => setSecondsLeft(OTP_TTL_SECONDS);

  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSendCode = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      showToast('warning', 'Email Required', 'Enter the email address registered with your account.');
      return;
    }
    setSending(true);
    try {
      await forgotPasswordRequest(email);
      setStep('otp');
      setOtp('');
      startTimer();
      showToast('success', 'Reset Code Sent', `A 6-digit code was sent to ${email.trim()} (valid 2 minutes).`);
    } catch (err: any) {
      showToast('error', 'Could Not Send Code', err?.message || 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    try {
      await resendResetOtpRequest(email);
      setOtp('');
      startTimer();
      showToast('success', 'New Code Sent', `A fresh 6-digit code was sent to ${email.trim()}.`);
    } catch (err: any) {
      showToast('error', 'Could Not Resend Code', err?.message || 'Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      showToast('warning', 'Enter the 6-digit Code', 'The reset code is 6 digits long.');
      return;
    }
    setVerifying(true);
    try {
      await verifyResetOtpRequest(email, otp);
      setStep('password');
      showToast('success', 'Code Verified', 'Set a new password for your account.');
    } catch (err: any) {
      showToast('error', 'Verification Failed', err?.message || 'The code is invalid or expired.');
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = async () => {
    if (newPassword.length < 6) {
      showToast('warning', 'Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('warning', 'Passwords Do Not Match', 'Re-enter the same password in both fields.');
      return;
    }
    setResetting(true);
    try {
      await resetPasswordRequest(email, otp, newPassword);
      setSecondsLeft(0);
      setStep('done');
    } catch (err: any) {
      const msg = err?.message || 'Please try again.';
      if (/expired/i.test(msg)) {
        setStep('otp');
        setOtp('');
        showToast('error', 'Code Expired', 'Request a new code and try again.');
      } else {
        showToast('error', 'Could Not Reset Password', msg);
      }
    } finally {
      setResetting(false);
    }
  };

  const stepHint =
    step === 'email'
      ? 'Enter your registered email and we will send a verification code.'
      : step === 'otp'
      ? `Enter the 6-digit code sent to ${email.trim()}.`
      : step === 'password'
      ? 'Choose a new password for your account.'
      : '';

  return (
    <View style={styles.root}>
      <Image
        source={require('../../assets/kolkata_city_vector_bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
        blurRadius={Platform.OS === 'web' ? 2 : 3}
      />
      <View style={styles.bgOverlay} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <PremiumToast
          visible={toast.visible}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
        />

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back to Sign In"
          >
            <ArrowLeft color={colors.textPrimary} size={20} />
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
            <View style={styles.headerSection}>
              <BrandLogo size="large" centered taglineText="by CredoVation Solutions Pvt Ltd" />
              <View style={styles.badgePill}>
                <ShieldCheck color={colors.crimson} size={13} />
                <Text style={styles.badgePillText}>ACCOUNT RECOVERY</Text>
              </View>
              <Text style={styles.heading}>
                {step === 'done' ? 'Password Updated' : 'Forgot Password'}
              </Text>
              {!!stepHint && <Text style={styles.subtitle}>{stepHint}</Text>}
            </View>

            {step !== 'done' && (
              <View style={styles.steps}>
                {(['email', 'otp', 'password'] as const).map((s, i) => {
                  const order = ['email', 'otp', 'password'];
                  const active = order.indexOf(step) >= i;
                  return (
                    <View
                      key={s}
                      style={[styles.stepDot, active && styles.stepDotActive]}
                    />
                  );
                })}
              </View>
            )}

            <BlurView
              intensity={Platform.OS === 'ios' ? 70 : 85}
              tint="light"
              style={styles.card}
            >
              {step === 'email' && (
                <>
                  <Text style={styles.label}>REGISTERED EMAIL</Text>
                  <View style={styles.inputBox}>
                    <Mail color={colors.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="name@company.com"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!sending}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.primaryBtn, sending && styles.btnDisabled]}
                    onPress={handleSendCode}
                    disabled={sending}
                    activeOpacity={0.85}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <KeyRound color={colors.white} size={16} />
                        <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {step === 'otp' && (
                <>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>ENTER 6-DIGIT CODE</Text>
                    <TouchableOpacity
                      onPress={handleResend}
                      disabled={secondsLeft > 0 || resending}
                      style={styles.resendTouch}
                    >
                      {resending ? (
                        <ActivityIndicator size="small" color={colors.crimson} />
                      ) : (
                        <RefreshCw
                          color={secondsLeft > 0 ? colors.textMuted : colors.crimson}
                          size={12}
                        />
                      )}
                      <Text
                        style={[
                          styles.resendText,
                          (secondsLeft > 0 || resending) && styles.resendTextDisabled,
                        ]}
                      >
                        {resending
                          ? 'Sending…'
                          : secondsLeft > 0
                          ? `Resend in ${mmss(secondsLeft)}`
                          : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputBox}>
                    <Lock color={colors.textSecondary} size={18} />
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      value={otp}
                      onChangeText={t => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!verifying}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryBtn, verifying && styles.btnDisabled]}
                    onPress={handleVerify}
                    disabled={verifying}
                    activeOpacity={0.85}
                  >
                    {verifying ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>Verify Code</Text>
                        <ArrowRight color={colors.white} size={16} />
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setStep('email');
                      setSecondsLeft(0);
                    }}
                    style={styles.linkBtn}
                  >
                    <Text style={styles.linkText}>Use a different email</Text>
                  </TouchableOpacity>
                </>
              )}

              {step === 'password' && (
                <>
                  {secondsLeft > 0 && (
                    <Text style={styles.timerNote}>Code valid for {mmss(secondsLeft)}</Text>
                  )}

                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.inputBox}>
                    <Lock color={colors.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Min. 6 characters"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showNew}
                      autoCapitalize="none"
                      editable={!resetting}
                    />
                    <TouchableOpacity onPress={() => setShowNew(v => !v)} hitSlop={8}>
                      {showNew ? (
                        <EyeOff color={colors.textSecondary} size={18} />
                      ) : (
                        <Eye color={colors.textSecondary} size={18} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.label, styles.labelSpaced]}>RE-ENTER NEW PASSWORD</Text>
                  <View style={styles.inputBox}>
                    <Lock color={colors.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Repeat new password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                      editable={!resetting}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                      {showConfirm ? (
                        <EyeOff color={colors.textSecondary} size={18} />
                      ) : (
                        <Eye color={colors.textSecondary} size={18} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <Text style={styles.mismatch}>Passwords do not match</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.primaryBtn, resetting && styles.btnDisabled]}
                    onPress={handleReset}
                    disabled={resetting}
                    activeOpacity={0.85}
                  >
                    {resetting ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.primaryBtnText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {step === 'done' && (
                <View style={styles.doneWrap}>
                  <CheckCircle2 color={colors.emerald} size={44} />
                  <Text style={styles.doneTitle}>Your password has been reset</Text>
                  <Text style={styles.doneText}>
                    A confirmation email is on its way. Sign in with your new password.
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryBtnText}>Back to Sign In</Text>
                    <ArrowRight color={colors.white} size={16} />
                  </TouchableOpacity>
                </View>
              )}
            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.5 },
  bgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(244,246,249,0.82)' },
  safe: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 40, paddingTop: 8 },
  headerSection: { alignItems: 'center', gap: 10, marginBottom: 18 },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimsonBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 6,
  },
  steps: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 14 },
  stepDot: {
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorderDarker,
  },
  stepDotActive: { backgroundColor: colors.crimson },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.7,
    marginBottom: 7,
  },
  labelSpaced: { marginTop: 14 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  otpInput: { letterSpacing: 6, fontWeight: '700', fontSize: 16 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
  resendTouch: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resendText: { fontSize: 11, fontWeight: '700', color: colors.crimson },
  resendTextDisabled: { color: colors.textMuted },
  linkBtn: { alignItems: 'center', marginTop: 12 },
  linkText: { fontSize: 12.5, fontWeight: '600', color: colors.textBlue },
  timerNote: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 10,
  },
  mismatch: { fontSize: 11.5, color: colors.crimsonDark, fontWeight: '600', marginTop: 8 },
  doneWrap: { alignItems: 'center', gap: 10, paddingVertical: 6 },
  doneTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  doneText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
