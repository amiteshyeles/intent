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
  Modal,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { NavigationScreens, ProductiveApp } from '../types';
import { PRODUCTIVE_APPS, searchProductiveApps } from '../data/apps';
import StorageService from '../services/StorageService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/globalStyles';

type ProductiveAppsSettingsScreenProps = StackScreenProps<NavigationScreens, 'ProductiveAppsSettings'>;

type ProductiveAppWithStatus = ProductiveApp & {
  id: string;
  isSelected: boolean;
  isCustom: boolean;
};

const ProductiveAppsSettingsScreen: React.FC<ProductiveAppsSettingsScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApps, setSelectedApps] = useState<ProductiveApp[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Custom app modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [customDeepLink, setCustomDeepLink] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  
  const storage = StorageService.getInstance();

  // Load selected apps when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSelectedApps();
    }, [])
  );

  const loadSelectedApps = async () => {
    try {
      const settings = await storage.loadGlobalSettings();
      setSelectedApps(settings.selectedProductiveApps || []);
    } catch (error) {
      console.error('Failed to load selected productive apps:', error);
    }
  };

  // Create unified apps list with status
  const getAllAppsWithStatus = (): ProductiveAppWithStatus[] => {
    const filteredApps = searchProductiveApps(searchQuery);
    
    const appsWithStatus: ProductiveAppWithStatus[] = filteredApps.map(app => ({
      ...app,
      id: app.name,
      isSelected: selectedApps.some(selected => selected.name === app.name),
      isCustom: false,
    }));

    // Add custom apps
    const customApps: ProductiveAppWithStatus[] = selectedApps
      .filter(app => !PRODUCTIVE_APPS.some(prod => prod.name === app.name))
      .filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(app => ({
        ...app,
        id: app.name,
        isSelected: true,
        isCustom: true,
      }));

    return [...appsWithStatus, ...customApps];
  };

  const allApps = getAllAppsWithStatus();

  const handleAppToggle = (app: ProductiveAppWithStatus) => {
    if (app.isSelected) {
      // Remove from selection
      const newSelected = selectedApps.filter(selected => selected.name !== app.name);
      setSelectedApps(newSelected);
      setHasChanges(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Add to selection (max 3)
      if (selectedApps.length >= 3) {
        Alert.alert(
          'Maximum Apps Selected',
          'You can select up to 3 productive apps. Remove one to add another.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const newSelected = [...selectedApps, {
        name: app.name,
        deepLink: app.deepLink,
        icon: app.icon,
        description: app.description,
        category: app.category,
      }];
      setSelectedApps(newSelected);
      setHasChanges(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveApp = (appName: string) => {
    const newSelected = selectedApps.filter(selected => selected.name !== appName);
    setSelectedApps(newSelected);
    setHasChanges(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddCustomApp = async () => {
    if (!customAppName.trim() || !customDeepLink.trim()) {
      Alert.alert('Missing Information', 'Please enter both app name and deep link.');
      return;
    }

    if (selectedApps.length >= 3) {
      Alert.alert(
        'Maximum Apps Selected',
        'You can select up to 3 productive apps. Remove one to add another.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if app already exists
    if (selectedApps.some(app => app.name.toLowerCase() === customAppName.trim().toLowerCase())) {
      Alert.alert('App Already Exists', 'An app with this name is already selected.');
      return;
    }

    const customApp: ProductiveApp = {
      name: customAppName.trim(),
      deepLink: customDeepLink.trim(),
      icon: 'apps-outline',
      description: customDescription.trim() || 'Custom productive app',
      category: 'productivity',
    };

    const newSelected = [...selectedApps, customApp];
    setSelectedApps(newSelected);
    setHasChanges(true);
    
    // Reset form
    setCustomAppName('');
    setCustomDeepLink('');
    setCustomDescription('');
    setShowCustomModal(false);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const currentSettings = await storage.loadGlobalSettings();
      const updatedSettings = {
        ...currentSettings,
        selectedProductiveApps: selectedApps,
      };
      await storage.saveGlobalSettings(updatedSettings);
      setHasChanges(false);
      
      Alert.alert(
        'Settings Saved',
        'Your productive app preferences have been updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set navigation header options
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        hasChanges ? (
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            <Text style={[styles.saveText, isLoading && styles.disabledText]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        ) : null
      ),
    });
  }, [navigation, hasChanges, isLoading, handleSave]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return colors.primary;
      case 'learning': return colors.secondary;
      case 'wellness': return colors.success;
      case 'creative': return colors.warning;
      default: return colors.medium;
    }
  };

  const isSelectionDisabled = selectedApps.length >= 3;

  return (
    <TouchableWithoutFeedback onPress={() => {}}>
      <SafeAreaView style={styles.container}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.light} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search productive apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.light}
          />
        </View>
        
        {/* Selected Apps Summary */}
        {selectedApps.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>Selected Apps ({selectedApps.length}/3)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedAppScrollView}>
              {selectedApps.map((app, index) => (
                <View key={app.name} style={styles.selectedApp}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveApp(app.name)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={12} color={colors.surface} />
                  </TouchableOpacity>
                  <View style={styles.selectedAppIcon}>
                    <Ionicons name={app.icon as any} size={16} color={colors.surface} />
                  </View>
                  <Text style={styles.selectedAppName}>{app.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Apps List */}
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {allApps.map((app) => {
              const isDisabled = !app.isSelected && isSelectionDisabled;
              return (
                <TouchableOpacity
                  key={app.id}
                  style={[
                    styles.appItem,
                    app.isSelected && styles.selectedAppItem,
                    isDisabled && styles.disabledAppItem
                  ]}
                  onPress={() => handleAppToggle(app)}
                  disabled={isLoading || isDisabled}
                  activeOpacity={isDisabled ? 1 : 0.7}
                >
                  <View style={styles.appIconContainer}>
                    <Ionicons
                      name={app.icon as any}
                      size={24}
                      color={
                        app.isSelected 
                          ? colors.primary 
                          : isDisabled 
                            ? colors.lightest 
                            : colors.medium
                      }
                    />
                    {app.isCustom && (
                      <View style={styles.customIndicator}>
                        <Ionicons name="person" size={10} color={colors.surface} />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.appInfo}>
                    <View style={styles.appNameRow}>
                      <Text style={[
                        styles.appName, 
                        app.isSelected && styles.selectedAppNameActive,
                        isDisabled && styles.disabledAppName
                      ]}>
                        {app.name}
                      </Text>
                      {app.isCustom && <Text style={styles.customLabel}>Custom</Text>}
                    </View>
                    <Text style={[
                      styles.appDescription,
                      isDisabled && styles.disabledAppDescription
                    ]}>
                      {app.description}
                    </Text>
                    <View style={styles.appMeta}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: getCategoryColor(app.category) },
                          isDisabled && styles.disabledCategoryBadge
                        ]}
                      >
                        <Text style={styles.categoryText}>{app.category}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.selectionIndicator}>
                    {app.isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    ) : (
                      <Ionicons 
                        name="ellipse-outline" 
                        size={24} 
                        color={isDisabled ? colors.lightest : colors.light} 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {allApps.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.light} />
                <Text style={styles.emptyStateText}>No apps found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try a different search term or add a custom app
                </Text>
              </View>
            )}
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
                      <Text style={styles.inputLabel}>App Name *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Bear Notes"
                        value={customAppName}
                        onChangeText={setCustomAppName}
                        placeholderTextColor={colors.light}
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Deep Link *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., bear://"
                        value={customDeepLink}
                        onChangeText={setCustomDeepLink}
                        autoCapitalize="none"
                        keyboardType="url"
                        placeholderTextColor={colors.light}
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Write and organize notes"
                        value={customDescription}
                        onChangeText={setCustomDescription}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  saveText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightest,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    paddingVertical: spacing.md,
    color: colors.dark,
  },
  selectedSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  selectedTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  selectedApp: {
    alignItems: 'center',
    marginRight: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    minWidth: 60,
    position: 'relative',
  },
  selectedAppScrollView:{
    paddingVertical: spacing.md,
  },
  selectedAppIcon: {
    marginBottom: spacing.xs,
  },
  selectedAppName: {
    ...typography.caption,
    color: colors.surface,
    textAlign: 'center',
    fontSize: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightest,
    ...shadows.sm,
  },
  selectedAppItem: {
    borderColor: colors.primary,
    backgroundColor: colors.lightest,
  },
  disabledAppItem: {
    opacity: 0.5,
  },
  appIconContainer: {
    position: 'relative',
    marginRight: spacing.md,
    width: 40,
    height: 40,
    backgroundColor: colors.lightest,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: colors.warning,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  appName: {
    ...typography.h6,
    color: colors.dark,
    flex: 1,
  },
  selectedAppNameActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  disabledAppName: {
    color: colors.light,
  },
  customLabel: {
    ...typography.caption,
    color: colors.warning,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontSize: 10,
    fontWeight: '600',
  },
  appDescription: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: spacing.xs,
  },
  disabledAppDescription: {
    color: colors.light,
  },
  appMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  disabledCategoryBadge: {
    backgroundColor: colors.lightest,
    borderColor: colors.lightest,
  },
  categoryText: {
    ...typography.caption,
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  selectionIndicator: {
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyStateText: {
    ...typography.h6,
    color: colors.medium,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: colors.light,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xxxl,
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxHeight: '80%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightest,
  },
  modalCancelText: {
    ...typography.body1,
    color: colors.medium,
  },
  modalTitle: {
    ...typography.h5,
    fontWeight: '600',
  },
  modalDoneText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    ...typography.body1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.lightest,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightest,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  helpText: {
    ...typography.caption,
    color: colors.medium,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default ProductiveAppsSettingsScreen; 