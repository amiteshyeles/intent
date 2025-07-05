import { Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { NavigationScreens } from '../types';
import StorageService from './StorageService';

interface DeepLinkParams {
  app?: string;
  action?: string;
}

class DeepLinkService {
  private static instance: DeepLinkService;
  private navigationRef: NavigationContainerRef<NavigationScreens> | null = null;

  static getInstance(): DeepLinkService {
    if (!DeepLinkService.instance) {
      DeepLinkService.instance = new DeepLinkService();
    }
    return DeepLinkService.instance;
  }

  setNavigationRef(ref: NavigationContainerRef<NavigationScreens>) {
    this.navigationRef = ref;
  }

  async initialize() {
    // Handle deep links when app is opened from a link
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      this.handleDeepLink(initialUrl);
    }

    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }

  private handleDeepLink = async (url: string) => {
    console.log('Deep link received:', url);
    
    try {
      const params = this.parseDeepLink(url);
      
      if (params.app) {
        // Navigate to reflection screen for specific app
        await this.navigateToReflection(params.app);
      } else {
        // Navigate to dashboard if no specific app
        this.navigateToDashboard();
      }
    } catch (error) {
      console.error('Failed to handle deep link:', error);
      this.navigateToDashboard();
    }
  };

  private parseDeepLink(url: string): DeepLinkParams {
    // Parse URLs like: intentional://reflect?app=instagram
    const urlParts = url.split('://');
    if (urlParts.length < 2 || urlParts[0] !== 'intentional') {
      throw new Error('Invalid deep link format');
    }

    const pathAndQuery = urlParts[1];
    const [path, query] = pathAndQuery.split('?');
    
    const params: DeepLinkParams = {};
    
    // Parse action from path
    if (path) {
      params.action = path;
    }
    
    // Parse query parameters
    if (query) {
      const queryParams = new URLSearchParams(query);
      params.app = queryParams.get('app') || undefined;
    }
    
    return params;
  }

  private async navigateToReflection(appName: string) {
    if (!this.navigationRef) {
      console.error('Navigation ref not set');
      return;
    }

    try {
      // Find the app config by name
      const storage = StorageService.getInstance();
      const appConfig = await this.findAppByName(appName);
      
      if (!appConfig) {
        console.error('App not found:', appName);
        this.navigateToDashboard();
        return;
      }

      // Navigate to reflection screen with app parameter
      this.navigationRef.navigate('Reflection', { 
        appId: appConfig.id,
        targetDeepLink: appConfig.deepLink
      });
    } catch (error) {
      console.error('Failed to navigate to reflection:', error);
      this.navigateToDashboard();
    }
  }

  private async findAppByName(appName: string) {
    try {
      const storage = StorageService.getInstance();
      const apps = await storage.loadAppConfigs();
      
      // Convert URL-friendly name back to original name for comparison
      const searchName = appName.replace(/-/g, ' ').toLowerCase();
      
      return apps.find(app => 
        app.name.toLowerCase() === searchName ||
        app.name.toLowerCase().replace(/\s+/g, '-') === appName
      );
    } catch (error) {
      console.error('Failed to find app by name:', error);
      return null;
    }
  }

  private navigateToDashboard() {
    if (!this.navigationRef) {
      console.error('Navigation ref not set');
      return;
    }

    this.navigationRef.navigate('Dashboard');
  }

  private getAppDeepLink(appId: string): string {
    // This is a simplified mapping - in production, this would come from storage
    const appDeepLinks: { [key: string]: string } = {
      'instagram': 'instagram://',
      'tiktok': 'tiktok://',
      'youtube': 'youtube://',
      'twitter': 'twitter://',
      'facebook': 'fb://',
      'reddit': 'reddit://',
      'snapchat': 'snapchat://',
      'pinterest': 'pinterest://',
      'linkedin': 'linkedin://',
      'whatsapp': 'whatsapp://',
      'discord': 'discord://',
      'twitch': 'twitch://',
      'netflix': 'nflx://',
      'spotify': 'spotify://',
      'music': 'music://',
      'news': 'applenews://',
      'safari': 'http://',
    };

    return appDeepLinks[appId.toLowerCase()] || 'http://';
  }

  // Method to launch the target app after reflection
  async launchApp(deepLink: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(deepLink);
      if (supported) {
        await Linking.openURL(deepLink);
        return true;
      } else {
        console.error('App not installed or deep link not supported:', deepLink);
        return false;
      }
    } catch (error) {
      console.error('Failed to launch app:', error);
      return false;
    }
  }

  // Generate test deep link for development
  generateTestDeepLink(appName: string): string {
    // Convert app name to URL-friendly format
    const urlFriendlyName = appName.toLowerCase().replace(/\s+/g, '-');
    return `intentional://reflect?app=${urlFriendlyName}`;
  }
}

export default DeepLinkService; 