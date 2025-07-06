import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { NavigationScreens, AppConfig } from '../types';
import { POPULAR_APPS } from '../data/apps';
import StorageService from '../services/StorageService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { globalStyles, colors, spacing, borderRadius, shadows, typography } from '../styles/globalStyles';

type AddAppScreenProps = StackScreenProps<NavigationScreens, 'AddApp'>;

type AppWithStatus = {
  id: string;
  name: string;
  icon: string;
  deepLink: string;
  category: string;
  isAdded: boolean;
  isCustom: boolean;
  appConfig?: AppConfig;
};

const AddAppScreen: React.FC<AddAppScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingApps, setExistingApps] = useState<AppConfig[]>([]);
  const [customApps, setCustomApps] = useState<AppConfig[]>([]);
  
  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  
  // Custom app modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [customDeepLink, setCustomDeepLink] = useState('');
  
  const storage = StorageService.getInstance();

  // Load existing apps when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadExistingApps();
    }, [])
  );

  const loadExistingApps = async () => {
    try {
      const apps = await storage.loadAppConfigs();
      setExistingApps(apps);
      // Separate custom apps
      const customApps = apps.filter(app => !POPULAR_APPS.some(pop => pop.name.toLowerCase() === app.name.toLowerCase()));
      setCustomApps(customApps);
    } catch (error) {
      console.error('Failed to load existing apps:', error);
    }
  };

  // Create unified apps list with status
  const getAllAppsWithStatus = (): AppWithStatus[] => {
    const popularAppsWithStatus: AppWithStatus[] = POPULAR_APPS
      .filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(app => {
        const existingApp = existingApps.find(existing => 
          existing.name.toLowerCase() === app.name.toLowerCase()
        );
        return {
          id: existingApp?.id || app.name,
          name: app.name,
          icon: app.icon,
          deepLink: app.deepLink,
          category: app.category,
          isAdded: !!existingApp,
          isCustom: false,
          appConfig: existingApp,
        };
      });

    const customAppsWithStatus: AppWithStatus[] = customApps
      .filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(app => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
        deepLink: app.deepLink,
        category: 'custom',
        isAdded: true,
        isCustom: true,
        appConfig: app,
      }));

    return [...popularAppsWithStatus, ...customAppsWithStatus];
  };

  const allApps = getAllAppsWithStatus();

  const handleSingleAppAction = async (app: AppWithStatus) => {
    if (isSelectionMode) {
      toggleAppSelection(app.id);
      return;
    }

    setIsLoading(true);
    
    try {
      if (app.isAdded && app.appConfig) {
        if (app.isCustom) {
          // For custom apps, show delete confirmation
          Alert.alert(
            'Delete Custom App',
            `Are you sure you want to permanently delete ${app.name}? This cannot be undone.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await storage.deleteAppConfig(app.appConfig!.id);
                  await loadExistingApps();
                },
              },
            ]
          );
        } else {
          // For popular apps, just remove from dashboard
          await storage.deleteAppConfig(app.appConfig.id);
          await loadExistingApps();
        }
      } else {
        // Add app
        await addSingleApp(app);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update app. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addSingleApp = async (app: AppWithStatus) => {
    const newConfig: AppConfig = {
      id: Date.now().toString(),
      name: app.name,
      icon: app.icon,
      deepLink: app.deepLink,
      isEnabled: true,
      delaySeconds: 60,
      allowBypass: true,
      bypassAfterSeconds: 10,
      questionsType: getDefaultQuestionType(app.category),
      createdAt: new Date(),
      updatedAt: new Date(),
      launchCount: 0,
    };
    
    await storage.saveAppConfig(newConfig);
    await loadExistingApps();
  };

  const handleLongPress = (appId: string) => {
    if (!isSelectionMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSelectionMode(true);
      setSelectedApps(new Set([appId]));
    }
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedApps(new Set());
  };

  const handleBatchAction = async () => {
    if (selectedApps.size === 0) return;

    setIsLoading(true);
    
    try {
      const selectedAppsList = allApps.filter(app => selectedApps.has(app.id));
      const appsToAdd = selectedAppsList.filter(app => !app.isAdded);
      const appsToRemove = selectedAppsList.filter(app => app.isAdded && !app.isCustom);
      const customAppsToDelete = selectedAppsList.filter(app => app.isAdded && app.isCustom);
      
      if (customAppsToDelete.length > 0) {
        Alert.alert(
          'Delete Custom Apps',
          `This will permanently delete ${customAppsToDelete.length} custom app${customAppsToDelete.length > 1 ? 's' : ''}. Continue?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                await performBatchActions(appsToAdd, appsToRemove, customAppsToDelete);
              },
            },
          ]
        );
      } else {
        await performBatchActions(appsToAdd, appsToRemove, []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update apps. Please try again.');
      setIsLoading(false);
    }
  };

  const performBatchActions = async (appsToAdd: AppWithStatus[], appsToRemove: AppWithStatus[], customAppsToDelete: AppWithStatus[]) => {
    try {
      // Add apps
      for (const app of appsToAdd) {
        await addSingleApp(app);
      }
      
      // Remove apps
      for (const app of [...appsToRemove, ...customAppsToDelete]) {
        if (app.appConfig) {
          await storage.deleteAppConfig(app.appConfig.id);
        }
      }
      
      await loadExistingApps();
      exitSelectionMode();
      
      const message = [];
      if (appsToAdd.length > 0) {
        message.push(`Added ${appsToAdd.length} app${appsToAdd.length > 1 ? 's' : ''}`);
      }
      if (appsToRemove.length > 0) {
        message.push(`Removed ${appsToRemove.length} app${appsToRemove.length > 1 ? 's' : ''}`);
      }
      if (customAppsToDelete.length > 0) {
        message.push(`Deleted ${customAppsToDelete.length} custom app${customAppsToDelete.length > 1 ? 's' : ''}`);
      }
      
      if (message.length > 0) {
        Alert.alert('Success', message.join(' and '));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update apps. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomApp = async () => {
    if (!customAppName.trim()) {
      Alert.alert('Error', 'Please enter an app name.');
      return;
    }
    
    if (!customDeepLink.trim()) {
      Alert.alert('Error', 'Please enter a deep link.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const exists = existingApps.some(existing => 
        existing.name.toLowerCase() === customAppName.toLowerCase()
      );
      
      if (exists) {
        Alert.alert(
          'App Already Exists',
          `${customAppName} already exists.`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      const newConfig: AppConfig = {
        id: Date.now().toString(),
        name: customAppName.trim(),
        icon: 'apps-outline',
        deepLink: customDeepLink.trim(),
        isEnabled: true,
        delaySeconds: 60,
        allowBypass: true,
        bypassAfterSeconds: 10,
        questionsType: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
        launchCount: 0,
      };
      
      await storage.saveAppConfig(newConfig);
      await loadExistingApps();
      
      // Reset form and close modal
      setCustomAppName('');
      setCustomDeepLink('');
      setShowCustomModal(false);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to add the app. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultQuestionType = (category: string): 'default' | 'gratitude' | 'productivity' | 'mindfulness' => {
    switch (category) {
      case 'social':
        return 'mindfulness';
      case 'entertainment':
        return 'productivity';
      case 'news':
        return 'mindfulness';
      case 'gaming':
        return 'productivity';
      
      default:
        return 'default';
    }
  };

  const getBatchActionText = () => {
    if (selectedApps.size === 0) return 'Select Apps';
    
    const selectedAppsList = allApps.filter(app => selectedApps.has(app.id));
    const appsToAdd = selectedAppsList.filter(app => !app.isAdded).length;
    const appsToRemove = selectedAppsList.filter(app => app.isAdded && !app.isCustom).length;
    const customAppsToDelete = selectedAppsList.filter(app => app.isAdded && app.isCustom).length;
    
    if (appsToAdd > 0 && (appsToRemove > 0 || customAppsToDelete > 0)) {
      return `Update ${selectedApps.size} Apps`;
    } else if (appsToAdd > 0) {
      return `Add ${appsToAdd} App${appsToAdd > 1 ? 's' : ''}`;
    } else if (appsToRemove > 0 && customAppsToDelete > 0) {
      return `Remove ${appsToRemove} & Delete ${customAppsToDelete}`;
    } else if (appsToRemove > 0) {
      return `Remove ${appsToRemove} App${appsToRemove > 1 ? 's' : ''}`;
    } else if (customAppsToDelete > 0) {
      return `Delete ${customAppsToDelete} App${customAppsToDelete > 1 ? 's' : ''}`;
    }
    
    return 'Update Apps';
  };

  const getQuestionTypeBadgeColor = (category: string) => {
    const questionType = getDefaultQuestionType(category);
    switch (questionType) {
      case 'gratitude': return colors.gratitude;
      case 'productivity': return colors.productivity;
      case 'mindfulness': return colors.mindfulness;
      default: return colors.default;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={isSelectionMode ? exitSelectionMode : undefined}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isSelectionMode ? `${selectedApps.size} selected` : 'Add Apps'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isSelectionMode 
                ? 'Tap to select more or use batch actions'
                : 'Choose apps to use more mindfully'
              }
            </Text>
          </View>
          
          {isSelectionMode && (
            <TouchableOpacity onPress={exitSelectionMode} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.light}
          />
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {allApps.map((app, index) => (
              <TouchableOpacity
                key={app.id}
                style={[
                  styles.appItem,
                  app.isAdded && styles.addedAppItem,
                  isSelectionMode && selectedApps.has(app.id) && styles.selectedAppItem
                ]}
                onPress={() => handleSingleAppAction(app)}
                onLongPress={() => handleLongPress(app.id)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isSelectionMode && (
                  <View style={styles.selectionCircle}>
                    {selectedApps.has(app.id) && (
                      <Ionicons name="checkmark" size={14} color={colors.surface} />
                    )}
                  </View>
                )}
                
                <View style={styles.appIconContainer}>
                  <Ionicons
                    name={app.icon as any}
                    size={20}
                    color={app.isAdded ? colors.success : colors.primary}
                  />
                  {app.isCustom && (
                    <View style={styles.customIndicator}>
                      <Ionicons name="person" size={8} color={colors.surface} />
                    </View>
                  )}
                </View>
                
                <View style={styles.appInfo}>
                  <View style={styles.appNameRow}>
                    <Text style={[styles.appName, app.isAdded && styles.addedAppName]}>
                      {app.name}
                    </Text>
                    {app.isCustom && <Text style={styles.customLabel}>Custom</Text>}
                  </View>
                  <View style={styles.appMeta}>
                    {!app.isCustom && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: getQuestionTypeBadgeColor(app.category) }
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {getDefaultQuestionType(app.category)}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.appCategory}>
                      {app.isCustom ? 'Personal app' : app.category}
                    </Text>
                  </View>
                </View>
                
                {!isSelectionMode && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      app.isAdded ? (app.isCustom ? styles.deleteButton : styles.removeButton) : styles.addButton
                    ]}
                    onPress={() => handleSingleAppAction(app)}
                    disabled={isLoading}
                  >
                    <Text style={styles.actionButtonText}>
                      {app.isAdded ? (app.isCustom ? 'Delete' : 'Remove') : 'Add'}
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Floating Add Button */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setShowCustomModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
        
        {/* Batch Action Bar */}
        {isSelectionMode && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[
                styles.batchButton,
                selectedApps.size === 0 && styles.disabledButton
              ]}
              onPress={handleBatchAction}
              disabled={selectedApps.size === 0 || isLoading}
            >
              <Text style={styles.batchButtonText}>
                {isLoading ? 'Updating...' : getBatchActionText()}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Custom App Modal */}
        <Modal
          visible={showCustomModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowCustomModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowCustomModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Custom App</Text>
                    <TouchableOpacity onPress={handleAddCustomApp} disabled={isLoading}>
                      <Text style={[styles.modalDoneText, isLoading && styles.disabledText]}>
                        {isLoading ? 'Adding...' : 'Done'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalContent}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>App Name</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., MyApp"
                        value={customAppName}
                        onChangeText={setCustomAppName}
                        placeholderTextColor={colors.light}
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Deep Link</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., myapp://"
                        value={customDeepLink}
                        onChangeText={setCustomDeepLink}
                        autoCapitalize="none"
                        keyboardType="url"
                        placeholderTextColor={colors.light}
                      />
                    </View>
                    
                    <View style={styles.helpContainer}>
                      <Ionicons name="bulb-outline" size={18} color={colors.warning} />
                      <Text style={styles.helpText}>
                        Deep links usually follow the format: appname://
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightest,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  headerTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.body2,
    textAlign: 'center',
    marginTop: 2,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  cancelText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.lightest,
    ...shadows.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  appItem: {
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
  addedAppItem: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.success,
  },
  selectedAppItem: {
    borderColor: colors.secondary,
    backgroundColor: '#EBF3FD',
  },
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
  appIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    position: 'relative',
  },
  customIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  appName: {
    ...typography.h5,
  },
  addedAppName: {
    color: colors.success,
  },
  customLabel: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    backgroundColor: colors.lightest,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: spacing.xs,
    marginLeft: spacing.sm,
  },
  appMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  appCategory: {
    ...typography.body2,
    textTransform: 'capitalize',
  },
  actionButton: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minWidth: 60,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  removeButton: {
    backgroundColor: colors.error,
  },
  deleteButton: {
    backgroundColor: colors.dark,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
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
  actionBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightest,
  },
  batchButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  batchButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightest,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  modalCancelText: {
    ...typography.body1,
    color: colors.primary,
  },
  modalTitle: {
    ...typography.h4,
    fontWeight: '600',
  },
  modalDoneText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.h6,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.lightest,
    ...shadows.sm,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  helpText: {
    ...typography.body2,
    color: colors.medium,
    marginLeft: spacing.sm,
    fontStyle: 'italic',
    flex: 1,
  },
});

export default AddAppScreen; 