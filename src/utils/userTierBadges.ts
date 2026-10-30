import { ImageSourcePropType } from 'react-native';
import { User } from '../types';

export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'elite';

export interface TierInfo {
  tier: TierLevel;
  label: string;
  minScore: number;
  maxScore: number | null;
  badgeAsset: ImageSourcePropType;
  color: string;
  glowColor: string;
  bgColor: string;
}

export const TIER_CONFIGS: Record<TierLevel, TierInfo> = {
  bronze: {
    tier: 'bronze',
    label: 'Bronze',
    minScore: 0,
    maxScore: 9,
    badgeAsset: require('../../assets/badges/bronze_badge.png'),
    color: '#CD7F32',
    glowColor: 'rgba(205, 127, 50, 0.35)',
    bgColor: 'rgba(205, 127, 50, 0.12)',
  },
  silver: {
    tier: 'silver',
    label: 'Silver',
    minScore: 10,
    maxScore: 19,
    badgeAsset: require('../../assets/badges/silver_badge.png'),
    color: '#A8A8A8',
    glowColor: 'rgba(168, 168, 168, 0.35)',
    bgColor: 'rgba(168, 168, 168, 0.12)',
  },
  gold: {
    tier: 'gold',
    label: 'Gold',
    minScore: 20,
    maxScore: 29,
    badgeAsset: require('../../assets/badges/gold_badge.png'),
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    bgColor: 'rgba(245, 158, 11, 0.14)',
  },
  platinum: {
    tier: 'platinum',
    label: 'Platinum',
    minScore: 30,
    maxScore: 39,
    badgeAsset: require('../../assets/badges/platinum_badges.png'),
    color: '#0EA5E9',
    glowColor: 'rgba(14, 165, 233, 0.45)',
    bgColor: 'rgba(14, 165, 233, 0.14)',
  },
  diamond: {
    tier: 'diamond',
    label: 'Diamond',
    minScore: 40,
    maxScore: 49,
    badgeAsset: require('../../assets/badges/diamond_badges.png'),
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    bgColor: 'rgba(6, 182, 212, 0.15)',
  },
  elite: {
    tier: 'elite',
    label: 'Elite',
    minScore: 50,
    maxScore: null,
    badgeAsset: require('../../assets/badges/elite_badges.png'),
    color: '#E11D48',
    glowColor: 'rgba(225, 29, 72, 0.5)',
    bgColor: 'rgba(225, 29, 72, 0.15)',
  },
};

/**
 * Maps any score to its tier definition.
 * 0 - 9: bronze
 * 10 - 19: silver
 * 20 - 29: gold
 * 30 - 39: platinum
 * 40 - 49: diamond
 * 50+: elite
 */
export function getTierByScore(score: number): TierInfo {
  if (score >= 50) return TIER_CONFIGS.elite;
  if (score >= 40) return TIER_CONFIGS.diamond;
  if (score >= 30) return TIER_CONFIGS.platinum;
  if (score >= 20) return TIER_CONFIGS.gold;
  if (score >= 10) return TIER_CONFIGS.silver;
  return TIER_CONFIGS.bronze;
}

/**
 * Known curated dummy scores for standard mock members so all 6 tiers are visualized:
 * 0 - 9:   Bronze
 * 10 - 19: Silver
 * 20 - 29: Gold
 * 30 - 39: Platinum
 * 40 - 49: Diamond
 * 50+:     Elite
 */
const KNOWN_USER_SCORES: Record<string, number> = {
  user_me: 55, // Elite badge
  user_1: 45,  // Diamond badge
  user_2: 35,  // Platinum badge
  user_3: 25,  // Gold badge
  user_4: 15,  // Silver badge
  user_5: 5,   // Bronze badge
  user_6: 28,  // Gold badge
  'Subrata Mukherjee': 55,
  'Ananya Roy': 45,
  'Debashis Ganguly': 35,
  'Souvik Sen': 25,
  'Priyanka Banerjee': 15,
  'Arnab Bhattacharya': 5,
  'Rajesh Agarwal': 28,
};

/**
 * Generates a deterministic dummy score based on a string seed (e.g. user id or name).
 */
function computeDeterministicScore(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 60;
}

/**
 * Retrieves the score for a user.
 * Uses user.score if provided, then known mock score mapping, then a deterministic fallback.
 */
export function getUserScore(user?: Partial<User> | string | null): number {
  if (!user) return 15;

  if (typeof user === 'string') {
    if (KNOWN_USER_SCORES[user] !== undefined) return KNOWN_USER_SCORES[user];
    return computeDeterministicScore(user);
  }

  if (typeof (user as any).score === 'number') {
    return (user as any).score;
  }

  const id = user.id ? String(user.id) : '';
  if (id && KNOWN_USER_SCORES[id] !== undefined) {
    return KNOWN_USER_SCORES[id];
  }

  return computeDeterministicScore(id || user.name || 'member');
}

/**
 * Returns the tier metadata (tier level, badge asset, label, color) for a user.
 */
export function getUserTierInfo(user?: Partial<User> | string | null, explicitScore?: number): TierInfo {
  const score = explicitScore !== undefined ? explicitScore : getUserScore(user);
  return getTierByScore(score);
}

/**
 * Calculates the exact positioning and size for the badge attached to an avatar.
 */
export function getAttachedBadgeLayout(avatarSize: number) {
  const badgeSize = Math.max(16, Math.min(34, Math.round(avatarSize * 0.42)));
  const offset = Math.round(badgeSize * 0.14);

  return {
    badgeSize,
    bottom: -offset,
    right: -offset,
  };
}

