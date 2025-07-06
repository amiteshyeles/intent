import { Linking, Share, Alert } from 'react-native';
import { AppConfig } from '../types';
import DeepLinkService from './DeepLinkService';

interface ShortcutConfig {
  appName: string;
  appId: string;
  targetDeepLink: string;
  reflectionDeepLink: string;
  icon?: string;
  iCloudLink?: string;
}

interface iCloudShortcutLinks {
  development: { [appId: string]: string };
  production: { [appId: string]: string };
}

class ShortcutService {
  private static instance: ShortcutService;

  // Pre-created iCloud shortcut links for popular apps
  private iCloudShortcutLinks: iCloudShortcutLinks = {
    development: {
      // Add your development iCloud shortcut links here
      // 'instagram': 'https://www.icloud.com/shortcuts/your-development-shortcut-id',
      'instagram': 'https://www.icloud.com/shortcuts/30ce356f4e80420aa23e567e1a63a008'
    },
    production: {
      // Add your production iCloud shortcut links here  
      // 'instagram': 'https://www.icloud.com/shortcuts/your-production-shortcut-id',
    }
  };

  // Initialize with any existing shortcuts
  constructor() {
    // You can add your shortcuts here for testing
    // For example, if you have an Instagram shortcut:
    // this.addICloudShortcutLink('instagram', true, 'YOUR_DEVELOPMENT_ICLOUD_LINK');
    // this.addICloudShortcutLink('instagram', false, 'YOUR_PRODUCTION_ICLOUD_LINK');
  }

  // Quick setup method for testing - you can call this to add your Instagram shortcut
  setupTestShortcuts(instagramICloudLink: string) {
    // Add for current environment
    const deepLinkService = DeepLinkService.getInstance();
    const envInfo = deepLinkService.getEnvironmentInfo();
    
    this.addICloudShortcutLink('instagram', envInfo.isDevelopment, instagramICloudLink);
    
    console.log(`✅ Added Instagram iCloud shortcut for ${envInfo.description}`);
    console.log(`Link: ${instagramICloudLink}`);
  }

  static getInstance(): ShortcutService {
    if (!ShortcutService.instance) {
      ShortcutService.instance = new ShortcutService();
    }
    return ShortcutService.instance;
  }

  // Open the Shortcuts app (we'll guide users through manual creation)
  generateShortcutURL(appConfig: AppConfig): string {
    // Just open the Shortcuts app - we'll guide users through manual creation
    // This is more reliable than trying to auto-import shortcuts
    return 'shortcuts://';
  }

  // Generate a shareable shortcut link
  async shareShortcut(appConfig: AppConfig): Promise<boolean> {
    try {
      const shortcutURL = this.generateShortcutURL(appConfig);
      
      const message = `Install this mindful shortcut for ${appConfig.name}:\n\n${shortcutURL}`;
      
      await Share.share({
        message,
        title: `Mindful ${appConfig.name} Shortcut`,
        url: shortcutURL,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to share shortcut:', error);
      return false;
    }
  }

  // Open the iOS Shortcuts app to create a shortcut
  async openShortcutsApp(appConfig: AppConfig): Promise<boolean> {
    try {
      const shortcutURL = this.generateShortcutURL(appConfig);
      const supported = await Linking.canOpenURL(shortcutURL);
      
      if (supported) {
        await Linking.openURL(shortcutURL);
        return true;
      } else {
        // Fallback: open shortcuts app directly
        const shortcutsAppURL = 'shortcuts://';
        const shortcutsSupported = await Linking.canOpenURL(shortcutsAppURL);
        
        if (shortcutsSupported) {
          await Linking.openURL(shortcutsAppURL);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to open Shortcuts app:', error);
      return false;
    }
  }

  // Create shortcut configuration
  createShortcutConfig(appConfig: AppConfig): ShortcutConfig {
    // Use the app name in lowercase with spaces replaced by hyphens for the URL
    const appUrlName = appConfig.name.toLowerCase().replace(/\s+/g, '-');
    
    // Generate environment-appropriate deep link
    const deepLinkService = DeepLinkService.getInstance();
    const reflectionDeepLink = deepLinkService.generateDeepLink('reflect', { app: appUrlName });
    const envInfo = deepLinkService.getEnvironmentInfo();
    
    // Get iCloud shortcut link if available
    const iCloudLink = this.getICloudShortcutLink(appUrlName, envInfo.isDevelopment);
    
    return {
      appName: `Mindful ${appConfig.name}`,
      appId: appConfig.id,
      targetDeepLink: appConfig.deepLink,
      reflectionDeepLink: reflectionDeepLink,
      icon: appConfig.icon,
      iCloudLink: iCloudLink,
    };
  }

  // Get iCloud shortcut link for an app
  private getICloudShortcutLink(appId: string, isDevelopment: boolean): string | undefined {
    const environment = isDevelopment ? 'development' : 'production';
    return this.iCloudShortcutLinks[environment][appId];
  }

  // Check if iCloud shortcut is available for an app
  hasICloudShortcut(appConfig: AppConfig): boolean {
    const appUrlName = appConfig.name.toLowerCase().replace(/\s+/g, '-');
    const deepLinkService = DeepLinkService.getInstance();
    const envInfo = deepLinkService.getEnvironmentInfo();
    return !!this.getICloudShortcutLink(appUrlName, envInfo.isDevelopment);
  }

  // Open iCloud shortcut for automatic installation
  async openICloudShortcut(appConfig: AppConfig): Promise<boolean> {
    const shortcutConfig = this.createShortcutConfig(appConfig);
    
    if (!shortcutConfig.iCloudLink) {
      console.error('No iCloud shortcut link available for:', appConfig.name);
      return false;
    }

    try {
      const supported = await Linking.canOpenURL(shortcutConfig.iCloudLink);
      if (supported) {
        await Linking.openURL(shortcutConfig.iCloudLink);
        return true;
      } else {
        console.error('Cannot open iCloud shortcut link:', shortcutConfig.iCloudLink);
        return false;
      }
    } catch (error) {
      console.error('Failed to open iCloud shortcut:', error);
      return false;
    }
  }

  // Add an iCloud shortcut link for an app
  addICloudShortcutLink(appId: string, isDevelopment: boolean, iCloudLink: string): void {
    const environment = isDevelopment ? 'development' : 'production';
    this.iCloudShortcutLinks[environment][appId] = iCloudLink;
  }

  // Generate manual setup instructions
  getSetupInstructions(appConfig: AppConfig): string[] {
    const shortcutConfig = this.createShortcutConfig(appConfig);
    
    return [
      `1. Open the Shortcuts app on your iPhone`,
      `2. Tap the "+" button to create a new shortcut`,
      `3. Tap "Add Action" and search for "Open URL"`,
      `4. Enter this URL: ${shortcutConfig.reflectionDeepLink}`,
      `5. Tap "Next" and name it "${shortcutConfig.appName}"`,
      `6. Tap "Done" to save the shortcut`,
      `7. Tap the share button and select "Add to Home Screen"`,
      `8. Choose an icon and tap "Add"`,
      `9. Optional: Hide the original ${appConfig.name} app by removing it from your home screen`,
    ];
  }

  // Generate shortcut creation guide with copy-paste text
  getShortcutCreationGuide(appConfig: AppConfig): {
    title: string;
    deepLink: string;
    instructions: string[];
    copyText: string;
  } {
    const shortcutConfig = this.createShortcutConfig(appConfig);
    
    return {
      title: shortcutConfig.appName,
      deepLink: shortcutConfig.reflectionDeepLink,
      instructions: this.getSetupInstructions(appConfig),
      copyText: shortcutConfig.reflectionDeepLink,
    };
  }

  // Check if shortcuts app is available
  async isShortcutsAppAvailable(): Promise<boolean> {
    try {
      return await Linking.canOpenURL('shortcuts://');
    } catch {
      return false;
    }
  }

  // Show onboarding flow (now handled by the modal component)
  async showOnboarding(appConfig: AppConfig) {
    // This method is now just a placeholder - the actual modal is shown from the component
    // The modal will be shown from the parent component that calls this service
    console.log('Showing onboarding for:', appConfig.name);
  }



  // Show setup instructions with copy functionality (legacy method)
  async showSetupInstructions(appConfig: AppConfig) {
    const guide = this.getShortcutCreationGuide(appConfig);
    
    const instructions = guide.instructions.join('\n\n');
    
    Alert.alert(
      `Setup ${guide.title}`,
      instructions + '\n\nThe deep link has been copied to your clipboard.',
      [
        {
          text: 'Open Shortcuts App',
          onPress: () => this.openShortcutsApp(appConfig),
        },
        {
          text: 'Copy Deep Link',
          onPress: () => {
            // In a real app, you'd use Clipboard.setString(guide.deepLink)
            console.log('Deep link copied:', guide.deepLink);
          },
        },
        {
          text: 'Done',
          style: 'cancel',
        },
      ]
    );
  }

  // Generate a complete onboarding flow for an app
  async startOnboardingFlow(appConfig: AppConfig): Promise<void> {
    const isAvailable = await this.isShortcutsAppAvailable();
    
    if (!isAvailable) {
      Alert.alert(
        'Shortcuts App Required',
        'This feature requires the iOS Shortcuts app, which should be pre-installed on your device. Please check your App Library or reinstall it from the App Store.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Now handled by the modal component
    this.showOnboarding(appConfig);
  }

  // Test a shortcut by opening the deep link
  async testShortcut(appConfig: AppConfig): Promise<boolean> {
    const shortcutConfig = this.createShortcutConfig(appConfig);
    
    try {
      await Linking.openURL(shortcutConfig.reflectionDeepLink);
      return true;
    } catch (error) {
      console.error('Failed to test shortcut:', error);
      return false;
    }
  }
}

export default ShortcutService; 