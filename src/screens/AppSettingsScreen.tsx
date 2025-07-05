import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Settings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});
