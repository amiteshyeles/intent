import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/globalStyles';
import DeepLinkService from '../services/DeepLinkService';

interface ShortcutHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

interface HelpStep {
  title: string;
  content: string;
  isOptional?: boolean;
}

const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  visible,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const deepLinkService = DeepLinkService.getInstance();
  const envInfo = deepLinkService.getEnvironmentInfo();

  const steps: HelpStep[] = [
    {
      title: 'What Are Mindful Shortcuts?',
      content: `Mindful shortcuts replace your app icons with versions that show reflection questions before opening the app.\n\nThis creates a moment of pause, helping you use apps more intentionally rather than out of habit.\n\nEnvironment: ${envInfo.description}`,
    },
    {
      title: 'Two Setup Methods',
      content: envInfo.isDevelopment 
        ? `There are two ways to set up shortcuts:\n\n✅ Quick Install: One-tap installation via pre-made iCloud shortcuts (when available)\n\n⚙️ Manual Setup: Create the shortcut yourself in the iOS Shortcuts app\n\nNote: In development mode, shortcuts work while your Expo server is running.`
        : `There are two ways to set up shortcuts:\n\n✅ Quick Install: One-tap installation via pre-made iCloud shortcuts (when available)\n\n⚙️ Manual Setup: Create the shortcut yourself in the iOS Shortcuts app`,
    },
    {
      title: 'Manual Setup: Step 1',
      content: `If using manual setup, start by opening the iOS Shortcuts app.\n\nIf you don't have it installed, you can download it from the App Store (it's usually pre-installed on iOS devices).\n\nTap the "+" button in the top right to create a new shortcut.`,
    },
    {
      title: 'Manual Setup: Step 2',
      content: `In the shortcut editor:\n\n1. Tap "Add Action"\n2. Search for "Open URL"\n3. Tap "Open URL" to add it\n\nThis creates a shortcut that can open web links and custom app URLs.`,
    },
    {
      title: 'Manual Setup: Step 3',
      content: `Now set the URL:\n\n1. Tap on "URL" in the shortcut\n2. Paste the URL you copied from the app\n3. Make sure it's pasted exactly\n\nThe URL tells the shortcut to open your reflection app instead of the original app.`,
    },
    {
      title: 'Manual Setup: Step 4',
      content: `Name and save your shortcut:\n\n1. Tap "Next" in the top right\n2. Name your shortcut (e.g., "Mindful Instagram")\n3. Tap "Done" to save it\n\nYour shortcut is now created and ready to use!`,
    },
    {
      title: 'Adding to Home Screen',
      content: `To replace your app icon:\n\n1. In your new shortcut, tap the share button\n2. Tap "Add to Home Screen"\n3. Change the name to match the original app\n4. Choose an icon (optional)\n5. Tap "Add"\n\nThe shortcut will appear on your home screen.`,
    },
    {
      title: 'Hide Original App (Optional)',
      isOptional: true,
      content: `For the best experience:\n\n1. Long press the original app icon\n2. Tap "Remove App"\n3. Choose "Remove from Home Screen"\n\nThis hides the original app while keeping it in your App Library, adding healthy friction to habitual usage.`,
    },
    {
      title: 'How It Works',
      content: `When you tap your mindful shortcut:\n\n1. It opens this reflection app\n2. You see a 60-second breathing timer\n3. You're asked a thoughtful question\n4. After reflecting, you can proceed to the original app\n\nThis creates intentional moments throughout your day.`,
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

  const handleClose = () => {
    setCurrentStep(0);
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
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                  <Text style={styles.modalTitle}>Shortcut Setup Guide</Text>
                  <Text style={styles.stepIndicator}>
                    Step {currentStep + 1} of {steps.length}
                  </Text>
                </View>
                
                <View style={styles.headerRight} />
              </View>
              
              {/* Content */}
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>
                    {currentStepData.title}
                    {currentStepData.isOptional && (
                      <Text style={styles.optionalLabel}> (Optional)</Text>
                    )}
                  </Text>
                </View>
                
                <Text style={styles.contentText}>{currentStepData.content}</Text>
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
    width: 60,
  },
  modalContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stepHeader: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.dark,
    textAlign: 'center',
  },
  optionalLabel: {
    ...typography.h5,
    color: colors.medium,
    fontWeight: '400',
  },
  contentText: {
    ...typography.body1,
    lineHeight: 24,
    color: colors.dark,
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

export default ShortcutHelpModal; 