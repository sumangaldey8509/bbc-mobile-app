import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { getInitials, colorForName } from '../utils/initials';

interface Props {
  name: string;
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shows the member's photo when available, otherwise their initials. */
export const InitialsAvatar: React.FC<Props> = ({ name, uri, size = 44, style }) => {
  const dim = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <View style={[dim, styles.clip, style]}>
        <Image source={{ uri }} style={styles.image} />
      </View>
    );
  }

  return (
    <View style={[dim, styles.fallback, { backgroundColor: colorForName(name) }, style]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', backgroundColor: colors.primaryLight },
  image: { width: '100%', height: '100%' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.white, fontWeight: '800', letterSpacing: 0.5 },
});
