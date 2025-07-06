import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TimerPickerModal } from 'react-native-timer-picker';
import { NavigationScreens, AppConfig } from '../types';
import StorageService from '../services/StorageService';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/globalStyles';

type AppSettingsScreenProps = StackScreenProps<NavigationScreens, 'AppSettings'>;

const AppSettingsScreen: React.FC<AppSettingsScreenProps> = ({
  route,
  navigation,
}) => {
  const { appId } = route.params;
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings state
  const [timerLength, setTimerLength] = useState(60);
  const [allowBypass, setAllowBypass] = useState(true);
  const [bypassAfterSeconds, setBypassAfterSeconds] = useState(10);
  const [questionsType, setQuestionsType] = useState<'default' | 'gratitude' | 'productivity' | 'mindfulness'>('default');

  // Original values for change tracking
  const [originalTimerLength, setOriginalTimerLength] = useState(60);
  const [originalAllowBypass, setOriginalAllowBypass] = useState(true);
  const [originalBypassAfterSeconds, setOriginalBypassAfterSeconds] = useState(10);
  const [originalQuestionsType, setOriginalQuestionsType] = useState<'default' | 'gratitude' | 'productivity' | 'mindfulness'>('default');

  // Modal state
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [showBypassPicker, setShowBypassPicker] = useState(false);

  const storage = StorageService.getInstance();

  const loadAppConfig = async () => {
    try {
      const config = await storage.getAppConfig(appId);
      if (!config) {
        Alert.alert('Error', 'App configuration not found', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }
      
      setAppConfig(config);
      
      // Set current values
      setTimerLength(config.delaySeconds);
      setAllowBypass(config.allowBypass);
      setBypassAfterSeconds(config.bypassAfterSeconds || 10);
      setQuestionsType(config.questionsType);
      
      // Set original values for change tracking
      setOriginalTimerLength(config.delaySeconds);
      setOriginalAllowBypass(config.allowBypass);
      setOriginalBypassAfterSeconds(config.bypassAfterSeconds || 10);
      setOriginalQuestionsType(config.questionsType);
    } catch (error) {
      console.error('Failed to load app config:', error);
      Alert.alert('Error', 'Failed to load app settings');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      timerLength !== originalTimerLength ||
      allowBypass !== originalAllowBypass ||
      bypassAfterSeconds !== originalBypassAfterSeconds ||
      questionsType !== originalQuestionsType
    );
  };

  const handleSave = async () => {
    if (!appConfig || !hasChanges()) return;
    
    setIsSaving(true);
    try {
      const updatedConfig: AppConfig = {
        ...appConfig,
        delaySeconds: timerLength,
        allowBypass,
        bypassAfterSeconds,
        questionsType,
        updatedAt: new Date(),
      };
      
      await storage.saveAppConfig(updatedConfig);
      setAppConfig(updatedConfig);
      
      // Navigate back to dashboard
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Failed to save app config:', error);
      Alert.alert('Error', 'Failed to save app settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadAppConfig();
  }, [appId]);

  useEffect(() => {
    // Set header options
    navigation.setOptions({
      headerTitle: appConfig ? `${appConfig.name} Settings` : 'App Settings',
      headerBackTitle: 'Back',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.dark,
      headerTitleStyle: {
        ...typography.h6,
        fontWeight: '600',
      },
      headerRight: () => (
        <TouchableOpacity
          style={[styles.saveButton, !hasChanges() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !hasChanges()}
        >
          <Text style={[
            styles.saveButtonText,
            isSaving && styles.savingText,
            !hasChanges() && styles.saveButtonTextDisabled
          ]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, appConfig, isSaving, hasChanges, handleSave]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes}m`;
      } else {
        return `${minutes}m ${remainingSeconds}s`;
      }
    }
  };

  const showInfoAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const handleTimerLengthSelect = () => {
    setShowTimerPicker(true);
  };

  const handleBypassTimingSelect = () => {
    setShowBypassPicker(true);
  };

  const getQuestionTypeColor = (type: string): string => {
    switch (type) {
      case 'gratitude': return colors.gratitude || '#E67E22';
      case 'productivity': return colors.productivity || '#3498DB';
      case 'mindfulness': return colors.mindfulness || '#27AE60';
      default: return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appConfig) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>App not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appIconContainer}>
            <Ionicons name={appConfig.icon as any} size={28} color={colors.primary} />
          </View>
          <View style={styles.appInfoText}>
            <Text style={styles.appName}>{appConfig.name}</Text>
            <Text style={styles.appStats}>
              {appConfig.launchCount || 0} launches • Last used{' '}
              {appConfig.lastLaunched 
                ? new Date(appConfig.lastLaunched).toLocaleDateString()
                : 'never'
              }
            </Text>
          </View>
        </View>

        {/* Timer Length Section */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleRow}>
                  <Text style={styles.settingLabel}>Timer Length</Text>
                  <TouchableOpacity 
                    onPress={() => showInfoAlert('Timer Length', 'How long to pause before showing the reflection question')}
                    style={styles.helpButton}
                  >
                    <Ionicons name="help-circle-outline" size={16} color={colors.light} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={handleTimerLengthSelect}
              >
                <Text style={styles.selectButtonText}>{formatTime(timerLength)}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.light} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Bypass Section */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleRow}>
                  <Text style={styles.settingLabel}>Allow Quick Bypass</Text>
                  <TouchableOpacity 
                    onPress={() => showInfoAlert('Quick Bypass', 'Show "I have a specific purpose" button during timer')}
                    style={styles.helpButton}
                  >
                    <Ionicons name="help-circle-outline" size={16} color={colors.light} />
                  </TouchableOpacity>
                </View>
              </View>
              <Switch
                value={allowBypass}
                onValueChange={setAllowBypass}
                trackColor={{ false: colors.lightest, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
            
            {allowBypass && (
              <View style={styles.bypassTimingSection}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={styles.settingTitleRow}>
                      <Text style={styles.settingLabel}>Bypass Available After</Text>
                      <TouchableOpacity 
                        onPress={() => showInfoAlert('Bypass Timing', 'When the bypass button becomes available')}
                        style={styles.helpButton}
                      >
                        <Ionicons name="help-circle-outline" size={16} color={colors.light} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={handleBypassTimingSelect}
                  >
                    <Text style={styles.selectButtonText}>{formatTime(bypassAfterSeconds)}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.light} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Question Type Section */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <View style={styles.settingTitleRow}>
              <Text style={styles.settingLabel}>Question Type</Text>
              <TouchableOpacity 
                onPress={() => showInfoAlert('Question Types', 'Default: General reflective questions\nGratitude: Appreciation and thankfulness\nProductivity: Goals and intentional action\nMindfulness: Present moment awareness')}
                style={styles.helpButton}
              >
                <Ionicons name="help-circle-outline" size={16} color={colors.light} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.questionTypes}>
              {(['default', 'gratitude', 'productivity', 'mindfulness'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.questionTypeOption,
                    questionsType === type && styles.questionTypeSelected,
                  ]}
                  onPress={() => setQuestionsType(type)}
                >
                  <View style={styles.questionTypeContent}>
                    <View style={[
                      styles.questionTypeIndicator,
                      questionsType === type && { backgroundColor: getQuestionTypeColor(type) }
                    ]} />
                    <Text style={[
                      styles.questionTypeName,
                      questionsType === type && { color: getQuestionTypeColor(type) }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    {questionsType === type && (
                      <Ionicons name="checkmark" size={16} color={getQuestionTypeColor(type)} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingTitleRow}>
                  <Text style={styles.settingLabel}>Reset Usage Statistics</Text>
                  <TouchableOpacity 
                    onPress={() => showInfoAlert('Reset Statistics', 'Clear launch count and usage history for this app')}
                    style={styles.helpButton}
                  >
                    <Ionicons name="help-circle-outline" size={16} color={colors.light} />
                  </TouchableOpacity>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.light} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Time Picker Modals */}
      <TimerPickerModal
        visible={showTimerPicker}
        setIsVisible={setShowTimerPicker}
        onCancel={() => setShowTimerPicker(false)}
        onConfirm={({ hours, minutes, seconds }) => {
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          setTimerLength(totalSeconds);
          setShowTimerPicker(false);
        }}
        initialValue={{
          hours: Math.floor(timerLength / 3600),
          minutes: Math.floor((timerLength % 3600) / 60),
          seconds: timerLength % 60,
        }}
        modalTitle="Select Timer Length"
        hideHours={true}
        padMinutesWithZero={false}
        padSecondsWithZero={false}
        disableInfiniteScroll={true}
        secondInterval={5}
        styles={{
          theme: "light",
          container: { backgroundColor: colors.surface },
          contentContainer: { backgroundColor: colors.surface },
          cancelButton: { color: colors.medium },
          confirmButton: { color: colors.primary },
          modalTitle: { 
            color: colors.dark,
            fontSize: 18,
            fontWeight: '600',
          },
          pickerContainer: { backgroundColor: colors.surface },
          pickerItem: { 
            color: colors.dark,
            fontSize: 22,
            fontWeight: '500',
          },
          pickerLabel: { 
            color: colors.medium,
            fontSize: 16,
            fontWeight: '500',
          },
        }}
      />

      <TimerPickerModal
        visible={showBypassPicker}
        setIsVisible={setShowBypassPicker}
        onCancel={() => setShowBypassPicker(false)}
        onConfirm={({ hours, minutes, seconds }) => {
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          setBypassAfterSeconds(totalSeconds);
          setShowBypassPicker(false);
        }}
        initialValue={{
          hours: Math.floor(bypassAfterSeconds / 3600),
          minutes: Math.floor((bypassAfterSeconds % 3600) / 60),
          seconds: bypassAfterSeconds % 60,
        }}
        modalTitle="Select Bypass Timing"
        hideHours={true}
        padMinutesWithZero={false}
        padSecondsWithZero={false}
        disableInfiniteScroll={true}
        secondInterval={5}
        styles={{
          theme: "light",
          container: { backgroundColor: colors.surface },
          contentContainer: { backgroundColor: colors.surface },
          cancelButton: { color: colors.medium },
          confirmButton: { color: colors.primary },
          modalTitle: { 
            color: colors.dark,
            fontSize: 18,
            fontWeight: '600',
          },
          pickerContainer: { backgroundColor: colors.surface },
          pickerItem: { 
            color: colors.dark,
            fontSize: 22,
            fontWeight: '500',
          },
          pickerLabel: { 
            color: colors.medium,
            fontSize: 16,
            fontWeight: '500',
          },
        }}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.h6,
    color: colors.medium,
  },
  errorText: {
    ...typography.h6,
    color: colors.error,
  },
  saveButton: {
    marginRight: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: colors.light,
  },
  savingText: {
    color: colors.light,
  },
  appInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightest,
  },
  appIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  appStats: {
    ...typography.caption,
    color: colors.medium,
  },
  section: {
    marginTop: spacing.lg,
  },
  settingCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.dark,
    marginRight: spacing.xs,
  },
  helpButton: {
    padding: spacing.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.lightest,
  },
  selectButtonText: {
    ...typography.body2,
    color: colors.dark,
    marginRight: spacing.xs,
    minWidth: 40,
    textAlign: 'center',
  },
  bypassTimingSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightest,
  },
  questionTypes: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  questionTypeOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.lightest,
    backgroundColor: colors.background,
  },
  questionTypeSelected: {
    backgroundColor: colors.lightest,
    borderColor: colors.primary,
  },
  questionTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightest,
    marginRight: spacing.md,
  },
  questionTypeName: {
    ...typography.body1,
    fontWeight: '500',
    color: colors.dark,
    flex: 1,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});

export default AppSettingsScreen;
