import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppConfig } from '../types';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/globalStyles';
import IconService from '../services/IconService';

interface IconDownloadModalProps {
  visible: boolean;
  apps: AppConfig[];
  onClose: () => void;
}

interface AppIcon {
  id: string;
  name: string;
  iconPath: string;
  available: boolean;
}

const IconDownloadModal: React.FC<IconDownloadModalProps> = ({
  visible,
  apps,
  onClose,
}) => {
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [availableIcons, setAvailableIcons] = useState<AppIcon[]>([]);

  const iconService = IconService.getInstance();

  useEffect(() => {
    if (visible) {
      checkAvailableIcons();
    }
  }, [visible, apps]);

  const checkAvailableIcons = async () => {
    const icons: AppIcon[] = [];
    
    for (const app of apps) {
      const available = iconService.hasIcon(app.name);
      
      icons.push({
        id: app.id,
        name: app.name,
        iconPath: available ? app.name : '',
        available,
      });
    }
    
    setAvailableIcons(icons);
    
    // Auto-select apps with available icons
    const appsWithIcons = icons.filter(icon => icon.available).map(icon => icon.id);
    setSelectedApps(appsWithIcons);
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const toggleSelectAll = () => {
    const availableAppIds = availableIcons.filter(icon => icon.available).map(icon => icon.id);
    const allSelected = selectedApps.length === availableAppIds.length && availableAppIds.length > 0;
    
    if (allSelected) {
      // If all are selected, deselect all
      setSelectedApps([]);
    } else {
      // If not all are selected, select all
      setSelectedApps(availableAppIds);
    }
  };

  const downloadToCameraRoll = async () => {
    try {
      setIsDownloading(true);
      
      const selectedIcons = availableIcons.filter(icon => 
        selectedApps.includes(icon.id) && icon.available
      );

      if (selectedIcons.length === 0) {
        Alert.alert('No Icons Selected', 'Please select at least one app with an available icon.');
        return;
      }

      const appNames = selectedIcons.map(icon => icon.name);
      const results = await iconService.batchSaveToCameraRoll(appNames);

      if (results.success > 0) {
        Alert.alert(
          'Icons Saved',
          `${results.success} app icon${results.success === 1 ? '' : 's'} saved to your camera roll in the "App Icons" album.${results.failed.length > 0 ? `\n\nFailed to save: ${results.failed.join(', ')}` : ''}`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Error', 'Failed to save icons to camera roll.');
      }
    } catch (error) {
      console.error('Error saving to camera roll:', error);
      Alert.alert('Error', 'Failed to save icons to camera roll.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadToFiles = async () => {
    try {
      setIsDownloading(true);
      
      const selectedIcons = availableIcons.filter(icon => 
        selectedApps.includes(icon.id) && icon.available
      );

      if (selectedIcons.length === 0) {
        Alert.alert('No Icons Selected', 'Please select at least one app with an available icon.');
        return;
      }

      const appNames = selectedIcons.map(icon => icon.name);
      const results = await iconService.batchSaveToFiles(appNames);

      if (results.success > 0) {
        Alert.alert(
          'Icons Shared',
          `${results.success} app icon${results.success === 1 ? '' : 's'} shared successfully.${results.failed.length > 0 ? `\n\nFailed to share: ${results.failed.join(', ')}` : ''}`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Error', 'Failed to share icons.');
      }
    } catch (error) {
      console.error('Error sharing icons:', error);
      Alert.alert('Error', 'Failed to share icons.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setSelectedApps([]);
    onClose();
  };

  const selectedCount = selectedApps.length;
  const availableCount = availableIcons.filter(icon => icon.available).length;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                  <Text style={styles.modalTitle}>Download App Icons</Text>
                  <Text style={styles.subtitle}>
                    {selectedCount} of {availableCount} selected
                  </Text>
                </View>
                
                <View style={styles.headerRight} />
              </View>
              
              {/* Content */}
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.description}>
                  Download app icons to use when creating shortcuts on your home screen.
                </Text>
                
                {/* Selection Controls */}
                <View style={styles.selectionControls}>
                  <TouchableOpacity onPress={toggleSelectAll} style={styles.controlButton}>
                    <Text style={styles.controlButtonText}>
                      {selectedApps.length === availableIcons.filter(icon => icon.available).length && availableIcons.filter(icon => icon.available).length > 0 
                        ? 'Deselect All' 
                        : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* App List */}
                <View style={styles.appList}>
                  {availableIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon.id}
                      style={[
                        styles.appItem,
                        selectedApps.includes(icon.id) && styles.appItemSelected,
                        !icon.available && styles.appItemDisabled,
                      ]}
                      onPress={() => icon.available && toggleAppSelection(icon.id)}
                      disabled={!icon.available}
                    >
                      <View style={styles.appIconContainer}>
                        {icon.available ? (
                          <View style={styles.appIconPlaceholder}>
                            <Ionicons name="image" size={24} color={colors.primary} />
                          </View>
                        ) : (
                          <View style={styles.appIconPlaceholder}>
                            <Ionicons name="image-outline" size={24} color={colors.light} />
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.appInfo}>
                        <Text style={[
                          styles.appName,
                          !icon.available && styles.appNameDisabled
                        ]}>
                          {icon.name}
                        </Text>
                        <Text style={styles.appStatus}>
                          {" • " + (icon.available ? 'Available' : 'Not available')}
                        </Text>
                      </View>
                      
                      <View style={styles.checkbox}>
                        {selectedApps.includes(icon.id) && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        )}
                        {!selectedApps.includes(icon.id) && icon.available && (
                          <Ionicons name="ellipse-outline" size={20} color={colors.light} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {availableCount === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="image-outline" size={48} color={colors.light} />
                    <Text style={styles.emptyStateText}>No app icons available</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Add some apps to see available icons
                    </Text>
                  </View>
                )}
              </ScrollView>
              
              {/* Download Buttons */}
              <View style={styles.downloadButtons}>
                <TouchableOpacity
                  style={[
                    styles.downloadButton, 
                    styles.filesButton,
                    (selectedCount === 0 || isDownloading) && styles.downloadButtonDisabled
                  ]}
                  onPress={downloadToFiles}
                  disabled={selectedCount === 0 || isDownloading}
                >
                  <Ionicons 
                    name="download" 
                    size={20} 
                    color={selectedCount === 0 || isDownloading ? colors.light : colors.surface} 
                    style={styles.buttonIcon} 
                  />
                  <Text style={[
                    styles.downloadButtonText,
                    (selectedCount === 0 || isDownloading) && styles.downloadButtonTextDisabled
                  ]}>
                    Save to Device
                  </Text>
                </TouchableOpacity>
              </View>
              
              {isDownloading && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>Downloading icons...</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '90%',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h4,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.medium,
    marginTop: 2,
  },
  headerRight: {
    width: 60,
  },
  modalContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    maxHeight: 400,
  },
  description: {
    ...typography.body2,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  selectionControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  controlButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lightest,
  },
  controlButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  appList: {
    gap: spacing.sm,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lightest,
  },
  appItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lightest,
  },
  appItemDisabled: {
    opacity: 0.5,
  },
  appIconContainer: {
    marginRight: spacing.md,
  },
  appIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.lightest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  appName: {
    ...typography.h6,
    color: colors.dark,
  },
  appNameDisabled: {
    color: colors.light,
  },
  appStatus: {
    ...typography.caption,
    color: colors.medium,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    ...typography.h6,
    color: colors.medium,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.body2,
    color: colors.light,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  downloadButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.lightest,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  filesButton: {
    backgroundColor: colors.secondary,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  downloadButtonText: {
    ...typography.button,
    color: colors.surface,
    fontWeight: '600',
  },
  downloadButtonDisabled: {
    backgroundColor: colors.lightest,
    opacity: 0.6,
  },
  downloadButtonTextDisabled: {
    color: colors.light,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  loadingText: {
    ...typography.h6,
    color: colors.primary,
    marginTop: spacing.md,
  },
});

export default IconDownloadModal; 