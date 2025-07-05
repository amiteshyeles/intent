import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { AppConfig } from '../types';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/globalStyles';
import ShortcutService from '../services/ShortcutService';
import DeepLinkService from '../services/DeepLinkService';

interface ShortcutOnboardingModalProps {
  visible: boolean;
  appConfig: AppConfig | null;
  onClose: () => void;
}

interface OnboardingStep {
  title: string;
  content: string;
  action?: {
    text: string;
    onPress: () => void;
  };
  url?: string;
}

const ShortcutOnboardingModal: React.FC<ShortcutOnboardingModalProps> = ({
  visible,
  appConfig,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
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
  const shortcutConfig = shortcutService['createShortcutConfig'](appConfig);
  
  const deepLinkService = DeepLinkService.getInstance();
  const envInfo = deepLinkService.getEnvironmentInfo();

  const steps: OnboardingStep[] = [
    {
      title: 'Create Mindful Shortcut',
      content: `We'll create a mindful shortcut for ${appConfig.name}. This shortcut will show reflection questions before opening the app.\n\nThis helps you pause and think before habitual app usage.\n\nEnvironment: ${envInfo.description}`,
    },
    {
      title: 'Open Shortcuts App',
      content: `First, we need to open the iOS Shortcuts app.\n\nIf you don't have it installed, you can download it from the App Store (it's usually pre-installed).`,
      action: {
        text: 'Open Shortcuts App',
        onPress: () => shortcutService.openShortcutsApp(appConfig),
      },
    },
    {
      title: 'Create New Shortcut',
      content: `In the Shortcuts app:\n\n1. Tap the "+" button (top right)\n2. Tap "Add Action"\n3. Search for "Open URL"\n4. Tap "Open URL" to add it\n\nThis creates a shortcut that opens a web link.`,
    },
    {
      title: 'Set the URL',
      content: envInfo.isDevelopment 
        ? `Now we need to set the URL that will trigger our reflection:\n\n1. Tap on "URL" in the shortcut\n2. Replace it with the URL below\n3. Make sure to copy it exactly\n\nNote: This is a development URL that works with Expo Go. In a production app, this would be a simpler intentional:// URL.`
        : `Now we need to set the URL that will trigger our reflection:\n\n1. Tap on "URL" in the shortcut\n2. Replace it with the URL below\n3. Make sure to copy it exactly`,
      url: shortcutConfig.reflectionDeepLink,
    },
    {
      title: 'Name Your Shortcut',
      content: `Almost done! Now:\n\n1. Tap "Next" in the top right\n2. Name your shortcut "${shortcutConfig.appName}"\n3. Tap "Done" to save it\n\nYour shortcut is now created!`,
    },
    {
      title: 'Add to Home Screen',
      content: `Finally, let's add it to your home screen:\n\n1. In your new shortcut, tap the share button\n2. Tap "Add to Home Screen"\n3. Change the name to "${appConfig.name}"\n4. Choose an icon (optional)\n5. Tap "Add"`,
    },
    {
      title: 'Optional: Hide Original App',
      content: `For the best experience:\n\n1. Long press the original ${appConfig.name} app\n2. Tap "Remove App"\n3. Choose "Remove from Home Screen"\n\nThis adds healthy friction while keeping the app accessible in your App Library.`,
    },
    {
      title: 'You\'re All Set!',
      content: envInfo.isDevelopment 
        ? `Perfect! Your mindful ${appConfig.name} shortcut is ready.\n\nNow when you tap the shortcut, you'll see reflection questions before the app opens.\n\nThis helps create more intentional digital habits.\n\nNote: Since you're using Expo Go, the shortcut will work while your development server is running.`
        : `Perfect! Your mindful ${appConfig.name} shortcut is ready.\n\nNow when you tap the shortcut, you'll see reflection questions before the app opens.\n\nThis helps create more intentional digital habits.`,
      action: {
        text: 'Test Your Shortcut',
        onPress: () => shortcutService.testShortcut(appConfig),
      },
    },
  ];

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCopyUrl = async () => {
    if (currentStepData.url) {
      try {
        // Copy URL to clipboard
        await Clipboard.setStringAsync(currentStepData.url);
        console.log('URL copied to clipboard:', currentStepData.url);
        
        // Verify the copy worked
        const clipboardContent = await Clipboard.getStringAsync();
        if (clipboardContent === currentStepData.url) {
          console.log('✅ Clipboard copy verified successfully');
        }
        
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
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setIsCopied(false);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
    onClose();
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
                  <Text style={styles.modalTitle}>{currentStepData.title}</Text>
                  <Text style={styles.stepIndicator}>
                    Step {currentStep + 1} of {steps.length}
                  </Text>
                </View>
                
                <View style={styles.headerRight}>
                  {/* Placeholder for alignment */}
                </View>
              </View>
              
              {/* Content */}
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.contentText}>{currentStepData.content}</Text>
                
                {/* URL Display */}
                {currentStepData.url && (
                  <View style={styles.urlContainer}>
                    <Text style={styles.urlLabel}>URL to copy:</Text>
                    <TouchableOpacity 
                      style={[styles.urlBox, isCopied && styles.urlBoxCopied]} 
                      onPress={handleCopyUrl}
                      disabled={isCopied}
                    >
                      <Text style={[styles.urlText, isCopied && styles.urlTextCopied]}>
                        {currentStepData.url}
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
                )}
                
                {/* Action Button */}
                {currentStepData.action && (
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={currentStepData.action.onPress}
                  >
                    <Ionicons name="open-outline" size={16} color={colors.surface} />
                    <Text style={styles.actionButtonText}>{currentStepData.action.text}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
              
              {/* Navigation */}
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton, isFirstStep && styles.disabledButton]}
                  onPress={handlePrevious}
                  disabled={isFirstStep}
                >
                  <Ionicons name="chevron-back" size={16} color={isFirstStep ? colors.light : colors.primary} />
                  <Text style={[styles.navButtonText, isFirstStep && styles.disabledText]}>Previous</Text>
                </TouchableOpacity>
                
                <View style={styles.progressIndicator}>
                  {steps.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.progressDot,
                        index === currentStep && styles.progressDotActive,
                        index < currentStep && styles.progressDotCompleted,
                      ]}
                    />
                  ))}
                </View>
                
                <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
                  <Text style={styles.navButtonText}>{isLastStep ? 'Done' : 'Next'}</Text>
                  <Ionicons name={isLastStep ? "checkmark" : "chevron-forward"} size={16} color={colors.surface} />
                </TouchableOpacity>
              </View>
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
  stepIndicator: {
    ...typography.caption,
    color: colors.light,
    marginTop: 2,
  },
  headerRight: {
    width: 60, // Same width as cancel button for alignment
  },
  modalContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl, // Extra padding at bottom to ensure content isn't cut off
  },
  contentText: {
    ...typography.body1,
    lineHeight: 24,
    color: colors.dark,
    marginBottom: spacing.lg,
  },
  urlContainer: {
    marginVertical: spacing.lg,
  },
  urlLabel: {
    ...typography.h6,
    marginBottom: spacing.sm,
    color: colors.dark,
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
  actionButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.surface,
    marginLeft: spacing.sm,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightest,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    minWidth: 80,
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lightest,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  navButtonText: {
    ...typography.button,
    marginHorizontal: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.light,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightest,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
  },
});

export default ShortcutOnboardingModal; 