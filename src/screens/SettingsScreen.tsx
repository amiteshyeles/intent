import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { NavigationScreens } from '../types';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/globalStyles';

type SettingsScreenProps = StackScreenProps<NavigationScreens, 'Settings'>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const settingsOptions = [
    {
      title: 'Productive Apps',
      subtitle: 'Choose alternatives to suggest',
      icon: 'apps-outline',
      onPress: () => navigation.navigate('ProductiveAppsSettings'),
    },
    // Add more settings options here in the future
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name={option.icon as any} size={24} color={colors.primary} />
              </View>
              
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              
              <View style={styles.settingArrow}>
                <Ionicons name="chevron-forward" size={20} color={colors.light} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.medium,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightest,
    ...shadows.sm,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.lightest,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    ...typography.body2,
    color: colors.medium,
  },
  settingArrow: {
    marginLeft: spacing.sm,
  },
});

export default SettingsScreen;
