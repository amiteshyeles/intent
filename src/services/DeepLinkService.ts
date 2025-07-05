import { Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { NavigationScreens } from '../types';
import StorageService from './StorageService';
import Constants from 'expo-constants';

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

  // Check if we're in development environment
  private isDevelopment(): boolean {
    return __DEV__ || Constants.appOwnership === 'expo';
  }

  // Get the appropriate URL scheme for the current environment
  private getUrlScheme(): string {
    if (this.isDevelopment()) {
      // For development, use exp:// with the manifest URL
      const { manifest } = Constants;
      if (manifest?.debuggerHost) {
        const host = manifest.debuggerHost.split(':')[0];
        return `exp://${host}:8081/--`;
      }
      return 'exp://localhost:8081/--';
    }
    return 'intentional://';
  }

  // Generate environment-appropriate deep link
  generateDeepLink(path: string, params?: Record<string, string>): string {
    const scheme = this.getUrlScheme();
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    
    if (this.isDevelopment()) {
      // For development: exp://host:port/--/path?params
      return `${scheme}/${path}${queryString}`;
    } else {
      // For production: intentional://path?params
      return `${scheme}${path}${queryString}`;
    }
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Don't log errors for development URLs - they're expected
      if (errorMessage === 'Development URL ignored') {
        console.log('Ignoring development URL as expected');
        return;
      }
      
      // Log actual errors
      console.error('Failed to handle deep link:', errorMessage);
      
      // Only navigate to dashboard for actual intentional:// URLs that failed
      if (url.startsWith('intentional://')) {
        this.navigateToDashboard();
      }
    }
  };

  private parseDeepLink(url: string): DeepLinkParams {
    console.log('Parsing deep link:', url);
    
    const urlParts = url.split('://');
    if (urlParts.length < 2) {
      throw new Error('Invalid deep link format');
    }

    const scheme = urlParts[0];
    let pathAndQuery = urlParts[1];
    
    // Handle different URL schemes
    if (scheme === 'exp' || scheme === 'exps') {
      // Development URLs: exp://host:port/--/reflect?app=instagram
      const expParts = pathAndQuery.split('/--/');
      if (expParts.length < 2) {
        console.log('Ignoring non-deep-link Expo URL:', url);
        throw new Error('Development URL ignored');
      }
      pathAndQuery = expParts[1]; // Get the part after /--/
    } else if (scheme === 'intentional') {
      // Production URLs: intentional://reflect?app=instagram
      // pathAndQuery is already correct
    } else {
      throw new Error(`Unsupported URL scheme: ${scheme}`);
    }

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
    return this.generateDeepLink('reflect', { app: urlFriendlyName });
  }

  // Get environment info for display
  getEnvironmentInfo(): { isDevelopment: boolean; scheme: string; description: string } {
    const isDev = this.isDevelopment();
    return {
      isDevelopment: isDev,
      scheme: this.getUrlScheme(),
      description: isDev ? 'Development (Expo Go)' : 'Production (Standalone App)'
    };
  }
}

export default DeepLinkService; 