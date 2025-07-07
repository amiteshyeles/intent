import * as MediaLibrary from 'expo-media-library';
import { Alert, Linking } from 'react-native';

interface PermissionResult {
  granted: boolean;
  requiresSettings: boolean;
  message?: string;
}

class PermissionService {
  private static instance: PermissionService;

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Request photo library permission with proper user guidance
   * @returns Promise<PermissionResult>
   */
  async requestPhotoPermission(): Promise<PermissionResult> {
    try {
      // Get current permission status
      const currentStatus = await MediaLibrary.getPermissionsAsync();
      console.log('Current photo permission status:', JSON.stringify(currentStatus, null, 2));

      // If already granted, return success
      if (currentStatus.status === 'granted') {
        return { granted: true, requiresSettings: false };
      }

      // If we can't ask again, direct user to Settings
      if (currentStatus.canAskAgain === false) {
        return {
          granted: false,
          requiresSettings: true,
          message: 'Photo access was previously denied. Please enable it in Settings > Privacy & Security > Photos > Pause.'
        };
      }

      // Request permission (this should show the native dialog)
      console.log('Requesting photo permission...');
      const permission = await MediaLibrary.requestPermissionsAsync();
      console.log('Permission request result:', JSON.stringify(permission, null, 2));

      if (permission.status === 'granted') {
        return { granted: true, requiresSettings: false };
      }

      // Permission denied
      if (permission.canAskAgain === false) {
        return {
          granted: false,
          requiresSettings: true,
          message: 'To save icons to Photos, please go to Settings > Privacy & Security > Photos > Pause and enable access.'
        };
      } else {
        return {
          granted: false,
          requiresSettings: false,
          message: 'Photo access is required to save icons to your Photos app.'
        };
      }
    } catch (error) {
      console.error('Error requesting photo permission:', error);
      return {
        granted: false,
        requiresSettings: false,
        message: 'Failed to request photo permission. Please try again.'
      };
    }
  }

  /**
   * Show permission alert with appropriate message and actions
   * @param result - The result from requestPhotoPermission
   */
  showPermissionAlert(result: PermissionResult): void {
    if (result.granted) {
      return; // No alert needed for granted permission
    }

    const title = result.requiresSettings ? 'Photo Access Required' : 'Permission Needed';
    const message = result.message || 'Photo access is required for this feature.';

    if (result.requiresSettings) {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
            }
          }
        ]
      );
    } else {
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  }

  /**
   * Request photo permission and show appropriate alerts
   * @returns Promise<boolean> - true if permission granted
   */
  async requestPhotoPermissionWithAlert(): Promise<boolean> {
    const result = await this.requestPhotoPermission();
    
    if (!result.granted) {
      this.showPermissionAlert(result);
    }
    
    return result.granted;
  }
}

export default PermissionService; 