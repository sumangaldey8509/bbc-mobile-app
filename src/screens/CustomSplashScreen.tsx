import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface CustomSplashScreenProps {
  onFinish: () => void;
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const logoTextFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Emblem Scale & Fade In
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Text Fade In
    const textTimer = setTimeout(() => {
      Animated.timing(logoTextFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);

    // 3. Progress Bar Fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // 4. Auto Finish & Transition
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07101E" />

      {/* Decorative Glow Elements */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={0.95}
        onPress={onFinish}
      >
        <View style={styles.contentCenter}>
          {/* 3D Crest Emblem */}
          <Animated.View
            style={[
              styles.emblemContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.emblemGlowAura} />
            <Image
              source={require('../../assets/curated-table-app-icon.jpg')}
              style={styles.emblemImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Animated Brand Typography */}
          <Animated.View
            style={[
              styles.brandSection,
              {
                opacity: logoTextFade,
              },
            ]}
          >
            <View style={styles.wordmarkRow}>
              <Text style={styles.curatedWord}>CURATED </Text>
              <Text style={styles.tableWord}>TABLE</Text>
            </View>

            <View style={styles.taglineBox}>
              <View style={styles.taglineDot} />
              <Text style={styles.taglineText}>
                by <Text style={styles.councilName}>CredoVation Solutions Pvt Ltd</Text>
              </Text>
              <View style={styles.taglineDot} />
            </View>

            <Text style={styles.sloganText}>
              Exclusive Community • Empowering Leaders
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Loading Progress & Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>

          <Text style={styles.footerNote}>
            Verified Executive Community
          </Text>

          <Text style={styles.skipHintText}>Tap anywhere to enter</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07101E', // Executive Deep Night
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    width: width * 1.2,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(216, 48, 48, 0.12)', // Subtle Crimson Glow
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -100,
    width: width * 1.1,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(29, 112, 184, 0.14)', // Subtle Corporate Blue Glow
  },
  touchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emblemContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emblemGlowAura: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 88,
    backgroundColor: 'rgba(216, 48, 48, 0.25)',
  },
  emblemImage: {
    width: 150,
    height: 150,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  brandSection: {
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  curatedWord: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tableWord: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E63946', // Vibrant Crimson
    letterSpacing: 0.5,
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E63946',
  },
  taglineText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  councilName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sloganText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  footerContainer: {
    width: '100%',
    paddingHorizontal: 36,
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E63946',
    borderRadius: 2,
  },
  footerNote: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  skipHintText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
