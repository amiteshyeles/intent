import { PopularApp, ProductiveApp } from '../types';

export const POPULAR_APPS: PopularApp[] = [
  {
    name: 'Instagram',
    deepLink: 'instagram://',
    icon: 'logo-instagram',
    category: 'social',
  },
  {
    name: 'TikTok',
    deepLink: 'tiktok://',
    icon: 'logo-tiktok',
    category: 'social',
  },
  {
    name: 'YouTube',
    deepLink: 'youtube://',
    icon: 'logo-youtube',
    category: 'entertainment',
  },
  {
    name: 'Twitter',
    deepLink: 'twitter://',
    icon: 'logo-twitter',
    category: 'social',
  },
  {
    name: 'Facebook',
    deepLink: 'fb://',
    icon: 'logo-facebook',
    category: 'social',
  },
  {
    name: 'Reddit',
    deepLink: 'reddit://',
    icon: 'logo-reddit',
    category: 'social',
  },
  {
    name: 'Snapchat',
    deepLink: 'snapchat://',
    icon: 'logo-snapchat',
    category: 'social',
  },
  {
    name: 'Pinterest',
    deepLink: 'pinterest://',
    icon: 'logo-pinterest',
    category: 'social',
  },
  {
    name: 'LinkedIn',
    deepLink: 'linkedin://',
    icon: 'logo-linkedin',
    category: 'social',
  },
  {
    name: 'WhatsApp',
    deepLink: 'whatsapp://',
    icon: 'logo-whatsapp',
    category: 'social',
  },
  {
    name: 'Discord',
    deepLink: 'discord://',
    icon: 'logo-discord',
    category: 'social',
  },
  {
    name: 'Twitch',
    deepLink: 'twitch://',
    icon: 'logo-twitch',
    category: 'entertainment',
  },
  {
    name: 'Netflix',
    deepLink: 'nflx://',
    icon: 'tv-outline',
    category: 'entertainment',
  },
  {
    name: 'Spotify',
    deepLink: 'spotify://',
    icon: 'musical-notes-outline',
    category: 'entertainment',
  },
  {
    name: 'Apple Music',
    deepLink: 'music://',
    icon: 'musical-note-outline',
    category: 'entertainment',
  },
  {
    name: 'News',
    deepLink: 'applenews://',
    icon: 'newspaper-outline',
    category: 'news',
  },
  {
    name: 'Safari',
    deepLink: 'http://',
    icon: 'compass-outline',
    category: 'entertainment',
  },
];

export const PRODUCTIVE_APPS: ProductiveApp[] = [
  {
    name: 'Notes',
    deepLink: 'mobilenotes://',
    icon: 'document-text-outline',
    description: 'Capture your thoughts',
    category: 'productivity',
  },
  {
    name: 'Notion',
    deepLink: 'notion://',
    icon: 'library-outline',
    description: 'Organize your life',
    category: 'productivity',
  },
  {
    name: 'Obsidian',
    deepLink: 'obsidian://',
    icon: 'git-network-outline',
    description: 'Connect your ideas',
    category: 'productivity',
  },
  {
    name: 'Todoist',
    deepLink: 'todoist://',
    icon: 'checkbox-outline',
    description: 'Get things done',
    category: 'productivity',
  },
  {
    name: 'Any.do',
    deepLink: 'anydo://',
    icon: 'checkmark-done-outline',
    description: 'Simple task management',
    category: 'productivity',
  },
  {
    name: 'Evernote',
    deepLink: 'evernote://',
    icon: 'folder-outline',
    description: 'Remember everything',
    category: 'productivity',
  },
  {
    name: 'Kindle',
    deepLink: 'kindle://',
    icon: 'book-outline',
    description: 'Read something meaningful',
    category: 'learning',
  },
  {
    name: 'Audible',
    deepLink: 'audible://',
    icon: 'headset-outline',
    description: 'Listen and learn',
    category: 'learning',
  },
  {
    name: 'Duolingo',
    deepLink: 'duolingo://',
    icon: 'language-outline',
    description: 'Learn a new language',
    category: 'learning',
  },
  {
    name: 'Khan Academy',
    deepLink: 'khanacademy://',
    icon: 'school-outline',
    description: 'Expand your knowledge',
    category: 'learning',
  },
  {
    name: 'Coursera',
    deepLink: 'coursera://',
    icon: 'ribbon-outline',
    description: 'Take a course',
    category: 'learning',
  },
  {
    name: 'Headspace',
    deepLink: 'headspace://',
    icon: 'flower-outline',
    description: 'Take a mindful moment',
    category: 'wellness',
  },
  {
    name: 'Calm',
    deepLink: 'calm://',
    icon: 'leaf-outline',
    description: 'Find your calm',
    category: 'wellness',
  },
  {
    name: 'Medito',
    deepLink: 'medito://',
    icon: 'heart-outline',
    description: 'Practice meditation',
    category: 'wellness',
  },
  {
    name: 'Apple Health',
    deepLink: 'x-apple-health://',
    icon: 'fitness-outline',
    description: 'Check your health',
    category: 'wellness',
  },
  {
    name: 'Fitness+',
    deepLink: 'fitness://',
    icon: 'barbell-outline',
    description: 'Get moving',
    category: 'wellness',
  },
  {
    name: 'Procreate',
    deepLink: 'procreate://',
    icon: 'brush-outline',
    description: 'Create something beautiful',
    category: 'creative',
  },
  {
    name: 'GarageBand',
    deepLink: 'garageband://',
    icon: 'musical-notes-outline',
    description: 'Make music',
    category: 'creative',
  },
  {
    name: 'Camera',
    deepLink: 'camera://',
    icon: 'camera-outline',
    description: 'Capture a moment',
    category: 'creative',
  },
  {
    name: 'Voice Memos',
    deepLink: 'voicememos://',
    icon: 'mic-outline',
    description: 'Record your thoughts',
    category: 'creative',
  },
];

export const getAppsByCategory = (category: string): PopularApp[] => {
  return POPULAR_APPS.filter(app => app.category === category);
};

export const getProductiveAppsByCategory = (category: string): ProductiveApp[] => {
  return PRODUCTIVE_APPS.filter(app => app.category === category);
};

// This function will be updated to use user preferences
// For now, it returns the default time-based suggestions
export const getProductiveAlternatives = (blockedAppName: string): ProductiveApp[] => {
  const hour = new Date().getHours();
  
  if (hour >= 9 && hour <= 17) {
    // Work hours - productivity focused
    return PRODUCTIVE_APPS.filter(app => 
      app.category === 'productivity' || app.category === 'learning'
    ).slice(0, 3);
  } else {
    // Evening/morning - wellness and learning
    return PRODUCTIVE_APPS.filter(app => 
      app.category === 'wellness' || app.category === 'learning' || app.category === 'creative'
    ).slice(0, 3);
  }
};

// New function that uses user preferences
export const getProductiveAlternativesFromUserPrefs = (selectedApps: ProductiveApp[]): ProductiveApp[] => {
  if (selectedApps && selectedApps.length > 0) {
    return selectedApps.slice(0, 3);
  }
  
  // Fallback to default time-based suggestions
  return getProductiveAlternatives('');
};

export const searchApps = (query: string): PopularApp[] => {
  if (!query) return POPULAR_APPS;
  
  return POPULAR_APPS.filter(app => 
    app.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const searchProductiveApps = (query: string): ProductiveApp[] => {
  if (!query) return PRODUCTIVE_APPS;
  
  return PRODUCTIVE_APPS.filter(app => 
    app.name.toLowerCase().includes(query.toLowerCase()) ||
    app.description.toLowerCase().includes(query.toLowerCase())
  );
}; 