export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  deepLink: string;
  isEnabled: boolean;
  delaySeconds: number;
  allowBypass: boolean;
  bypassAfterSeconds: number;
  questionsType: 'default' | 'gratitude' | 'productivity' | 'mindfulness';
  lastLaunched?: Date;
  launchCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalSettings {
  defaultDelay: number;
  enableAll: boolean;
  temporaryDisableUntil?: Date;
  questionRotationEnabled: boolean;
  productiveAppsEnabled: boolean;
  selectedProductiveApps: ProductiveApp[];
  onboardingCompleted: boolean;
  darkModeEnabled: boolean;
  soundEnabled: boolean;
}

export interface QuestionBank {
  gratitude: string[];
  productivity: string[];
  mindfulness: string[];
  default: string[];
}

export interface ProductiveApp {
  name: string;
  deepLink: string;
  icon: string;
  description: string;
  category: 'productivity' | 'wellness' | 'learning' | 'creative';
  isInstalled?: boolean;
}

export interface PopularApp {
  name: string;
  deepLink: string;
  icon: string;
  category: 'social' | 'entertainment' | 'news' | 'gaming';
}

export interface QuestionHistory {
  questionId: string;
  question: string;
  answeredAt: Date;
  appName: string;
  completed: boolean;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface ReflectionSession {
  id: string;
  appId: string;
  appName: string;
  question: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  bypassed: boolean;
  proceededToApp: boolean;
  alternativeAppChosen?: string;
}

export type NavigationScreens = {
  Dashboard: undefined;
  AddApp: undefined;
  AppSelection: undefined;
  CustomApp: undefined;
  Reflection: {
    appId: string;
    targetDeepLink: string;
  };
  PostReflection: {
    appId: string;
    appName: string;
    targetDeepLink: string;
  };
  Settings: undefined;
  ProductiveAppsSettings: undefined;
  Onboarding: undefined;
  AppSettings: {
    appId: string;
  };
};

export interface AppListItemProps {
  app: AppConfig;
  onToggle: (appId: string, enabled: boolean) => void;
  onSettings: (appId: string) => void;
  onEdit: (appId: string) => void;
  onDelete: (appId: string) => void;
}

export interface CountdownTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onBypass: () => void;
  onCancel?: () => void;
  question: string;
  appName: string;
  isPaused?: boolean;
  showBypassAfterSeconds?: number;
}

export interface QuestionCardProps {
  question: string;
  appName: string;
  onAnswer?: (answer: string) => void;
  onCancel?: () => void;
  isOptional?: boolean;
} 