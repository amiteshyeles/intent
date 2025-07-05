import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#6B73FF',
  primaryLight: '#8B91FF',
  primaryDark: '#4A52CC',
  secondary: '#3498DB',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  
  // Grays
  dark: '#2C3E50',
  darkSecondary: '#34495E',
  medium: '#7F8C8D',
  light: '#95A5A6',
  lighter: '#BDC3C7',
  lightest: '#ECF0F1',
  
  // Backgrounds
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  
  // Question type colors
  gratitude: '#E74C3C',
  productivity: '#3498DB',
  mindfulness: '#9B59B6',
  default: '#95A5A6',
};

export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: colors.dark,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
    color: colors.dark,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    color: colors.dark,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.dark,
  },
  h5: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: colors.dark,
  },
  h6: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: colors.dark,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.dark,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.medium,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.light,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
};

export const globalStyles = StyleSheet.create({
  // Headers
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.surface,
  },
  headerSubtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerButton: {
    padding: spacing.sm,
    minWidth: 40,
    alignItems: 'center',
  },
  
  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h5,
    flex: 1,
  },
  cardSubtitle: {
    ...typography.body2,
    marginBottom: spacing.sm,
  },
  
  // Lists
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  listHeader: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  listHeaderText: {
    ...typography.h4,
    marginBottom: 4,
  },
  listHeaderSubtext: {
    ...typography.body2,
  },
  list: {
    paddingBottom: 100,
  },
  
  // List Items
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listItemSelected: {
    borderColor: colors.secondary,
    backgroundColor: '#EBF3FD',
  },
  listItemAdded: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.success,
  },
  listItemDisabled: {
    backgroundColor: colors.surfaceSecondary,
    opacity: 0.7,
  },
  
  // Buttons
  button: {
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonText: {
    ...typography.button,
    color: colors.surface,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // Small buttons
  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  
  // Inputs
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.lightest,
    ...shadows.sm,
  },
  inputLabel: {
    ...typography.h6,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.lightest,
    borderRadius: borderRadius.sm,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    ...typography.body2,
    fontWeight: '500',
    color: colors.medium,
  },
  tabTextActive: {
    color: colors.dark,
    fontWeight: '600',
  },
  
  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyStateTitle: {
    ...typography.h3,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyStateDescription: {
    ...typography.body1,
    color: colors.medium,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primary,
  },
  
  // Safe areas
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Badges
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: spacing.xs,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.surface,
    textTransform: 'capitalize',
  },
  
  // Selection
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  
  // Action bars
  actionBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightest,
  },
});

export default globalStyles; 