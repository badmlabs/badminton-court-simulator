import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { appAlert } from './appAlert';

/**
 * Camera-or-gallery chooser for the Photo marker look. Calls `onPicked` with
 * the (downscaled) image uri; never calls it when the user cancels.
 */
export function pickMarkerPhoto(onPicked: (uri: string) => void) {
  const launch = async (source: 'camera' | 'library') => {
    const launcher = source === 'camera'
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const result = await launcher({
      mediaTypes: ['images'],
      allowsEditing: true, // ponytail: the OS crop UI is the pinch/pan editor
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    let uri = asset.uri;
    // Cap size for memory; never upscale small images
    if (asset.width > 512) {
      const resized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 512 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      uri = resized.uri;
    }
    onPicked(uri);
  };

  appAlert(
    'Select Photo',
    'Choose how you want to add a photo',
    [
      { text: 'Take Photo', onPress: () => launch('camera') },
      { text: 'Choose from Gallery', onPress: () => launch('library') },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
}
