# 🧘‍♂️ Intentional App Launcher — Implementation Plan

## Overview
Building a mindful app launcher that introduces a 60-second pause with reflective questions to interrupt habitual phone usage. Users configure distracting apps to be intercepted, and instead of immediately opening them, they're presented with thoughtful questions that redirect their mind to more productive activities.

## Technical Architecture

### Tech Stack
- **Framework**: Expo (React Native) with TypeScript
- **Navigation**: React Navigation v6
- **Storage**: MMKV for fast, synchronous storage
- **State Management**: Context API + useReducer
- **UI Components**: Custom components with Expo Vector Icons
- **Deep Linking**: Expo Linking API
- **Background Tasks**: Expo TaskManager (for reminders)

### Project Structure
```
src/
├── components/           # Reusable UI components
├── screens/             # Screen components
├── services/            # Business logic & data services
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
├── data/               # Static data (question banks)
├── hooks/              # Custom React hooks
└── navigation/         # Navigation configuration
```

## Data Models

### Core Types
```typescript
interface AppConfig {
  id: string;
  name: string;
  icon: string;
  deepLink: string;
  isEnabled: boolean;
  delaySeconds: number;
  allowBypass: boolean;
  questionsType: 'default' | 'gratitude' | 'productivity' | 'mindfulness';
  lastLaunched?: Date;
  launchCount?: number;
}

interface GlobalSettings {
  defaultDelay: number;
  enableAll: boolean;
  temporaryDisableUntil?: Date;
  questionRotationEnabled: boolean;
  productiveAppsEnabled: boolean;
}

interface QuestionBank {
  gratitude: string[];
  productivity: string[];
  mindfulness: string[];
  default: string[];
}

interface ProductiveApp {
  name: string;
  deepLink: string;
  icon: string;
  description: string;
}
```

### Storage Service
```typescript
class StorageService {
  private static instance: StorageService;
  
  saveAppConfig(config: AppConfig[]): void
  loadAppConfigs(): AppConfig[]
  saveGlobalSettings(settings: GlobalSettings): void
  loadGlobalSettings(): GlobalSettings
  saveQuestionHistory(questionId: string, answered: boolean): void
  getQuestionHistory(): QuestionHistory[]
}
```

## Core Features Implementation

### 1. App Dashboard Screen
**File**: `src/screens/DashboardScreen.tsx`

**Components**:
- Header with app title and settings button
- Search/filter bar
- App list with toggle switches
- Floating action button to add new app
- Quick actions: "Pause All" / "Resume All"

**Key Functions**:
- Load configured apps from storage
- Toggle app enabled/disabled state
- Navigate to app-specific settings
- Navigate to add app flow

### 2. Add App Flow
**Files**: 
- `src/screens/AddAppScreen.tsx`
- `src/screens/AppSelectionScreen.tsx`
- `src/screens/CustomAppScreen.tsx`

**Popular Apps Database**:
```typescript
const POPULAR_APPS = [
  { name: 'Instagram', deepLink: 'instagram://', icon: 'instagram' },
  { name: 'TikTok', deepLink: 'tiktok://', icon: 'tiktok' },
  { name: 'YouTube', deepLink: 'youtube://', icon: 'youtube' },
  { name: 'Twitter', deepLink: 'twitter://', icon: 'twitter' },
  { name: 'Facebook', deepLink: 'fb://', icon: 'facebook' },
  { name: 'Reddit', deepLink: 'reddit://', icon: 'reddit' },
  { name: 'Snapchat', deepLink: 'snapchat://', icon: 'snapchat' },
];
```

**Custom App Configuration**:
- App name input
- Deep link input with validation
- Icon selection (from preset or emoji)
- Test deep link functionality

### 3. Reflection Flow (Core Feature)
**Files**:
- `src/screens/ReflectionScreen.tsx`
- `src/components/CountdownTimer.tsx`
- `src/components/QuestionCard.tsx`
- `src/screens/BypassFlow.tsx`
- `src/screens/PostReflectionScreen.tsx`

**Countdown Timer Component**:
```typescript
const CountdownTimer: React.FC<{
  initialSeconds: number;
  onComplete: () => void;
  onBypass: () => void;
}> = ({ initialSeconds, onComplete, onBypass }) => {
  // Circular progress indicator
  // Breathing animation during countdown
  // Bypass button (appears after 10 seconds)
};
```

**Post-Reflection Confirmation Screen**:
```typescript
const PostReflectionScreen: React.FC<{
  appName: string;
  appDeepLink: string;
  onProceed: () => void;
  onCancel: () => void;
}> = ({ appName, appDeepLink, onProceed, onCancel }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        Would you still like to proceed to {appName}?
      </Text>
      
      <Button
        title="Yes, I would like to proceed"
        onPress={onProceed}
        style={styles.proceedButton}
      />
      
      <Button
        title="No, thanks for stopping me"
        onPress={onCancel}
        style={styles.cancelButton}
      />
    </View>
  );
};
```

**Question Bank Service**:
```typescript
const QUESTION_BANKS = {
  gratitude: [
    "What is something you are grateful for today?",
    "Who in your life brings you joy?",
    "What small moment made you smile recently?",
    "What is working well in your life right now?",
  ],
  productivity: [
    "What is something you are looking forward to doing today?",
    "What is something you have to get done today?",
    "What is something you are pushing off?",
    "What would make today feel successful?",
    "What is one thing you could do right now to feel more accomplished?",
  ],
  mindfulness: [
    "How are you feeling right now?",
    "What is something you are going to do this evening?",
    "How are your parents doing?",
    "What would be a better use of your time right now?",
    "What are you avoiding by reaching for your phone?",
  ],
  default: [
    "Why are you opening this app?",
    "What are you hoping to find?",
    "Is there something more important you could do?",
  ]
};
```

### 4. Bypass Flow Implementation
**File**: `src/screens/BypassFlow.tsx`

**Flow Steps**:
1. **Purpose Check**: "Do you have a specific purpose?"
   - No → Return to home screen
   - Yes → Continue

2. **Purpose Input**: "Say your purpose out loud, then type it here"
   - Text input (not stored)
   - Voice reminder UI hint

3. **Time Commitment**: "How long will it take?"
   - Pre-set options: 5min, 10min, 15min, 30min
   - Custom time input

4. **Launch**: Open target app
5. **Timer**: Set local reminder notification

### 5. iOS Shortcuts Integration
**File**: `src/services/ShortcutService.ts`

**Shortcut Generation**:
```typescript
class ShortcutService {
  generateShortcutURL(appConfig: AppConfig): string {
    const baseURL = 'https://www.icloud.com/shortcuts/';
    const shortcutData = {
      appName: appConfig.name,
      deepLink: appConfig.deepLink,
      pauseAppDeepLink: `intentional://reflect?app=${appConfig.id}`,
    };
    return `${baseURL}${encodeURIComponent(JSON.stringify(shortcutData))}`;
  }
  
  createShortcutInstructions(appConfig: AppConfig): string[] {
    return [
      "1. Tap 'Install Shortcut' below",
      "2. Add shortcut to your home screen",
      "3. Hide the original app icon (optional)",
      "4. Use the new shortcut instead of the original app"
    ];
  }
}
```

### 6. Deep Link Handler
**File**: `src/services/DeepLinkService.ts`

```typescript
class DeepLinkService {
  setupDeepLinkHandler(): void {
    Linking.addEventListener('url', this.handleDeepLink);
  }
  
  handleDeepLink = (event: { url: string }): void => {
    const url = event.url;
    if (url.startsWith('intentional://reflect')) {
      const params = this.parseURL(url);
      NavigationService.navigate('Reflection', { appId: params.app });
    }
  };
  
  launchApp(deepLink: string): void {
    Linking.openURL(deepLink).catch(err => {
      console.error('Failed to launch app:', err);
      // Show error message to user
    });
  }
}
```

### 7. Improved Onboarding Flow
**File**: `src/screens/OnboardingScreen.tsx`

```typescript
const OnboardingScreen = ({ appConfig }: { appConfig: AppConfig }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const onboardingSteps = [
    {
      title: "Install Your Mindful Shortcut",
      description: "We'll create a special shortcut that pauses before opening apps",
      action: () => installShortcut(appConfig),
      buttonText: "Install Shortcut"
    },
    {
      title: "Add to Home Screen",
      description: "Place the shortcut where you normally tap the app",
      instruction: "In Shortcuts app: Share → Add to Home Screen",
      visual: "home-screen-demo.png"
    },
    {
      title: "Hide Original App (Recommended)",
      description: "This adds healthy friction without completely blocking access",
      options: [
        "Hide from home screen (recommended)",
        "Keep both visible",
        "Delete original app"
      ],
      explanation: {
        hide: "App moves to App Library. Still searchable if needed.",
        keep: "You'll see both icons. Requires discipline to use the right one.",
        delete: "Complete removal. You can re-download anytime."
      }
    }
  ];
  
  return (
    <View style={styles.container}>
      <StepIndicator current={currentStep} total={onboardingSteps.length} />
      
      <Text style={styles.title}>{onboardingSteps[currentStep].title}</Text>
      <Text style={styles.description}>{onboardingSteps[currentStep].description}</Text>
      
      {currentStep === 2 && <AppHidingOptions appConfig={appConfig} />}
      
      <Button
        title={onboardingSteps[currentStep].buttonText || "Next"}
        onPress={() => handleStepAction(currentStep)}
      />
    </View>
  );
};

const AppHidingOptions = ({ appConfig }: { appConfig: AppConfig }) => {
  return (
    <View style={styles.optionsContainer}>
      <Text style={styles.optionsTitle}>
        What should happen to your original {appConfig.name} app?
      </Text>
      
      <TouchableOpacity style={styles.recommendedOption}>
        <Text style={styles.optionTitle}>✅ Hide from Home Screen (Recommended)</Text>
        <Text style={styles.optionDescription}>
          • App moves to App Library{'\n'}
          • Still accessible via search if needed{'\n'}
          • Adds healthy friction without complete blocking{'\n'}
          • Can easily unhide later
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionTitle}>⚠️ Keep Both Visible</Text>
        <Text style={styles.optionDescription}>
          • Requires discipline to use the right icon{'\n'}
          • Good for testing the setup first
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionTitle}>🗑️ Delete Original App</Text>
        <Text style={styles.optionDescription}>
          • Complete removal from device{'\n'}
          • Can re-download from App Store anytime{'\n'}
          • Most restrictive option
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## UI/UX Design Implementation

### Design System
```typescript
const Colors = {
  primary: '#6B73FF',
  secondary: '#9B59B6',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  calm: '#3498DB',
};

const Typography = {
  h1: { fontSize: 32, fontWeight: '700', fontFamily: 'System' },
  h2: { fontSize: 24, fontWeight: '600', fontFamily: 'System' },
  body: { fontSize: 16, fontWeight: '400', fontFamily: 'System' },
  caption: { fontSize: 12, fontWeight: '400', fontFamily: 'System' },
};

const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

### Animations
```typescript
const Animations = {
  breathingScale: {
    duration: 4000,
    easing: Easing.inOut(Easing.ease),
    loop: true,
  },
  countdownPulse: {
    duration: 1000,
    easing: Easing.inOut(Easing.ease),
    loop: true,
  },
  slideIn: {
    duration: 300,
    easing: Easing.out(Easing.ease),
  },
};
```

## Advanced Features

### Productive App Recommendations
**File**: `src/data/ProductiveApps.ts`

```typescript
const PRODUCTIVE_APPS = [
  {
    name: 'Notes',
    deepLink: 'mobilenotes://',
    icon: 'note',
    description: 'Capture your thoughts',
  },
  {
    name: 'Notion',
    deepLink: 'notion://',
    icon: 'notion',
    description: 'Organize your life',
  },
  {
    name: 'Motion',
    deepLink: 'motion://',
    icon: 'motion',
    description: 'Plan your day',
  },
  {
    name: 'Kindle',
    deepLink: 'kindle://',
    icon: 'book',
    description: 'Read something meaningful',
  },
  {
    name: 'Headspace',
    deepLink: 'headspace://',
    icon: 'headspace',
    description: 'Take a mindful moment',
  },
];
```

### Post-Reflection Alternatives (Phase 3.5)
**File**: `src/screens/PostReflectionWithAlternatives.tsx`

```typescript
const PostReflectionWithAlternatives: React.FC<{
  appName: string;
  appDeepLink: string;
  onProceed: () => void;
  onCancel: () => void;
}> = ({ appName, appDeepLink, onProceed, onCancel }) => {
  const suggestedApps = getProductiveAlternatives(appName);
  
  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        Would you still like to proceed to {appName}?
      </Text>
      
      {/* Original app option */}
      <Button
        title="Yes, I would like to proceed"
        onPress={onProceed}
        style={styles.proceedButton}
      />
      
      {/* Alternative suggestions */}
      <Text style={styles.alternativeTitle}>
        Or try something more productive:
      </Text>
      
      {suggestedApps.map((app, index) => (
        <TouchableOpacity
          key={index}
          style={styles.alternativeOption}
          onPress={() => openProductiveApp(app.deepLink)}
        >
          <Icon name={app.icon} size={24} />
          <Text style={styles.alternativeText}>{app.description}</Text>
        </TouchableOpacity>
      ))}
      
      <Button
        title="No, thanks for stopping me"
        onPress={onCancel}
        style={styles.cancelButton}
      />
    </View>
  );
};

// Smart alternative matching
const getProductiveAlternatives = (blockedApp: string): ProductiveApp[] => {
  const hour = new Date().getHours();
  
  if (hour >= 9 && hour <= 17) {
    // Work hours - productivity focused
    return [
      PRODUCTIVE_APPS.find(app => app.name === 'Notion'),
      PRODUCTIVE_APPS.find(app => app.name === 'Motion'),
      PRODUCTIVE_APPS.find(app => app.name === 'Notes'),
    ].filter(Boolean);
  } else {
    // Evening/morning - personal development
    return [
      PRODUCTIVE_APPS.find(app => app.name === 'Kindle'),
      PRODUCTIVE_APPS.find(app => app.name === 'Headspace'),
      PRODUCTIVE_APPS.find(app => app.name === 'Notes'),
    ].filter(Boolean);
  }
};
```

### Smart Question Selection
```typescript
class QuestionService {
  private questionHistory: Map<string, Date> = new Map();
  
  getRandomQuestion(type: string, avoidRecent: boolean = true): string {
    const questions = QUESTION_BANKS[type] || QUESTION_BANKS.default;
    
    if (avoidRecent) {
      const recentQuestions = this.getRecentQuestions(7); // Last 7 days
      const availableQuestions = questions.filter(q => !recentQuestions.includes(q));
      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  markQuestionAsUsed(question: string): void {
    this.questionHistory.set(question, new Date());
    this.saveQuestionHistory();
  }
}
```

## Testing Strategy

### Unit Tests
- Storage service functions
- Question selection logic
- Deep link parsing
- Timer functionality

### Integration Tests
- Complete reflection flow
- Bypass flow navigation
- Settings persistence
- Shortcut generation

### User Testing
- Onboarding flow completion rate
- Reflection completion vs bypass rate
- Question effectiveness feedback
- Shortcut setup success rate

## Performance Considerations

### Optimizations
- Lazy load screens with React.lazy()
- Memoize expensive components
- Use FlatList for large app lists
- Optimize image loading for app icons
- Minimize storage read/write operations

### Bundle Size
- Tree-shake unused dependencies
- Optimize icon sets
- Compress images
- Use Expo's asset optimization

## Deployment Plan

### Phase 1: Core MVP (Week 1-2)
- Basic app dashboard
- Add app flow
- Simple reflection screen with countdown
- Basic question bank

### Phase 2: Advanced Features (Week 3-4)
- Bypass flow implementation
- iOS Shortcuts integration
- Global settings
- Question variety and rotation

### Phase 3: Polish & Launch (Week 5-6)
- UI/UX refinements
- Animations and transitions
- Onboarding flow
- TestFlight beta launch

### Phase 3.5: Productive Alternatives (Week 7-8)
- Post-reflection productive app suggestions
- "Instead of Instagram, try..." recommendations
- Integration with Notes, Notion, Motion, Kindle
- Smart alternative matching based on time of day

### Phase 4: Post-Launch (Week 9+)
- User feedback integration
- Performance monitoring
- Feature usage analytics
- App Store optimization

## Development Environment Setup

### Prerequisites
```bash
npm install -g expo-cli
npm install -g @expo/cli
```

### Project Initialization
```bash
npx create-expo-app --template blank-typescript
cd intentional-launcher
npm install @react-navigation/native @react-navigation/stack
expo install react-native-mmkv expo-vector-icons
```

### Key Dependencies
```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "expo": "~49.0.0",
    "expo-linking": "~5.0.0",
    "expo-notifications": "~0.20.0",
    "expo-task-manager": "~11.3.0",
    "react": "18.2.0",
    "react-native": "0.72.0",
    "react-native-mmkv": "^2.10.0",
    "react-native-vector-icons": "^10.0.0"
  }
}
```

## Success Metrics & Analytics

### Key Metrics to Track
- Reflection completion rate (goal: >60%)
- Bypass usage rate (goal: <30%)
- Daily active users retention
- Average session duration in reflection
- Most effective questions (by completion rate)
- Shortcut setup success rate

### Analytics Implementation
```typescript
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

class AnalyticsService {
  trackReflectionStarted(appName: string): void
  trackReflectionCompleted(appName: string, duration: number): void
  trackBypassUsed(appName: string, reason: string): void
  trackAppLaunched(appName: string, source: 'reflection' | 'bypass'): void
  trackQuestionEffectiveness(question: string, completed: boolean): void
}
```

This implementation plan provides a comprehensive roadmap for building the Intentional App Launcher, focusing on creating a mindful, effective tool that genuinely helps users break habitual phone usage patterns while maintaining a calm, supportive user experience.

## Key Implementation Updates

### Updated User Flow:
1. **User wants to open Instagram**
2. **Taps the "Instagram" shortcut** (which is actually our custom shortcut)
3. **iOS Shortcut opens our app** with deep link: `intentional://reflect?app=instagram`
4. **Our app shows reflection screen** with 60-second countdown + thoughtful question
5. **After countdown, show confirmation screen**: "Would you still like to proceed to Instagram?"
6. **User chooses**: "Yes, proceed" OR "No, thanks for stopping me"
7. **If yes, launch Instagram**; **if no, return to home screen**

### App Removal Strategy:
- **Recommended**: Hide original apps from home screen (moves to App Library)
- **Accessibility**: Apps remain searchable via Spotlight if truly needed
- **Friction**: Adds healthy friction without complete blocking
- **User Agency**: Maintains choice and prevents resentment

### Phase 3.5 - Productive Alternatives:
- After reflection, show productive app suggestions
- Context-aware recommendations (work hours vs. evening)
- Time-based alternatives (Notes, Notion, Motion, Kindle, Headspace)
- "Instead of Instagram, try..." approach

### Key Benefits of This Approach:
1. **Genuine Reflection**: Questions redirect attention to productive thoughts
2. **User Agency**: Final choice remains with the user
3. **Healthy Friction**: Slows down habitual usage without blocking
4. **Productive Redirection**: Offers better alternatives at the right moment
5. **iOS Compatibility**: Works within iOS constraints using Shortcuts 