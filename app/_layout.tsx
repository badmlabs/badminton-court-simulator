import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { MarkerCustomizationProvider } from '../context/MarkerCustomizationContext';
import { DrillImportProvider } from '../context/DrillImportContext';
import { useDrillDeepLinking } from '../hooks/useDrillDeepLinking';

SplashScreen.preventAutoHideAsync();

function DrillDeepLinkListener() {
  useDrillDeepLinking();
  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider>
      <DrillImportProvider>
        <MarkerCustomizationProvider>
          <DrillDeepLinkListener />
          <View style={styles.container}>
            <Stack
              screenOptions={{
                headerShown: false,
                orientation: 'portrait',
              }}
            />
          </View>
        </MarkerCustomizationProvider>
      </DrillImportProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
