import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { MarkerCustomizationProvider } from '../context/MarkerCustomizationContext';
import { DrillImportProvider } from '../context/DrillImportContext';
import { useDrillDeepLinking } from '../hooks/useDrillDeepLinking';

function DrillDeepLinkListener() {
  useDrillDeepLinking();
  return null;
}

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after resources are loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider>
      <MarkerCustomizationProvider>
        <View style={styles.container}>
          <Stack 
            screenOptions={{
              headerShown: false,
              orientation: 'portrait'
            }} 
          />
        </View>
      </MarkerCustomizationProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
