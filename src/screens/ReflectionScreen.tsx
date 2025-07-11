import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking, TouchableOpacity, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { NavigationScreens } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import QuestionCard from '../components/QuestionCard';
import StorageService from '../services/StorageService';
import QuestionService from '../services/QuestionService';
import { colors, spacing, typography } from '../styles/globalStyles';

type ReflectionScreenProps = StackScreenProps<NavigationScreens, 'Reflection'>;

const ReflectionScreen: React.FC<ReflectionScreenProps> = ({
  route,
  navigation,
}) => {
  const { appId, targetDeepLink } = route.params;
  
  const [appConfig, setAppConfig] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<'countdown' | 'question' | 'complete'>('countdown');
  const [reflectionStartTime] = useState<Date>(new Date());
  const [sessionId] = useState<string>(Date.now().toString());
  
  const storage = StorageService.getInstance();
  const questionService = QuestionService.getInstance();

  useEffect(() => {
    initializeReflection();
  }, [appId]);

  useEffect(() => {
    // Set header options with cancel button
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.surface} />
        </TouchableOpacity>
      ),
      headerTitle: appConfig ? `Reflecting on ${appConfig.name}` : 'Reflection',
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.surface,
      headerTitleStyle: {
        ...typography.h6,
        fontWeight: '600',
      },
    });
  }, [navigation, appConfig]);

  const initializeReflection = async () => {
    try {
      // Load app configuration
      const config = await storage.getAppConfig(appId);
      if (!config) {
        Alert.alert('Error', 'App configuration not found');
        navigation.goBack();
        return;
      }
      
      setAppConfig(config);
      
      // Get appropriate question for this app
      const question = await questionService.getSmartQuestion(
        config.questionsType,
        config.name
      );
      setCurrentQuestion(question);
      
      // Start reflection session tracking
      const reflectionSession = {
        id: sessionId,
        appId: config.id,
        appName: config.name,
        question,
        startTime: reflectionStartTime,
        completed: false,
        bypassed: false,
        proceededToApp: false,
      };
      
      await storage.saveReflectionSession(reflectionSession);
    } catch (error) {
      console.error('Failed to initialize reflection:', error);
      Alert.alert('Error', 'Failed to initialize reflection');
      navigation.goBack();
    }
  };

  const handleCountdownComplete = async () => {
    setCurrentPhase('question');
    
    // Update reflection session
    await updateReflectionSession({
      completed: true,
      endTime: new Date(),
    });
  };

  const handleBypass = async () => {
    // Navigate to bypass flow or directly to post-reflection
    await updateReflectionSession({
      bypassed: true,
      endTime: new Date(),
    });
    
    // Mark question as used but not completed
    await questionService.markQuestionAsUsed(
      currentQuestion,
      appConfig.name,
      false
    );
    
    navigation.navigate('PostReflection', {
      appId: appConfig.id,
      appName: appConfig.name,
      targetDeepLink,
    });
  };

  const handleQuestionAnswer = async (answer: string) => {
    // Mark question as used and completed
    await questionService.markQuestionAsUsed(
      currentQuestion,
      appConfig.name,
      true
    );
    
    // Update reflection session
    await updateReflectionSession({
      completed: true,
      endTime: new Date(),
    });
    
    setCurrentPhase('complete');
    
    // Navigate to post-reflection confirmation
    navigation.navigate('PostReflection', {
      appId: appConfig.id,
      appName: appConfig.name,
      targetDeepLink,
    });
  };

  const updateReflectionSession = async (updates: any) => {
    try {
      const sessions = await storage.loadReflectionSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
        await storage.saveReflectionSession(sessions[sessionIndex]);
      }
    } catch (error) {
      console.error('Failed to update reflection session:', error);
    }
  };

  const handleCancel = async () => {
    try {
      // Update reflection session to mark as cancelled
      await updateReflectionSession({
        cancelled: true,
        endTime: new Date(),
      });
      
      // Reset navigation stack to Dashboard (removes ability to go back)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      console.error('Failed to cancel reflection:', error);
      // Even on error, reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }
  };

  const launchApp = async () => {
    try {
      // Update app config with last launched time
      if (appConfig) {
        const updatedConfig = {
          ...appConfig,
          lastLaunched: new Date(),
          launchCount: (appConfig.launchCount || 0) + 1,
        };
        storage.saveAppConfig(updatedConfig);
      }
      
      // Update reflection session
      updateReflectionSession({
        proceededToApp: true,
      });
      
      // Launch the target app
      await Linking.openURL(targetDeepLink);
      
      // Reset navigation stack to Dashboard (removes ability to go back)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert(
        'Cannot Open App',
        'Unable to open the app. Please make sure it is installed.',
        [{ text: 'OK', onPress: () => navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        }) }]
      );
    }
  };

  if (!appConfig) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {currentPhase === 'countdown' && (
        <CountdownTimer
          initialSeconds={appConfig.delaySeconds || 60}
          onComplete={handleCountdownComplete}
          onBypass={handleBypass}
          onCancel={handleCancel}
          question={currentQuestion}
          appName={appConfig.name}
          showBypassAfterSeconds={appConfig.allowBypass ? appConfig.bypassAfterSeconds : 999}
        />
      )}
      
      {currentPhase === 'question' && (
        <QuestionCard
          question={currentQuestion}
          appName={appConfig.name}
          onAnswer={handleQuestionAnswer}
          onCancel={handleCancel}
          isOptional={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerButton: {
    marginLeft: spacing.lg,
  },
});

export default ReflectionScreen;
