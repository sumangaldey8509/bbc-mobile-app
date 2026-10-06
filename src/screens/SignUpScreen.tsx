import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  CheckCircle,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import { PremiumToast, ToastType } from '../components/PremiumToast';

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { register } = useApp();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Step 1: Leadership Profile
  const [fullName, setFullName] = useState('Anirban Roychowdhury');
  const [designation, setDesignation] = useState('Managing Director & CEO');
  const [phone, setPhone] = useState('+91 98305 67890');
  const [email, setEmail] = useState('anirban@roychowdhuryengg.com');
  const [chapter, setChapter] = useState('Kolkata Central Chapter');

  // Step 2: Enterprise & GST
  const [companyName, setCompanyName] = useState('Roychowdhury Precision Engineering Pvt Ltd');
  const [industry, setIndustry] = useState('Heavy Machinery & Precision Fabrication');
  const [gstNumber, setGstNumber] = useState('19AABCR8901F1Z2');
  const [turnover, setTurnover] = useState('₹ 25 Cr - ₹ 50 Cr');
  const [location, setLocation] = useState('Howrah Industrial Estate, WB');
  const [website, setWebsite] = useState('https://roychowdhuryengg.in');

  // Step 3: Sponsorship & Charter
  const [inviteCode, setInviteCode] = useState('BBC-KOL-EXEC-2026');
  const [sponsorName, setSponsorName] = useState('Rajiv Debnath (Haldia Petro-Chem)');
  const [hasCapabilitiesDoc, setHasCapabilitiesDoc] = useState(true);
  const [agreeCharter, setAgreeCharter] = useState(true);

  const chapters = [
    'Kolkata Central Chapter',
    'North Bengal & Siliguri Chapter',
    'Durgapur Industrial Chapter',
    'Haldia Port & Petrochemical Chapter',
    'Howrah Foundry Chapter',
  ];

  const turnoverBrackets = [
    '₹ 5 Cr - ₹ 10 Cr',
    '₹ 10 Cr - ₹ 25 Cr',
    '₹ 25 Cr - ₹ 50 Cr',
    '₹ 50 Cr - ₹ 100 Cr',
    '₹ 100 Cr+',
  ];

  const handleFillDemoData = () => {
    setFullName('Siddhartha Ghosh');
    setCompanyName('Bengal Green Energy & Solar Infra Ltd');
    setDesignation('Chairman & Managing Director');
    setIndustry('Renewable Energy & Solar EPC');
    setChapter('Kolkata Central Chapter');
    setGstNumber('19AAECS9012F1Z8');
    setTurnover('₹ 50 Cr - ₹ 100 Cr');
    setLocation('Eco Centre, Ambuja Neotia, Salt Lake, Kolkata');
    setEmail('siddhartha@bengalgreenenergy.in');
    setPhone('+91 98303 55421');
    setWebsite('https://bengalgreenenergy.in');
    setAgreeCharter(true);
    showToast('success', 'Demo Profile Populated', 'Form filled with demo business owner details.');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!fullName.trim() || !companyName.trim() || !email.trim()) {
        showToast('warning', 'Required Fields Missing', 'Full Name, Company Name, and Official Email are required.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(2);
      }, 400);
    } else if (currentStep === 2) {
      if (!gstNumber.trim()) {
        showToast('warning', 'GST Number Required', 'Please enter your GSTIN or type PENDING.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(3);
      }, 400);
    } else if (currentStep === 3) {
      if (!agreeCharter) {
        showToast('warning', 'Council Agreement Required', 'Please agree to the Council rules.');
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        register({
          name: fullName.trim(),
          companyName: companyName.trim(),
          designation: designation.trim() || 'Managing Director',
          industry: industry.trim() || 'Business Services',
          chapter: chapter,
          gstNumber: gstNumber.trim().toUpperCase(),
          turnover: turnover,
          location: location.trim() || 'Kolkata, West Bengal',
          bio: `Business leader in ${industry || 'Commerce'} representing Bengal enterprise.`,
          membershipTier: 'Executive Member',
          contact: {
            email: email.trim(),
            phone: phone.trim(),
            website: website.trim(),
            officeAddress: location,
          },
        });
        setIsSubmitting(false);
        showToast(
          'success',
          'Welcome to Curated Table! 🎉',
          `Your membership application for ${fullName} has been created.`
        );
      }, 1000);
    }
  };

  return (
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header Bar with Back */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => {
              if (currentStep > 1) {
                setCurrentStep((currentStep - 1) as 1 | 2);
              } else {
                navigation.navigate('Login');
              }
            }}>
              <ArrowLeft color={colors.primary} size={20} />
            </TouchableOpacity>

            <BrandLogo size="small" showTagline={true} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.stepsRow}>
              <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, currentStep >= 1 && styles.stepDotTextActive]}>1</Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, currentStep >= 2 && styles.stepDotTextActive]}>2</Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
              <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, currentStep >= 3 && styles.stepDotTextActive]}>3</Text>
              </View>
            </View>

            <View style={styles.stepLabelsRow}>
              <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>1. Profile</Text>
              <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>2. Business & GST</Text>
              <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>3. Agreement</Text>
            </View>
          </View>

          {/* Quick Demo Pre-fill */}
          <TouchableOpacity
            style={styles.quickFillBtn}
            onPress={() => {
              setFullName('Sourav Ganguly & Partners');
              setDesignation('Chairman & Principal');
              setPhone('+91 98310 99887');
              setEmail('sourav@bengalsportsventures.com');
              setChapter('Kolkata Central Chapter');
              setCompanyName('Bengal Sports & Infrastructure Consortium');
              setIndustry('Sports Infrastructure & Real Estate');
              setGstNumber('19AAACS7766K1Z9');
              setTurnover('₹ 50 Cr - ₹ 100 Cr');
              setLocation('Alipore Park Road, Kolkata, WB');
              setInviteCode('BBC-FOUNDER-2026');
              setSponsorName('Rajiv Debnath (Haldia Petro-Chem)');
              Alert.alert('Demo Details Filled', 'Form has been filled with sample business details. Tap Continue to submit!');
            }}
          >
            <Text style={styles.quickFillText}>⚡ Fill Demo Details (Sourav Ganguly & Partners)</Text>
          </TouchableOpacity>

          {/* STEP 1: Leadership Profile */}
          {currentStep === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Profile Details</Text>
              <Text style={styles.cardSubtitle}>
                Enter your name, job title, and contact details for the member directory.
              </Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Anirban Roychowdhury"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Designation */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>JOB TITLE / ROLE</Text>
                <TextInput
                  style={styles.input}
                  value={designation}
                  onChangeText={setDesignation}
                  placeholder="e.g. Managing Director / Founder / CEO"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Contact Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                <View style={styles.inputBox}>
                  <Phone color={colors.textSecondary} size={16} />
                  <TextInput
                    style={styles.innerInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 98300 00000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputBox}>
                  <Mail color={colors.textSecondary} size={16} />
                  <TextInput
                    style={styles.innerInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@company.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Chapter Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SELECT YOUR LOCAL CHAPTER</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {chapters.map(ch => {
                    const isSelected = chapter === ch;
                    return (
                      <TouchableOpacity
                        key={ch}
                        style={[styles.pill, isSelected && styles.pillActive]}
                        onPress={() => setChapter(ch)}
                      >
                        <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                          {ch.replace(' Chapter', '')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          )}

          {/* STEP 2: Enterprise & GST Verification */}
          {currentStep === 2 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Business & GST Details</Text>
              <Text style={styles.cardSubtitle}>
                A verified GST number helps members trust and do business with your company.
              </Text>

              {/* Company Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>COMPANY / BUSINESS NAME</Text>
                <TextInput
                  style={styles.input}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="e.g. Roychowdhury Precision Engineering Pvt Ltd"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Primary Industry */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>BUSINESS INDUSTRY / SECTOR</Text>
                <TextInput
                  style={styles.input}
                  value={industry}
                  onChangeText={setIndustry}
                  placeholder="e.g. Heavy Machinery, Tea, Healthcare, Textiles, IT..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* GST Number */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>GST NUMBER (STARTS WITH 19)</Text>
                  <View style={styles.gstTag}>
                    <ShieldCheck color={colors.emerald} size={12} />
                    <Text style={styles.gstTagText}>Verified</Text>
                  </View>
                </View>
                <TextInput
                  style={[styles.input, styles.gstInput]}
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  placeholder="19AAAAA0000A1Z5"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />
              </View>

              {/* Turnover Brackets */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ANNUAL BUSINESS TURNOVER</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {turnoverBrackets.map(br => {
                    const isSelected = turnover === br;
                    return (
                      <TouchableOpacity
                        key={br}
                        style={[styles.pill, isSelected && styles.pillActive]}
                        onPress={() => setTurnover(br)}
                      >
                        <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                          {br}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Office Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>OFFICE / FACTORY ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Howrah Industrial Estate, Kolkata"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          )}

          {/* STEP 3: Council Sponsorship & Charter */}
          {currentStep === 3 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Invite & Council Agreement</Text>
              <Text style={styles.cardSubtitle}>
                Curated Table connects trusted business leaders and executive founders.
              </Text>

              {/* Invite Code */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>INVITE CODE (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  placeholder="e.g. BBC-KOL-2026"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />
              </View>

              {/* Sponsoring Member */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>REFERRED BY (MEMBER NAME)</Text>
                <TextInput
                  style={styles.input}
                  value={sponsorName}
                  onChangeText={setSponsorName}
                  placeholder="e.g. Rajiv Debnath"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Capability Deck Attachment */}
              <TouchableOpacity
                style={[styles.docUploadBox, hasCapabilitiesDoc && styles.docUploadBoxActive]}
                onPress={() => setHasCapabilitiesDoc(!hasCapabilitiesDoc)}
              >
                <FileText color={hasCapabilitiesDoc ? colors.crimson : colors.textMuted} size={22} />
                <View style={styles.docUploadInfo}>
                  <Text style={styles.docUploadTitle}>
                    {hasCapabilitiesDoc ? 'Company_Brochure.pdf' : '+ Attach Company Brochure or PDF (Optional)'}
                  </Text>
                  <Text style={styles.docUploadMeta}>
                    {hasCapabilitiesDoc ? '3.4 MB • Ready to share with members' : 'Max 15 MB (PDF format)'}
                  </Text>
                </View>
                {hasCapabilitiesDoc && <CheckCircle color={colors.emerald} size={18} />}
              </TouchableOpacity>

              {/* Charter Commitment */}
              <TouchableOpacity
                style={styles.charterBox}
                onPress={() => setAgreeCharter(!agreeCharter)}
              >
                <View style={[styles.checkbox, agreeCharter && styles.checkboxActive]}>
                  {agreeCharter && <CheckCircle color={colors.white} size={14} />}
                </View>
                <Text style={styles.charterText}>
                  I confirm that my business is registered in West Bengal, and I agree to work with fellow Council members with honesty and trust.
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.nextBtn, isSubmitting && { opacity: 0.75 }]}
            onPress={handleNext}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.nextBtnText}>
                  {currentStep === 3 ? 'Sending Application...' : 'Checking Details...'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {currentStep === 3 ? 'Complete Registration' : 'Continue'}
                </Text>
                <ArrowRight color={colors.white} size={18} />
              </>
            )}
          </TouchableOpacity>

          {/* Existing Member Sign In Link */}
          <View style={styles.footerSignIn}>
            <Text style={styles.footerSignInText}>Already a member?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerSignInHighlight}> Sign In Here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crestBadge: {
    backgroundColor: colors.crimson,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  crestBadgeText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 11,
  },
  topBarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  progressContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardBgElevated,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  stepDotTextActive: {
    color: colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.crimson,
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: colors.crimson,
    fontWeight: '800',
  },
  quickFillBtn: {
    backgroundColor: colors.crimsonLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.crimsonBorder,
    alignItems: 'center',
    marginBottom: 14,
  },
  quickFillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.crimson,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  gstTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  gstTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.emerald,
  },
  input: {
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13.5,
  },
  gstInput: {
    fontWeight: '700',
    color: colors.emerald,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
    gap: 10,
  },
  innerInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13.5,
  },
  pillScroll: {
    gap: 8,
    marginTop: 4,
  },
  pill: {
    backgroundColor: colors.cardBgElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimson,
  },
  pillText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.crimson,
    fontWeight: '700',
  },
  docUploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10,
    marginBottom: 14,
  },
  docUploadBoxActive: {
    backgroundColor: colors.crimsonLight,
    borderColor: colors.crimsonBorder,
  },
  docUploadInfo: {
    flex: 1,
  },
  docUploadTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  docUploadMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  charterBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBgElevated,
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: colors.cardBg,
  },
  checkboxActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  charterText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 16,
  },
  nextBtnText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerSignIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerSignInText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerSignInHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.crimson,
  },
});
