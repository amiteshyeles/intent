import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AppConfig, 
  GlobalSettings, 
  QuestionHistory, 
  ReflectionSession 
} from '../types';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // App Configuration Methods
  async saveAppConfigs(configs: AppConfig[]): Promise<void> {
    try {
      await AsyncStorage.setItem('app_configs', JSON.stringify(configs));
    } catch (error) {
      console.error('Failed to save app configs:', error);
    }
  }

  async loadAppConfigs(): Promise<AppConfig[]> {
    try {
      const configs = await AsyncStorage.getItem('app_configs');
      if (!configs) return [];
      
      const parsed = JSON.parse(configs);
      // Convert date strings back to Date objects
      return parsed.map((config: any) => ({
        ...config,
        lastLaunched: config.lastLaunched ? new Date(config.lastLaunched) : undefined,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load app configs:', error);
      return [];
    }
  }

  async saveAppConfig(config: AppConfig): Promise<void> {
    try {
      const configs = await this.loadAppConfigs();
      const existingIndex = configs.findIndex(c => c.id === config.id);
      
      if (existingIndex >= 0) {
        configs[existingIndex] = { ...config, updatedAt: new Date() };
      } else {
        configs.push(config);
      }
      
      await this.saveAppConfigs(configs);
    } catch (error) {
      console.error('Failed to save app config:', error);
    }
  }

  async deleteAppConfig(appId: string): Promise<void> {
    try {
      const configs = await this.loadAppConfigs();
      const filteredConfigs = configs.filter(c => c.id !== appId);
      await this.saveAppConfigs(filteredConfigs);
    } catch (error) {
      console.error('Failed to delete app config:', error);
    }
  }

  async getAppConfig(appId: string): Promise<AppConfig | undefined> {
    try {
      const configs = await this.loadAppConfigs();
      return configs.find(c => c.id === appId);
    } catch (error) {
      console.error('Failed to get app config:', error);
      return undefined;
    }
  }

  // Global Settings Methods
  async saveGlobalSettings(settings: GlobalSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('global_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save global settings:', error);
    }
  }

  async loadGlobalSettings(): Promise<GlobalSettings> {
    try {
      const settings = await AsyncStorage.getItem('global_settings');
      if (!settings) {
        return this.getDefaultSettings();
      }
      
      const parsed = JSON.parse(settings);
      return {
        ...parsed,
        temporaryDisableUntil: parsed.temporaryDisableUntil 
          ? new Date(parsed.temporaryDisableUntil) 
          : undefined,
      };
    } catch (error) {
      console.error('Failed to load global settings:', error);
      return this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): GlobalSettings {
    return {
      defaultDelay: 60,
      enableAll: true,
      temporaryDisableUntil: undefined,
      questionRotationEnabled: true,
      productiveAppsEnabled: true,
      onboardingCompleted: false,
      darkModeEnabled: false,
      soundEnabled: true,
    };
  }

  // Question History Methods
  async saveQuestionHistory(history: QuestionHistory): Promise<void> {
    try {
      const existingHistory = await this.loadQuestionHistory();
      existingHistory.push(history);
      
      // Keep only last 100 records to prevent unlimited growth
      const recentHistory = existingHistory.slice(-100);
      
      await AsyncStorage.setItem('question_history', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Failed to save question history:', error);
    }
  }

  async loadQuestionHistory(): Promise<QuestionHistory[]> {
    try {
      const history = await AsyncStorage.getItem('question_history');
      if (!history) return [];
      
      const parsed = JSON.parse(history);
      return parsed.map((item: any) => ({
        ...item,
        answeredAt: new Date(item.answeredAt),
      }));
    } catch (error) {
      console.error('Failed to load question history:', error);
      return [];
    }
  }

  async getRecentQuestions(dayCount: number = 7): Promise<string[]> {
    try {
      const history = await this.loadQuestionHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayCount);
      
      return history
        .filter(item => item.answeredAt >= cutoffDate)
        .map(item => item.question);
    } catch (error) {
      console.error('Failed to get recent questions:', error);
      return [];
    }
  }

  // Reflection Session Methods
  async saveReflectionSession(session: ReflectionSession): Promise<void> {
    try {
      const sessions = await this.loadReflectionSessions();
      sessions.push(session);
      
      // Keep only last 50 sessions
      const recentSessions = sessions.slice(-50);
      
      await AsyncStorage.setItem('reflection_sessions', JSON.stringify(recentSessions));
    } catch (error) {
      console.error('Failed to save reflection session:', error);
    }
  }

  async loadReflectionSessions(): Promise<ReflectionSession[]> {
    try {
      const sessions = await AsyncStorage.getItem('reflection_sessions');
      if (!sessions) return [];
      
      const parsed = JSON.parse(sessions);
      return parsed.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load reflection sessions:', error);
      return [];
    }
  }

  async getAppUsageStats(appId: string): Promise<{
    totalReflections: number;
    completedReflections: number;
    bypassedReflections: number;
    averageReflectionTime: number;
    lastUsed?: Date;
  }> {
    try {
      const sessions = await this.loadReflectionSessions();
      const appSessions = sessions.filter(s => s.appId === appId);
      
      if (appSessions.length === 0) {
        return {
          totalReflections: 0,
          completedReflections: 0,
          bypassedReflections: 0,
          averageReflectionTime: 0,
        };
      }
      
      const completedSessions = appSessions.filter(s => s.completed);
      const bypassedSessions = appSessions.filter(s => s.bypassed);
      
      const totalReflectionTime = completedSessions.reduce((sum, session) => {
        if (session.endTime) {
          return sum + (session.endTime.getTime() - session.startTime.getTime());
        }
        return sum;
      }, 0);
      
      const lastUsed = appSessions.length > 0 
        ? new Date(Math.max(...appSessions.map(s => s.startTime.getTime())))
        : undefined;
      
      return {
        totalReflections: appSessions.length,
        completedReflections: completedSessions.length,
        bypassedReflections: bypassedSessions.length,
        averageReflectionTime: completedSessions.length > 0 
          ? totalReflectionTime / completedSessions.length / 1000 // Convert to seconds
          : 0,
        lastUsed,
      };
    } catch (error) {
      console.error('Failed to get app usage stats:', error);
      return {
        totalReflections: 0,
        completedReflections: 0,
        bypassedReflections: 0,
        averageReflectionTime: 0,
      };
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  async exportData(): Promise<string> {
    try {
      const data = {
        appConfigs: await this.loadAppConfigs(),
        globalSettings: await this.loadGlobalSettings(),
        questionHistory: await this.loadQuestionHistory(),
        reflectionSessions: await this.loadReflectionSessions(),
        exportedAt: new Date().toISOString(),
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  }
}

export default StorageService; 