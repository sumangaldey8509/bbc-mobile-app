import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Lock,
  Phone,
  ArrowRight,
  Users2,
  KeyRound,
  RefreshCw,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import { PremiumToast, ToastType } from '../components/PremiumToast';
import { EMAIL_NOT_VERIFIED } from '../services/authApi';
import { BlurView } from 'expo-blur';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, loginWithCredentials, users } = useApp();
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [otpOrPassword, setOtpOrPassword] = useState('');
  // Mobile & OTP login is disabled — password login is the only supported mode.
  const isOtpMode = false;
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('123456');
  const [timer, setTimer] = useState(30);

  // Simulated API Loading States for Animations
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // In-App Toast Notification State
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showToast = (type: ToastType, title: string, message: string) => {
    setToastConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  useEffect(() => {
    let interval: any;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = () => {
    if (!mobileOrEmail.trim()) {
      showToast('warning', 'Mobile or Email Required', 'Please enter your registered mobile number or email address.');
      return;
    }
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setTimer(30);
      setDemoOtp('123456');
      showToast(
        'success',
        'OTP Sent',
        `A 6-digit OTP code was sent to ${mobileOrEmail.trim()}.`
      );
    }, 850);
  };

  const handleResendOtp = () => {
    if (timer > 0 || isResendingOtp) return;
    setIsResendingOtp(true);
    setTimeout(() => {
      setIsResendingOtp(false);
      setTimer(30);
      setDemoOtp('123456');
      showToast(
        'success',
        'New OTP Sent',
        `A new 6-digit OTP code was sent to ${mobileOrEmail.trim()}.`
      );
    }, 750);
  };

  const handleStandardLogin = () => {
    if (!mobileOrEmail.trim()) {
      showToast('warning', 'Details Required', 'Please enter your mobile number or email address.');
      return;
    }

    if (isOtpMode && !otpOrPassword.trim()) {
      showToast('warning', 'OTP Required', 'Please enter the 6-digit OTP code.');
      return;
    }

    // Password login authenticates against the Curated Table backend.
    if (!isOtpMode) {
      handlePasswordLogin();
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      // Match entered email/phone with mock users or default to first user
      const matchedUser = users.find(
        u =>
          u.contact.phone.includes(mobileOrEmail.trim()) ||
          u.contact.email.toLowerCase() === mobileOrEmail.toLowerCase().trim()
      ) || users[0];

      setIsLoggingIn(false);
      login(matchedUser);
    }, 950);
  };

  const handlePasswordLogin = async () => {
    if (!otpOrPassword.trim()) {
      showToast('warning', 'Password Required', 'Please enter your account password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await loginWithCredentials(mobileOrEmail.trim(), otpOrPassword);
      // On success the navigator swaps to the authenticated stack automatically.
    } catch (error: any) {
      // Unverified account → send the member through email verification first.
      if (error?.code === EMAIL_NOT_VERIFIED) {
        const email =
          (error?.details?.email as string | undefined) || mobileOrEmail.trim();
        showToast('info', 'Verify Your Email', 'We sent a 6-digit code to your email.');
        navigation.navigate('VerifyEmail', { email });
        return;
      }
      showToast(
        'error',
        'Sign In Failed',
        error?.message || 'Unable to sign in right now. Please try again.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* Kolkata City Vector Architectural Background with Soft Blur */}
      <Image
        source={require('../../assets/kolkata_city_vector_bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={Platform.OS === 'web' ? 2 : 3}
      />
      <View style={styles.backgroundOverlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Floating In-App Toast Notification */}
        <PremiumToast
          visible={toastConfig.visible}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onDismiss={() => setToastConfig(prev => ({ ...prev, visible: false }))}
        />
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Section: Branding & Sign In Form */}
            <View style={styles.topContainer}>
              {/* Header & Brand Logo */}
              <View style={styles.headerSection}>
                <View style={styles.loginEmblemWrapper}>
                  <Image
                    source={require('../../assets/curated-table-app-icon.jpg')}
                    style={styles.loginEmblemImage}
                    resizeMode="cover"
                  />
                </View>

                <BrandLogo size="large" centered={true} taglineText="by CredoVation Solutions Pvt Ltd" style={styles.brandLogoBox} />

                <View style={styles.badgePill}>
                  <ShieldCheck color={colors.crimson} size={13} />
                  <Text style={styles.badgePillText}>EXECUTIVE BUSINESS COMMUNITY</Text>
                </View>

                <Text style={styles.welcomeHeading}>Sign In to Your Account</Text>
                <Text style={styles.welcomeSubtitle}>
                  Connect with verified business leaders, discover new opportunities, attend meetings, and exchange trusted referrals.
                </Text>
              </View>

              {/* Login Form Card with Frosted Glass Effect */}
              <BlurView
                intensity={Platform.OS === 'ios' ? 70 : 85}
                tint="light"
                style={styles.formCard}
              >
                {/* Input Method Toggle */}
                <View style={styles.toggleRow}>
                  <View
                    style={[styles.toggleBtn, styles.toggleBtnDisabled]}
                    accessibilityLabel="Mobile and OTP login is currently unavailable"
                  >
                    <Text style={[styles.toggleBtnText, styles.toggleBtnTextDisabled]}>
                      Mobile & OTP
                    </Text>
                  </View>
                  <View style={[styles.toggleBtn, styles.toggleBtnActive]}>
                    <Text style={[styles.toggleBtnText, styles.toggleBtnTextActive]}>
                      Password Login
                    </Text>
                  </View>
                </View>

                {/* Mobile / Email Input Group */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isOtpMode ? "REGISTERED MOBILE NUMBER" : "REGISTERED EMAIL / MOBILE"}
                  </Text>
                  <View style={styles.inputBox}>
                    <Phone color={colors.textSecondary} size={18} />
                    <TextInput
                      style={styles.input}
                      value={mobileOrEmail}
                      onChangeText={setMobileOrEmail}
                      placeholder={isOtpMode ? "+91 98300 00000" : "name@company.com"}
                      placeholderTextColor={colors.textMuted}
                      keyboardType={isOtpMode ? "phone-pad" : "email-address"}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* OTP Mode Actions & Code Input */}
                {isOtpMode ? (
                  <>
                    {!otpSent ? (
                      <TouchableOpacity
                        style={[styles.sendOtpBtn, isSendingOtp && styles.btnDisabled]}
                        onPress={handleSendOtp}
                        disabled={isSendingOtp}
                        activeOpacity={0.8}
                      >
                        {isSendingOtp ? (
                          <>
                            <ActivityIndicator size="small" color={colors.white} />
                            <Text style={styles.sendOtpBtnText}>Sending OTP...</Text>
                          </>
                        ) : (
                          <>
                            <KeyRound color={colors.white} size={16} />
                            <Text style={styles.sendOtpBtnText}>Send OTP</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <>
                        <View style={styles.inputGroup}>
                          <View style={styles.labelRow}>
                            <Text style={styles.inputLabel}>ENTER 6-DIGIT OTP</Text>
                            <TouchableOpacity
                              onPress={handleResendOtp}
                              disabled={timer > 0 || isResendingOtp}
                              style={styles.resendTouch}
                            >
                              {isResendingOtp ? (
                                <ActivityIndicator size="small" color={colors.crimson} style={{ transform: [{ scale: 0.75 }] }} />
                              ) : (
                                <RefreshCw color={timer > 0 ? colors.textMuted : colors.crimson} size={12} />
                              )}
                              <Text style={[styles.resendText, (timer > 0 || isResendingOtp) && styles.resendTextDisabled]}>
                                {isResendingOtp ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <View style={styles.inputBox}>
                            <Lock color={colors.textSecondary} size={18} />
                            <TextInput
                              style={[styles.input, styles.otpInputText]}
                              value={otpOrPassword}
                              onChangeText={setOtpOrPassword}
                              placeholder="123456"
                              placeholderTextColor={colors.textMuted}
                              keyboardType="numeric"
                              maxLength={6}
                              editable={!isLoggingIn}
                            />
                          </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                          style={[styles.primaryLoginBtn, isLoggingIn && styles.btnDisabled]}
                          onPress={handleStandardLogin}
                          disabled={isLoggingIn}
                          activeOpacity={0.8}
                        >
                          {isLoggingIn ? (
                            <>
                              <ActivityIndicator size="small" color={colors.white} />
                              <Text style={styles.primaryBtnText}>Verifying & Signing In...</Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.primaryBtnText}>Verify & Enter Council Desk</Text>
                              <ArrowRight color={colors.white} size={18} />
                            </>
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Password Input Group */}
                    <View style={styles.inputGroup}>
                      <View style={styles.labelRow}>
                        <Text style={styles.inputLabel}>PASSWORD</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                          <Text style={styles.forgotText}>Forgot?</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.inputBox}>
                        <Lock color={colors.textSecondary} size={18} />
                        <TextInput
                          style={styles.input}
                          value={otpOrPassword}
                          onChangeText={setOtpOrPassword}
                          placeholder="••••••••"
                          placeholderTextColor={colors.textMuted}
                          secureTextEntry
                          editable={!isLoggingIn}
                        />
                      </View>
                    </View>

                    {/* Password Sign In Submit */}
                    <TouchableOpacity
                      style={[styles.primaryLoginBtn, isLoggingIn && styles.btnDisabled]}
                      onPress={handleStandardLogin}
                      disabled={isLoggingIn}
                      activeOpacity={0.8}
                    >
                      {isLoggingIn ? (
                        <>
                          <ActivityIndicator size="small" color={colors.white} />
                          <Text style={styles.primaryBtnText}>Signing In...</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.primaryBtnText}>Sign In</Text>
                          <ArrowRight color={colors.white} size={18} />
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </BlurView>
            </View>

            {/* Bottom Section: Apply for Council Membership CTA & Footer Help */}
            <View style={styles.bottomContainer}>
              {/* Apply for Council Membership CTA with Frosted Glass Effect */}
              <BlurView
                intensity={Platform.OS === 'ios' ? 70 : 85}
                tint="light"
                style={styles.signupBox}
              >
                <View style={styles.signupTextCol}>
                  <Users2 color={colors.crimson} size={20} />
                  <View style={styles.signupDetails}>
                    <Text style={styles.signupTitle}>New to Curated Table?</Text>
                    <Text style={styles.signupSubtitle}>
                      Register for membership, get your digital visiting card, and join local chapters.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.signUpBtn}
                  onPress={() => navigation.navigate('SignUp')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signUpBtnText}>Register / Apply for Membership</Text>
                </TouchableOpacity>

                {/* Footer Assistance */}
                <View style={styles.footerHelp}>
                  <Text style={styles.helpText}>
                    Need help? Call <Text style={styles.helpHighlight}>+91 (033) 4000-8800</Text> or email <Text style={styles.helpHighlight}>founders@credovation.com</Text>
                  </Text>
                </View>
              </BlurView>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.92,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(244, 246, 249, 0.38)',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 24,
  },
  topContainer: {
    width: '100%',
  },
  bottomContainer: {
    width: '100%',
    marginTop: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  loginEmblemWrapper: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#07101E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  loginEmblemImage: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  brandLogoBox: {
    marginBottom: 14,
  },
  crestBadge: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  crestBadgeText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 13,
  },
  councilTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  councilMotto: {
    fontSize: 10,
    color: colors.crimson,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.crimsonLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    gap: 6,
    marginBottom: 10,
  },
  badgePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.5,
  },
  welcomeHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  formCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.78)' : 'rgba(255, 255, 255, 0.68)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#0B192C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.75)',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.75)',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  toggleBtnDisabled: {
    opacity: 0.45,
  },
  toggleBtnTextDisabled: {
    color: colors.textMuted,
  },
  toggleBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleBtnTextActive: {
    color: colors.crimson,
    fontWeight: '700',
  },
  presetsContainer: {
    marginBottom: 12,
  },
  presetsLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  presetsScroll: {
    gap: 6,
  },
  presetChip: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetChipSelected: {
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimsonBorder,
  },
  presetChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetChipTextSelected: {
    color: colors.crimson,
  },
  presetChipSub: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
  inputGroup: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  resendTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.crimson,
  },
  resendTextDisabled: {
    color: colors.textMuted,
  },
  forgotText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.85)',
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13.5,
  },
  otpInputText: {
    letterSpacing: 4,
    fontWeight: '800',
    color: colors.crimson,
  },
  sendOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
    gap: 8,
  },
  sendOtpBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    marginBottom: 12,
    gap: 8,
  },
  otpBannerTextCol: {
    flex: 1,
  },
  otpBannerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.emerald,
    letterSpacing: 0.5,
  },
  otpBannerCode: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 1,
  },
  boldText: {
    fontWeight: '800',
    color: colors.emerald,
  },
  primaryLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 6,
    gap: 8,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnDisabled: {
    opacity: 0.75,
  },
  signupBox: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.78)' : 'rgba(255, 255, 255, 0.68)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#0B192C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 16,
    gap: 14,
  },
  signupTextCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  signupDetails: {
    flex: 1,
  },
  signupTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  signupSubtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  signUpBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signUpBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  footerHelp: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  helpHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
});
