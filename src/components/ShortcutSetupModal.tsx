import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { AppConfig } from '../types';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/globalStyles';
import ShortcutService from '../services/ShortcutService';
import DeepLinkService from '../services/DeepLinkService';
import ShortcutHelpModal from './ShortcutHelpModal';

interface ShortcutSetupModalProps {
  visible: boolean;
  appConfig: AppConfig | null;
  onClose: () => void;
}

const ShortcutSetupModal: React.FC<ShortcutSetupModalProps> = ({
  visible,
  appConfig,
  onClose,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  if (!appConfig) return null;

  const shortcutService = ShortcutService.getInstance();
  const shortcutConfig = shortcutService.createShortcutConfig(appConfig);
  
  const deepLinkService = DeepLinkService.getInstance();
  const envInfo = deepLinkService.getEnvironmentInfo();
  
  const hasICloudShortcut = shortcutService.hasICloudShortcut(appConfig);

  const handleCopyUrl = async () => {
    try {
      await Clipboard.setStringAsync(shortcutConfig.reflectionDeepLink);
      console.log('URL copied to clipboard:', shortcutConfig.reflectionDeepLink);
      
      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      
      // Set copied state
      setIsCopied(true);
      
      // Reset after 3 seconds
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to copy URL:', error);
      Alert.alert('Error', 'Failed to copy URL to clipboard');
    }
  };

  const handleQuickInstall = async () => {
    const success = await shortcutService.openICloudShortcut(appConfig);
    if (success) {
      onClose();
    } else {
      Alert.alert(
        'Error',
        'Failed to open the shortcut. Try the manual setup instead.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    setIsCopied(false);
    setShowHelpModal(false);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
    onClose();
  };

  const handleShowHelp = () => {
    setShowHelpModal(true);
  };

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
                  <Text style={styles.modalTitle}>Setup Shortcut</Text>
                  <Text style={styles.appName}>{appConfig.name}</Text>
                </View>
                
                <TouchableOpacity onPress={handleShowHelp} style={styles.headerRight}>
                  <Ionicons name="help-circle-outline" size={24} color={colors.medium} />
                </TouchableOpacity>
              </View>
              
              {/* Content */}
              <View style={styles.modalContent}>
                <Text style={styles.description}>
                  Create a mindful shortcut that shows reflection questions before opening {appConfig.name}.
                </Text>
                
                <Text style={styles.environmentInfo}>
                  Environment: {envInfo.description}
                </Text>
                
                {/* Quick Install Option */}
                {hasICloudShortcut && (
                  <TouchableOpacity 
                    style={styles.quickInstallButton} 
                    onPress={handleQuickInstall}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons name="cloud-download-outline" size={20} color={colors.surface} />
                      <View style={styles.buttonTextContainer}>
                        <Text style={styles.buttonTitle}>Quick Install</Text>
                        <Text style={styles.buttonSubtitle}>Automatic setup via iCloud</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                
                {/* Manual Setup Option */}
                <View style={styles.manualSection}>
                  <Text style={styles.sectionTitle}>Manual Setup</Text>
                  <Text style={styles.sectionDescription}>
                    Copy this URL and paste it in the iOS Shortcuts app:
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.urlBox, isCopied && styles.urlBoxCopied]} 
                    onPress={handleCopyUrl}
                    disabled={isCopied}
                  >
                    <Text style={[styles.urlText, isCopied && styles.urlTextCopied]}>
                      {shortcutConfig.reflectionDeepLink}
                    </Text>
                    <Ionicons 
                      name={isCopied ? "checkmark" : "copy-outline"} 
                      size={16} 
                      color={isCopied ? colors.success : colors.primary} 
                    />
                  </TouchableOpacity>
                  
                  <Text style={[styles.urlHint, isCopied && styles.urlHintCopied]}>
                    {isCopied ? 'Copied!' : 'Tap to copy'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Help Modal */}
      <ShortcutHelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
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
  appName: {
    ...typography.body2,
    color: colors.medium,
    marginTop: 2,
  },
  headerRight: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  description: {
    ...typography.body1,
    lineHeight: 22,
    color: colors.dark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  environmentInfo: {
    ...typography.caption,
    color: colors.light,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  quickInstallButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  buttonTitle: {
    ...typography.h6,
    color: colors.surface,
    fontWeight: '600',
  },
  buttonSubtitle: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.9,
    marginTop: 2,
  },
  manualSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h6,
    marginBottom: spacing.sm,
    color: colors.dark,
  },
  sectionDescription: {
    ...typography.body2,
    color: colors.medium,
    marginBottom: spacing.md,
  },
  urlBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  urlText: {
    ...typography.body2,
    fontFamily: 'monospace',
    color: colors.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  urlHint: {
    ...typography.caption,
    color: colors.light,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  urlBoxCopied: {
    backgroundColor: colors.lightest,
    borderColor: colors.success,
    opacity: 0.7,
  },
  urlTextCopied: {
    color: colors.medium,
  },
  urlHintCopied: {
    color: colors.success,
    fontStyle: 'normal',
    fontWeight: '600',
  },
});

export default ShortcutSetupModal; 