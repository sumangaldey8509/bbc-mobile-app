import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showTagline?: boolean;
  taglineText?: string;
  centered?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'medium',
  showTagline = true,
  taglineText = 'by CredoVation Solutions Pvt Ltd',
  centered = false,
  style,
}) => {
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return { title: 16, tagline: 9.5, spacing: 3, letterSpacing: -0.2 };
      case 'medium':
        return { title: 21, tagline: 11, spacing: 4, letterSpacing: -0.3 };
      case 'large':
        return { title: 28, tagline: 12.5, spacing: 5, letterSpacing: -0.5 };
      case 'xlarge':
        return { title: 34, tagline: 13.5, spacing: 7, letterSpacing: -0.6 };
      default:
        return { title: 21, tagline: 11, spacing: 4, letterSpacing: -0.3 };
    }
  };

  const dims = getFontSize();

  return (
    <View style={[styles.container, centered && styles.centered, style]}>
      {/* Wordmark: CURATED TABLE */}
      <View style={styles.logoRow}>
        <Text
          style={[
            styles.curatedWord,
            { fontSize: dims.title, letterSpacing: dims.letterSpacing },
          ]}
        >
          CURATED{' '}
        </Text>
        <Text
          style={[
            styles.tableWord,
            { fontSize: dims.title, letterSpacing: dims.letterSpacing },
          ]}
        >
          TABLE
        </Text>
      </View>

      {/* Powered / Initiative Tagline */}
      {showTagline && (
        <View style={[styles.taglineBox, { marginTop: dims.spacing }]}>
          <View style={styles.taglineBullet} />
          <Text style={[styles.tagline, { fontSize: dims.tagline }]}>
            {taglineText.startsWith('by ') ? (
              <>
                by <Text style={styles.taglineCouncil}>{taglineText.replace(/^by\s+/, '')}</Text>
              </>
            ) : (
              <Text style={styles.taglineCouncil}>{taglineText}</Text>
            )}
          </Text>
          <View style={styles.taglineBullet} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  curatedWord: {
    fontWeight: '900',
    color: '#0B192C', // Deep Executive Navy
  },
  tableWord: {
    fontWeight: '900',
    color: '#D83030', // Official Crimson Red
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taglineBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.crimson,
    opacity: 0.7,
  },
  tagline: {
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  taglineCouncil: {
    color: colors.crimson,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

