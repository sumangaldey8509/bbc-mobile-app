import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface PremiumToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const PremiumToast: React.FC<PremiumToastProps> = ({
  visible,
  type = 'info',
  title,
  message,
  onDismiss,
  duration = 4000,
}) => {
  const insets = useSafeAreaInsets();
  const topOffset = Math.max(insets.top, Platform.OS === 'android' ? 36 : 16) + 12;
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: colors.emerald,
          bgColor: '#F0FDF4',
          borderColor: 'rgba(5, 150, 105, 0.3)',
          accentColor: colors.emerald,
          badge: 'SUCCESS',
        };
      case 'error':
        return {
          icon: XCircle,
          iconColor: colors.crimson,
          bgColor: '#FEF2F2',
          borderColor: 'rgba(216, 48, 48, 0.3)',
          accentColor: colors.crimson,
          badge: 'NOTICE',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: '#D97706',
          bgColor: '#FFFBEB',
          borderColor: 'rgba(217, 119, 6, 0.3)',
          accentColor: '#D97706',
          badge: 'ATTENTION',
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconColor: colors.accentBlue,
          bgColor: '#F0F7FF',
          borderColor: 'rgba(29, 112, 184, 0.3)',
          accentColor: colors.accentBlue,
          badge: 'UPDATE',
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          top: topOffset,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            borderLeftColor: config.accentColor,
          },
        ]}
      >
        <View style={styles.iconBox}>
          <IconComponent color={config.iconColor} size={20} />
        </View>

        <View style={styles.contentCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.badgeText, { color: config.accentColor }]}>
              {config.badge}
            </Text>
            <Text style={styles.titleText}>{title}</Text>
          </View>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <X color={colors.textSecondary} size={16} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  iconBox: {
    marginRight: 10,
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
    paddingRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  messageText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    marginTop: -2,
    marginRight: -2,
  },
});
