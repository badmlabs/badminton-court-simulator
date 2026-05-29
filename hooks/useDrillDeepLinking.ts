import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useDrillImport } from '../context/DrillImportContext';
import { extractEncodedPayloadFromUrl } from '../utils/stepSerialization';

export function useDrillDeepLinking() {
  const { setPendingEncodedPayload } = useDrillImport();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const payload = extractEncodedPayloadFromUrl(url);
      if (payload) {
        setPendingEncodedPayload(payload);
      }
    };

    void Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, [setPendingEncodedPayload]);
}
