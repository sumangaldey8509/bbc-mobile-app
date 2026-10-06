import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  MessageSquare,
  CheckCircle2,
  Copy,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../theme/colors';

interface OtpAlertBannerProps {
  otpCode: string;
  recipient: string;
  timerSeconds: number;
  onCopy?: () => void;
  onAutoFill?: () => void;
}

export const OtpAlertBanner: React.FC<OtpAlertBannerProps> = ({
  otpCode = '123456',
  recipient,
  timerSeconds = 30,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(otpCode);
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const digits = otpCode.split('');

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row with Status & Live Pulse */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>SMS SENT</Text>
        </View>

        <View style={styles.timerBadge}>
          <Clock color={colors.accentBlue} size={11} />
          <Text style={styles.timerText}>
            00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
          </Text>
        </View>
      </View>

      {/* Main Delivery Info */}
      <View style={styles.contentRow}>
        <View style={styles.iconBox}>
          <MessageSquare color={colors.accentBlue} size={20} />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.titleText}>SMS Code Sent (OTP)</Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            Sent to <Text style={styles.recipientText}>{recipient || 'registered mobile'}</Text>
          </Text>
        </View>
      </View>

      {/* High-End 6-Digit OTP Code Tiles */}
      <View style={styles.digitsContainer}>
        {digits.map((digit, index) => (
          <View key={index} style={styles.digitBox}>
            <Text style={styles.digitText}>{digit}</Text>
          </View>
        ))}
      </View>

      {/* Bottom Action & Auto-Fill Pill */}
      <View style={styles.footerRow}>
        <View style={styles.autoFilledPill}>
          <CheckCircle2 color={colors.emerald} size={13} />
          <Text style={styles.autoFilledText}>Auto-filled for quick test</Text>
        </View>

        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copyButtonActive]}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          {copied ? (
            <>
              <CheckCircle2 color={colors.emerald} size={12} />
              <Text style={styles.copyButtonTextActive}>Copied!</Text>
            </>
          ) : (
            <>
              <Copy color={colors.primary} size={12} />
              <Text style={styles.copyButtonText}>Copy Code</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 112, 184, 0.22)',
    shadowColor: '#1D70B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.accentBlue,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.emerald,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.accentBlue,
    letterSpacing: 0.8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accentBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29, 112, 184, 0.2)',
  },
  textColumn: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  subtitleText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recipientText: {
    fontWeight: '700',
    color: colors.primary,
  },
  digitsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 4,
  },
  digitBox: {
    width: 38,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  digitText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  autoFilledPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  autoFilledText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.emerald,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  copyButtonActive: {
    backgroundColor: colors.emeraldLight,
    borderColor: colors.emeraldBorder,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  copyButtonTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald,
  },
});
