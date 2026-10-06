import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showTagline?: boolean;
  taglineText?: string;
  centered?: boolean;
  showLogoImage?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'medium',
  showTagline = true,
  taglineText = 'by Credovation Solutions Pvt Ltd',
  centered = false,
  showLogoImage = true,
  style,
}) => {
  const getDims = () => {
    switch (size) {
      case 'small':
        return {
          imgSize: 28,
          bbcSize: 15,
          councilSize: 12,
          tagline: 8.5,
          spacing: 2,
          gap: 7,
        };
      case 'medium':
        return {
          imgSize: 38,
          bbcSize: 20,
          councilSize: 14,
          tagline: 10,
          spacing: 3,
          gap: 9,
        };
      case 'large':
        return {
          imgSize: 64,
          bbcSize: 26,
          councilSize: 18,
          tagline: 11.5,
          spacing: 4,
          gap: 12,
        };
      case 'xlarge':
        return {
          imgSize: 84,
          bbcSize: 32,
          councilSize: 22,
          tagline: 13,
          spacing: 6,
          gap: 14,
        };
      default:
        return {
          imgSize: 38,
          bbcSize: 20,
          councilSize: 14,
          tagline: 10,
          spacing: 3,
          gap: 9,
        };
    }
  };

  const dims = getDims();
  const isStacked = centered && (size === 'large' || size === 'xlarge');

  return (
    <View style={[styles.container, centered && styles.centered, style]}>
      <View style={[styles.logoRow, isStacked && styles.logoColumn]}>
        {showLogoImage && (
          <Image
            source={require('../../assets/bbc-logo.jpeg')}
            style={[
              styles.logoImage,
              {
                width: dims.imgSize,
                height: dims.imgSize,
                borderRadius: Math.max(6, dims.imgSize * 0.2),
              },
            ]}
            resizeMode="contain"
          />
        )}

        <View style={[styles.textCol, centered && styles.textColCentered]}>
          <View style={styles.titleRow}>
            <Text style={[styles.bbcWord, { fontSize: dims.bbcSize }]}>BBC</Text>
            <Text style={styles.titleDivider}>•</Text>
            <Text style={[styles.councilWord, { fontSize: dims.councilSize }]}>
              BENGAL BUSINESS COUNCIL
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
            </View>
          )}
        </View>
      </View>
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
    gap: 10,
  },
  logoColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    backgroundColor: '#FFFFFF',
  },
  textCol: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  textColCentered: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bbcWord: {
    fontWeight: '900',
    color: '#D83030', // Official BBC Crimson Red
    letterSpacing: 0.5,
  },
  titleDivider: {
    color: colors.cardBorder,
    fontSize: 12,
    fontWeight: '800',
  },
  councilWord: {
    fontWeight: '800',
    color: '#0B192C', // Deep Executive Navy
    letterSpacing: 0.2,
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  taglineBullet: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: colors.crimson,
    opacity: 0.8,
  },
  tagline: {
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  taglineCouncil: {
    color: colors.crimson,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

