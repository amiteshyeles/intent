import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import DeepLinkService from './src/services/DeepLinkService';

export default function App() {
  useEffect(() => {
    // Initialize deep link handling
    const deepLinkService = DeepLinkService.getInstance();
    
    const cleanup = deepLinkService.initialize();
    
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);

  return <AppNavigator />;
} 