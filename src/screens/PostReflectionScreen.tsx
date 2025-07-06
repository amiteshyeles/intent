import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { NavigationScreens } from '../types';
import { getProductiveAlternatives } from '../data/apps';
import StorageService from '../services/StorageService';

type PostReflectionScreenProps = StackScreenProps<NavigationScreens, 'PostReflection'>;

const PostReflectionScreen: React.FC<PostReflectionScreenProps> = ({
  route,
  navigation,
}) => {
  const { appId, appName, targetDeepLink } = route.params;
  const [isLaunching, setIsLaunching] = useState(false);
  
  const storage = StorageService.getInstance();

  const handleProceed = async () => {
    setIsLaunching(true);
    
    try {
      // Update app config with last launched time
      const appConfig = await storage.getAppConfig(appId);
      if (appConfig) {
        const updatedConfig = {
          ...appConfig,
          lastLaunched: new Date(),
          launchCount: (appConfig.launchCount || 0) + 1,
        };
        await storage.saveAppConfig(updatedConfig);
      }
      
      // Update reflection session to mark as proceeded to app
      const sessions = await storage.loadReflectionSessions();
      const recentSession = sessions
        .filter(s => s.appId === appId)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
      
      if (recentSession) {
        const updatedSession = {
          ...recentSession,
          proceededToApp: true,
        };
        await storage.saveReflectionSession(updatedSession);
      }
      
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
        [{ text: 'OK' }]
      );
    } finally {
      setIsLaunching(false);
    }
  };

  const handleCancel = () => {
    // Reset navigation stack to Dashboard (removes ability to go back)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const handleProductiveAlternative = async (deepLink: string, appName: string) => {
    try {
      // Update reflection session to mark alternative chosen
      const sessions = await storage.loadReflectionSessions();
      const recentSession = sessions
        .filter(s => s.appId === appId)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
      
      if (recentSession) {
        const updatedSession = {
          ...recentSession,
          alternativeAppChosen: appName,
        };
        await storage.saveReflectionSession(updatedSession);
      }
      
      // Launch the productive app
      await Linking.openURL(deepLink);
      
      // Reset navigation stack to Dashboard (removes ability to go back)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert(
        'Cannot Open App',
        `Unable to open ${appName}. Please make sure it is installed.`,
        [{ text: 'OK' }]
      );
    }
  };

  const [globalSettings, setGlobalSettings] = useState({ productiveAppsEnabled: true });
  
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await storage.loadGlobalSettings();
        setGlobalSettings(settings);
      } catch (error) {
        console.error('Failed to load global settings:', error);
      }
    };
    loadSettings();
  }, []);

  const productiveAlternatives = globalSettings.productiveAppsEnabled 
    ? getProductiveAlternatives(appName)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          How are you feeling?
        </Text>
        
        <Text style={styles.question}>
          After taking a moment to reflect, would you still like to proceed to {appName}?
        </Text>
        
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceed}
            disabled={isLaunching}
            activeOpacity={0.7}
          >
            <Text style={styles.proceedButtonText}>
              {isLaunching ? 'Opening...' : `Yes, open ${appName}`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>
              No, thanks for helping me pause
            </Text>
          </TouchableOpacity>
        </View>
        
        {productiveAlternatives.length > 0 && (
          <View style={styles.alternativesSection}>
            <Text style={styles.alternativesTitle}>
              Or try something more productive:
            </Text>
            
            {productiveAlternatives.slice(0, 3).map((app, index) => (
              <TouchableOpacity
                key={index}
                style={styles.alternativeOption}
                onPress={() => handleProductiveAlternative(app.deepLink, app.name)}
                activeOpacity={0.7}
              >
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeName}>{app.name}</Text>
                  <Text style={styles.alternativeDescription}>
                    {app.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  question: {
    fontSize: 18,
    color: '#34495E',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  mainActions: {
    marginBottom: 24,
  },
  proceedButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  alternativesSection: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 24,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
  },
  alternativeOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  alternativeContent: {
    alignItems: 'center',
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  alternativeDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default PostReflectionScreen;
