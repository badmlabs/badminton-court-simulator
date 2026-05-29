import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDrillImport } from '../context/DrillImportContext';

export default function ImportScreen() {
  const { d } = useLocalSearchParams<{ d?: string }>();
  const { setPendingEncodedPayload } = useDrillImport();

  useEffect(() => {
    if (typeof d === 'string' && d.length > 0) {
      setPendingEncodedPayload(d);
    }
    router.replace('/');
  }, [d, setPendingEncodedPayload]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1565C0" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
