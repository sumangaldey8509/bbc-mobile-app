import { colors } from './colors';

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  bodySecondary: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  brandBadge: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.crimson,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
};

export * from './colors';
