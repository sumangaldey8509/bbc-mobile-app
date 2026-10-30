import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { getUserTierInfo, TierInfo } from '../utils/userTierBadges';
import { User } from '../types';

export interface UserTierBadgeProps {
  user?: Partial<User> | string | null;
  score?: number;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Renders the member's tier badge icon (Bronze, Silver, Gold, Platinum, Diamond, Elite)
 * placed directly before the user's name: [Badge Icon] [User Name].
 */
export const UserTierBadge: React.FC<UserTierBadgeProps> = ({
  user,
  score,
  size = 18,
  style,
}) => {
  const tierInfo: TierInfo = getUserTierInfo(user, score);

  return (
    <Image
      source={tierInfo.badgeAsset}
      resizeMode="contain"
      accessibilityLabel={`${tierInfo.label} tier badge`}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
};

