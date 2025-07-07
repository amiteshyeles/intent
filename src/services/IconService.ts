import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

interface IconMap {
  [key: string]: any;
}

class IconService {
  private static instance: IconService;
  
  // Icon map - maps app names to their require() calls
  private iconMap: IconMap = {
    'instagram': require('../../app_icons/instagram.png'),
    'tiktok': require('../../app_icons/tiktok.png'),
    'youtube': require('../../app_icons/youtube.png'),
    'facebook': require('../../app_icons/facebook.png'),
    'twitter': require('../../app_icons/x.png'),
    'snapchat': require('../../app_icons/snapchat.png'),
    'whatsapp': require('../../app_icons/whatsapp.png'),
    'telegram': require('../../app_icons/telegram.png'),
    'discord': require('../../app_icons/discord.png'),
    'reddit': require('../../app_icons/reddit.png'),
  };

  static getInstance(): IconService {
    if (!IconService.instance) {
      IconService.instance = new IconService();
    }
    return IconService.instance;
  }

  // Check if an icon is available for an app
  hasIcon(appName: string): boolean {
    const normalizedName = appName.toLowerCase().replace(/\s+/g, '');
    return this.iconMap[normalizedName] !== undefined;
  }

  // Get icon asset for an app
  getIconAsset(appName: string): any | null {
    const normalizedName = appName.toLowerCase().replace(/\s+/g, '');
    return this.iconMap[normalizedName] || null;
  }

  // Get all available icon names
  getAvailableIcons(): string[] {
    return Object.keys(this.iconMap);
  }

  // Save icon to camera roll
  async saveIconToCameraRoll(appName: string): Promise<boolean> {
    try {
      const iconAsset = this.getIconAsset(appName);
      if (!iconAsset) {
        throw new Error(`No icon available for ${appName}`);
      }

      // Permission should already be granted by the caller

      // Get the asset info
      const asset = Asset.fromModule(iconAsset);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error('Failed to download asset');
      }

      // Create a temporary file with a proper name
      const fileName = `${appName.replace(/\s+/g, '_')}_icon.png`;
      const tempPath = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: tempPath,
      });

      // Save to camera roll
      const mediaAsset = await MediaLibrary.createAssetAsync(tempPath);
      
      // Try to create or add to "App Icons" album
      try {
        const album = await MediaLibrary.getAlbumAsync('App Icons');
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([mediaAsset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync('App Icons', mediaAsset, false);
        }
      } catch (albumError) {
        console.log('Could not create album, icon saved to Photos:', albumError);
      }

      return true;
    } catch (error) {
      console.error(`Failed to save ${appName} icon to Photos:`, error);
      return false;
    }
  }

  // Save icon to files (via sharing)
  async saveIconToFiles(appName: string): Promise<boolean> {
    try {
      const iconAsset = this.getIconAsset(appName);
      if (!iconAsset) {
        throw new Error(`No icon available for ${appName}`);
      }

      // Get the asset info
      const asset = Asset.fromModule(iconAsset);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error('Failed to download asset');
      }

      // Create a temporary file with a proper name
      const fileName = `${appName.replace(/\s+/g, '_')}_icon.png`;
      const tempPath = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: tempPath,
      });

      // Share the file
      await Sharing.shareAsync(tempPath);
      return true;
    } catch (error) {
      console.error(`Failed to save ${appName} icon to files:`, error);
      return false;
    }
  }

  // Batch save icons to camera roll
  async batchSaveToCameraRoll(appNames: string[]): Promise<{ success: number; failed: string[] }> {
    const results = { success: 0, failed: [] as string[] };
    
    // Permission should already be granted by the caller
    for (const appName of appNames) {
      const success = await this.saveIconToCameraRoll(appName);
      if (success) {
        results.success++;
      } else {
        results.failed.push(appName);
      }
    }
    
    return results;
  }

  // Batch save icons to files
  async batchSaveToFiles(appNames: string[]): Promise<{ success: number; failed: string[] }> {
    try {
      const validApps = appNames.filter(name => this.hasIcon(name));
      
      if (validApps.length === 0) {
        return { success: 0, failed: appNames };
      }

      // Create a temporary directory for the icons
      const tempDir = `${FileSystem.cacheDirectory}app_icons/`;
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      const iconPaths: string[] = [];
      const failed: string[] = [];

      for (const appName of validApps) {
        try {
          const iconAsset = this.getIconAsset(appName);
          const asset = Asset.fromModule(iconAsset);
          await asset.downloadAsync();

          if (asset.localUri) {
            const fileName = `${appName.replace(/\s+/g, '_')}_icon.png`;
            const filePath = `${tempDir}${fileName}`;
            
            await FileSystem.copyAsync({
              from: asset.localUri,
              to: filePath,
            });
            
            iconPaths.push(filePath);
          } else {
            failed.push(appName);
          }
        } catch (error) {
          console.error(`Failed to prepare ${appName} icon:`, error);
          failed.push(appName);
        }
      }

      if (iconPaths.length > 0) {
        // Share the icons
        if (iconPaths.length === 1) {
          await Sharing.shareAsync(iconPaths[0]);
        } else {
          // Share the directory containing all icons
          await Sharing.shareAsync(tempDir);
        }
      }

      return { success: iconPaths.length, failed };
    } catch (error) {
      console.error('Error in batch save to files:', error);
      return { success: 0, failed: appNames };
    }
  }
}

export default IconService; 