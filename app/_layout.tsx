import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import {
  useFonts,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { MarkerCustomizationProvider } from '../context/MarkerCustomizationContext';
import { AppAlertHost } from '../utils/appAlert';
import { palette, paperTheme } from '../constants/theme';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <MarkerCustomizationProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              orientation: 'portrait',
              contentStyle: { backgroundColor: palette.bg },
            }}
          />
          <AppAlertHost />
        </View>
      </MarkerCustomizationProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
});
