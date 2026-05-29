import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  Text as PaperText,
  TextInput,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CourtDimensions } from '../types/game';
import { DrillStep } from '../types/steps';
import { encodeDrillForShare } from '../utils/stepSerialization';
import { shareDrillLink } from '../utils/shareSteps';

interface StepsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  steps: DrillStep[];
  currentStepIndex: number;
  isDoubles: boolean;
  courtDimensions: CourtDimensions;
  onSelectStep: (index: number) => void;
}

export function StepsPanel({
  isVisible,
  onClose,
  steps,
  currentStepIndex,
  isDoubles,
  courtDimensions,
  onSelectStep,
}: StepsPanelProps) {
  const [title, setTitle] = useState('');

  const sharePreview = useMemo(() => {
    if (steps.length === 0) return null;
    try {
      return encodeDrillForShare(steps, isDoubles, courtDimensions, title);
    } catch {
      return null;
    }
  }, [steps, isDoubles, courtDimensions, title]);

  const handleShare = async () => {
    if (steps.length === 0) {
      Alert.alert('No steps yet', 'Move players or the shuttle on the court to record steps.');
      return;
    }

    let result;
    try {
      result = encodeDrillForShare(steps, isDoubles, courtDimensions, title);
    } catch (error) {
      Alert.alert(
        'Cannot share',
        error instanceof Error ? error.message : 'This drill is too large to share as a link.'
      );
      return;
    }

    const proceed = () => {
      void shareDrillLink(result).then(() => onClose());
    };

    if (result.truncated) {
      Alert.alert(
        'Link will be shortened',
        `Only the latest ${result.sharedSteps} of ${result.totalSteps} steps fit in the share link. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share', onPress: proceed },
        ]
      );
      return;
    }

    proceed();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <PaperText variant="titleLarge" style={styles.title}>
              Drill steps
            </PaperText>
            <IconButton icon="close" onPress={onClose} />
          </View>

          <PaperText variant="bodyMedium" style={styles.subtitle}>
            Each move on the court adds a step. Share a link so others can replay the latest
            positions in the app.
          </PaperText>

          <TextInput
            label="Drill name (optional)"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.titleInput}
            maxLength={40}
          />

          {sharePreview && (
            <View style={styles.previewCard}>
              <MaterialCommunityIcons name="link-variant" size={20} color="#1565C0" />
              <PaperText variant="bodySmall" style={styles.previewText}>
                {sharePreview.truncated
                  ? `Link includes latest ${sharePreview.sharedSteps} of ${sharePreview.totalSteps} steps`
                  : `Link includes all ${sharePreview.sharedSteps} steps`}
                {' · '}
                {sharePreview.url.length} chars
              </PaperText>
            </View>
          )}

          <Divider style={styles.divider} />

          <ScrollView style={styles.stepList} contentContainerStyle={styles.stepListContent}>
            {steps.length === 0 ? (
              <PaperText variant="bodyMedium" style={styles.emptyText}>
                No steps recorded yet. Drag a player or the shuttle to create your first step.
              </PaperText>
            ) : (
              steps.map((_, index) => {
                const isActive = index === currentStepIndex;
                return (
                  <TouchableOpacity
                    key={`step-${index}`}
                    style={[styles.stepRow, isActive && styles.stepRowActive]}
                    onPress={() => onSelectStep(index)}
                  >
                    <View style={[styles.stepBadge, isActive && styles.stepBadgeActive]}>
                      <PaperText
                        variant="labelMedium"
                        style={[styles.stepBadgeText, isActive && styles.stepBadgeTextActive]}
                      >
                        {index + 1}
                      </PaperText>
                    </View>
                    <View style={styles.stepInfo}>
                      <PaperText variant="titleSmall">
                        Step {index + 1}
                        {isActive ? ' · current' : ''}
                      </PaperText>
                      <PaperText variant="bodySmall" style={styles.stepMeta}>
                        {isDoubles ? 'Doubles' : 'Singles'} · {steps[index].players.team1.length +
                          steps[index].players.team2.length}{' '}
                        players
                      </PaperText>
                    </View>
                    <MaterialCommunityIcons
                      name={isActive ? 'check-circle' : 'chevron-right'}
                      size={22}
                      color={isActive ? '#1565C0' : '#999'}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button mode="outlined" onPress={onClose} style={styles.footerButton}>
              Close
            </Button>
            <Button
              mode="contained"
              icon="share-variant"
              onPress={handleShare}
              disabled={steps.length === 0}
              style={styles.footerButton}
            >
              Share link
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    color: '#555',
    marginBottom: 12,
    paddingRight: 8,
  },
  titleInput: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  previewText: {
    flex: 1,
    color: '#1565C0',
  },
  divider: {
    marginVertical: 8,
  },
  stepList: {
    maxHeight: 280,
  },
  stepListContent: {
    paddingBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#f5f5f5',
  },
  stepRowActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeActive: {
    backgroundColor: '#1565C0',
  },
  stepBadgeText: {
    color: '#333',
    fontWeight: '700',
  },
  stepBadgeTextActive: {
    color: '#fff',
  },
  stepInfo: {
    flex: 1,
  },
  stepMeta: {
    color: '#777',
    marginTop: 2,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  footerButton: {
    flex: 1,
  },
});
