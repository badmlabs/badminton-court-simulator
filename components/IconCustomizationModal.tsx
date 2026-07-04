import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { appAlert } from '../utils/appAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  markerContentColor,
  markerRingColor,
  palette,
  radii,
  shadows,
  sora,
  spacing,
} from '../constants/theme';

interface IconCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (type: 'icon' | 'text' | 'photo', value: string) => void;
  currentValue: string;
  currentType: 'icon' | 'text' | 'photo';
  markerId: 'P1' | 'P2' | 'P3' | 'P4' | 'Shuttle';
  currentColor: string;
}

// Default icons for each marker type
const defaultIcons = {
  P1: 'account',
  P2: 'account', 
  P3: 'account',
  P4: 'account',
  Shuttle: 'badminton'
};

export function IconCustomizationModal({ 
  visible, 
  onClose, 
  onSave, 
  currentValue, 
  currentType,
  markerId,
  currentColor
}: IconCustomizationModalProps) {
  const [activeTab, setActiveTab] = useState<'icons' | 'text' | 'photo'>(currentType === 'icon' ? 'icons' : currentType);
  const [textInput, setTextInput] = useState(currentType === 'text' ? currentValue : '');
  const [selectedImage, setSelectedImage] = useState(currentType === 'photo' ? currentValue : '');

  const contentColor = markerContentColor(currentColor);

  const pickImage = async () => {
    // Show action sheet to choose between camera and gallery
    appAlert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const imageUri = result.assets[0].uri;
              
              // Crop the image to a square if needed
              const manipulatedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ crop: { originX: 0, originY: 0, width: 200, height: 200 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
              );
              
              setSelectedImage(manipulatedImage.uri);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const imageUri = result.assets[0].uri;
              
              // Crop the image to a square if needed
              const manipulatedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ crop: { originX: 0, originY: 0, width: 200, height: 200 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
              );
              
              setSelectedImage(manipulatedImage.uri);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const previewCircleStyle = [
    styles.previewCircle,
    {
      backgroundColor: currentColor,
      borderColor: markerRingColor(currentColor),
    },
  ];

  const renderIconsTab = () => (
    <View style={styles.contentArea}>
      <Text style={styles.contentDescription}>
        The default icon for this marker
      </Text>
      <View style={styles.previewContainer}>
        <View style={previewCircleStyle}>
          <MaterialCommunityIcons
            name={defaultIcons[markerId] as any}
            size={40}
            color={contentColor}
          />
        </View>
      </View>
    </View>
  );

  const renderTextTab = () => (
    <View style={styles.contentArea}>
      <Text style={styles.contentDescription}>
        Tap the circle and type up to 3 characters
      </Text>
      <View style={styles.previewContainer}>
        <TextInput
          style={[
            ...previewCircleStyle,
            styles.textInputInCircle,
            { color: contentColor },
          ]}
          value={textInput}
          onChangeText={(text) => {
            setTextInput(text);
            if (text.trim()) {
              onSave('text', text.trim());
            }
          }}
          placeholder="ABC"
          maxLength={3}
          textAlign="center"
          placeholderTextColor={
            currentColor === '#ffffff' ? 'rgba(11, 17, 30, 0.4)' : 'rgba(255, 255, 255, 0.6)'
          }
        />
      </View>
    </View>
  );

  const renderPhotoTab = () => (
    <View style={styles.contentArea}>
      <Text style={styles.contentDescription}>
        Tap the circle to take or choose a photo
      </Text>
      <View style={styles.previewContainer}>
        <TouchableOpacity
          onPress={async () => {
            await pickImage();
            if (selectedImage) {
              onSave('photo', selectedImage);
            }
          }}
          style={previewCircleStyle}
        >
          {selectedImage ? (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.photoPreviewImage}
            />
          ) : (
            <MaterialCommunityIcons
              name="camera-plus-outline"
              size={28}
              color={contentColor}
            />
          )}
        </TouchableOpacity>
        {selectedImage && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              setSelectedImage('');
              onSave('icon', defaultIcons[markerId]);
            }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={palette.danger} />
            <Text style={styles.removeButtonText}>Remove photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const tabs = [
    { key: 'icons' as const, icon: defaultIcons[markerId], label: 'Default' },
    { key: 'text' as const, icon: 'format-text', label: 'Text' },
    { key: 'photo' as const, icon: 'camera-outline', label: 'Photo' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Marker icon</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.segmentContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.segment, isActive && styles.activeSegment]}
                  onPress={() => {
                    setActiveTab(tab.key);
                    if (tab.key === 'icons') {
                      onSave('icon', defaultIcons[markerId]);
                    } else if (tab.key === 'text' && textInput.trim()) {
                      onSave('text', textInput.trim());
                    } else if (tab.key === 'photo' && selectedImage) {
                      onSave('photo', selectedImage);
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={17}
                    color={isActive ? palette.onAccent : 'rgba(255, 255, 255, 0.75)'}
                  />
                  <Text style={[styles.segmentLabel, isActive && styles.activeSegmentLabel]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeTab === 'icons' && renderIconsTab()}
          {activeTab === 'text' && renderTextTab()}
          {activeTab === 'photo' && renderPhotoTab()}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: palette.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: palette.dialog,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.dialogBorder,
    width: 332,
    maxWidth: '100%',
    ...shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    ...sora('600'),
    fontSize: 16.5,
    color: palette.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: palette.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.hairline,
    padding: 4,
  },
  segment: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radii.pill,
  },
  activeSegment: {
    backgroundColor: palette.accent,
  },
  segmentLabel: {
    ...sora('600'),
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  activeSegmentLabel: {
    ...sora('700'),
    color: palette.onAccent,
  },
  contentArea: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  contentDescription: {
    ...sora('400'),
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  previewCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    ...shadows.floating,
  },
  textInputInCircle: {
    ...sora('700'),
    fontSize: 22,
    padding: 0,
    margin: 0,
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: palette.dangerSoft,
    borderWidth: 1,
    borderColor: palette.dangerBorder,
  },
  removeButtonText: {
    ...sora('600'),
    color: palette.danger,
    fontSize: 13,
  },
});
