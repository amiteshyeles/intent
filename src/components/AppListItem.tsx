import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppListItemProps } from '../types';
import { globalStyles, colors, spacing, borderRadius, typography } from '../styles/globalStyles';

const AppListItem: React.FC<AppListItemProps> = ({
  app,
  onToggle,
  onSettings,
  onEdit,
  onDelete,
}) => {
  const handlePress = () => {
    onSettings(app.id);
  };

  const handleToggle = (value: boolean) => {
    onToggle(app.id, value);
  };

  const getLastUsedText = () => {
    if (!app.lastLaunched) return 'Never used';
    
    const now = new Date();
    const diff = now.getTime() - app.lastLaunched.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getQuestionTypeColor = () => {
    switch (app.questionsType) {
      case 'gratitude': return colors.gratitude;
      case 'productivity': return colors.productivity;
      case 'mindfulness': return colors.mindfulness;
      default: return colors.default;
    }
  };

  return (
    <TouchableOpacity
      style={[globalStyles.listItem, !app.isEnabled && globalStyles.listItemDisabled, styles.container]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={app.icon as any}
            size={18}
            color={app.isEnabled ? colors.primary : colors.light}
          />
        </View>
        
        <View style={styles.appInfo}>
          <Text style={[styles.appName, !app.isEnabled && styles.disabledText]}>
            {app.name}
          </Text>
          
          <View style={styles.appDetails}>
            <View
              style={[
                globalStyles.badge,
                { backgroundColor: getQuestionTypeColor() }
              ]}
            >
              <Text style={globalStyles.badgeText}>
                {app.questionsType}
              </Text>
            </View>
            
            <Text style={styles.detailsText}>
              {app.delaySeconds}s • {app.launchCount || 0} launches
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Switch
          value={app.isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.lightest, true: colors.secondary }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.lightest}
          style={styles.switch}
        />
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handlePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.light} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    ...typography.h5,
    marginBottom: 2,
  },
  disabledText: {
    color: colors.light,
  },
  appDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    ...typography.caption,
    color: colors.light,
  },
  rightSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  settingsButton: {
    padding: spacing.xs,
  },
});

export default AppListItem; 