import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppConfig } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationScreens } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import AppListItem from '../components/AppListItem';
import StorageService from '../services/StorageService';
import ShortcutHelpModal from '../components/ShortcutHelpModal';
import { globalStyles, colors, spacing, typography } from '../styles/globalStyles';

type DashboardScreenProps = {
  navigation: StackNavigationProp<NavigationScreens, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const storage = StorageService.getInstance();

  // Set navigation options
  React.useLayoutEffect(() => {
    const stats = getHeaderStats();
    navigation.setOptions({
      title: 'Intentional',
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity onPress={handleShowHelp} style={styles.headerButton}>
            <Ionicons name="help-circle-outline" size={24} color={colors.surface} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSettings} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, apps.length]);

  // Load apps when screen is focused (refresh when coming back from add app screen)
  useFocusEffect(
    useCallback(() => {
      loadApps();
    }, [])
  );

  const loadApps = async () => {
    try {
      const loadedApps = await storage.loadAppConfigs();
      setApps(loadedApps);
    } catch (error) {
      console.error('Failed to load apps:', error);
      Alert.alert('Error', 'Failed to load your apps');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadApps();
  }, []);

  const handleAddApp = () => {
    navigation.navigate('AddApp');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };



  const handleShowHelp = () => {
    setShowHelpModal(true);
  };



  const handleToggleApp = async (appId: string, enabled: boolean) => {
    try {
      // Update local state immediately for responsive UI
      setApps(prevApps =>
        prevApps.map(app =>
          app.id === appId ? { ...app, isEnabled: enabled, updatedAt: new Date() } : app
        )
      );
      
      // Update in storage
      const app = apps.find(a => a.id === appId);
      if (app) {
        const updatedApp = { ...app, isEnabled: enabled, updatedAt: new Date() };
        await storage.saveAppConfig(updatedApp);
      }
    } catch (error) {
      console.error('Failed to toggle app:', error);
      // Revert local state on error
      setApps(prevApps =>
        prevApps.map(app =>
          app.id === appId ? { ...app, isEnabled: !enabled } : app
        )
      );
      Alert.alert('Error', 'Failed to update app setting');
    }
  };

  const handleAppSettings = (appId: string) => {
    navigation.navigate('AppSettings', { appId });
  };

  const handleEditApp = (appId: string) => {
    navigation.navigate('AppSettings', { appId });
  };

  const handleDeleteApp = async (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    Alert.alert(
      'Remove App',
      `Are you sure you want to remove ${app.name} from your reflection list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.deleteAppConfig(appId);
              setApps(prevApps => prevApps.filter(a => a.id !== appId));
            } catch (error) {
              console.error('Failed to delete app:', error);
              Alert.alert('Error', 'Failed to remove app');
            }
          },
        },
      ]
    );
  };

  const renderAppItem = ({ item }: { item: AppConfig }) => (
    <AppListItem
      app={item}
      onToggle={handleToggleApp}
      onSettings={handleAppSettings}
      onEdit={handleEditApp}
      onDelete={handleDeleteApp}
    />
  );

  const renderEmptyState = () => (
    <View style={globalStyles.emptyState}>
      <Ionicons name="apps-outline" size={64} color={colors.lighter} />
      <Text style={globalStyles.emptyStateTitle}>No Apps Added Yet</Text>
      <Text style={globalStyles.emptyStateDescription}>
        Add apps you want to use more mindfully{'\n'}
        and create healthy digital habits
      </Text>
      <TouchableOpacity 
        style={[globalStyles.button, globalStyles.buttonPrimary, styles.addButton]} 
        onPress={handleAddApp}
      >
        <Ionicons name="add" size={18} color={colors.surface} style={styles.addButtonIcon} />
        <Text style={globalStyles.buttonText}>Add Your First App</Text>
      </TouchableOpacity>
    </View>
  );

  const getHeaderStats = () => {
    const enabledApps = apps.filter(app => app.isEnabled).length;
    const totalApps = apps.length;
    return { enabled: enabledApps, total: totalApps };
  };

  const stats = getHeaderStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {apps.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={apps}
            renderItem={renderAppItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[globalStyles.list, apps.length === 0 && styles.emptyList]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              apps.length > 0 ? (
                <View style={globalStyles.listHeader}>
                  <Text style={globalStyles.listHeaderText}>
                    Your Mindful Apps
                  </Text>
                  <Text style={globalStyles.listHeaderSubtext}>
                    Tap an app to customize its settings
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={globalStyles.fab} onPress={handleAddApp}>
        <Ionicons name="add" size={24} color={colors.surface} />
      </TouchableOpacity>
      
      {/* Help Modal */}
      <ShortcutHelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    marginRight: spacing.md,
  },
  statsHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightest,
  },
  statsText: {
    ...typography.body2,
    color: colors.medium,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  emptyList: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonIcon: {
    marginRight: spacing.sm,
  },
}); 