import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { palette, radii, shadows, sora, spacing } from '../constants/theme';

export interface AppAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons: AppAlertButton[];
}

let presenter: ((config: AlertConfig) => void) | null = null;

/**
 * Drop-in replacement for Alert.alert that renders a Match Point themed
 * dialog instead of the native (white) system dialog. AppAlertHost must be
 * mounted once at the app root.
 */
export function appAlert(title: string, message?: string, buttons?: AppAlertButton[]): void {
  if (!presenter) {
    console.warn('appAlert called before AppAlertHost mounted:', title);
    return;
  }
  presenter({ title, message, buttons: buttons?.length ? buttons : [{ text: 'OK' }] });
}

export function AppAlertHost() {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    presenter = setConfig;
    return () => {
      presenter = null;
    };
  }, []);

  const close = (button?: AppAlertButton) => {
    setConfig(null);
    button?.onPress?.();
  };

  // Back button / outside tap behaves like Android's Alert: cancel.
  const cancelButton = config?.buttons.find((b) => b.style === 'cancel');
  const dismiss = () => close(cancelButton);

  const stacked = (config?.buttons.length ?? 0) > 2;

  return (
    <Modal
      visible={config !== null}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
    >
      {config && (
        <Pressable style={styles.overlay} onPress={dismiss}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>{config.title}</Text>
            {config.message ? <Text style={styles.message}>{config.message}</Text> : null}
            <View style={[styles.buttonRow, stacked && styles.buttonColumn]}>
              {config.buttons.map((button, index) => {
                const variant = button.style ?? 'default';
                return (
                  <TouchableOpacity
                    key={`${button.text}-${index}`}
                    style={[
                      styles.button,
                      variant === 'default' && styles.buttonDefault,
                      variant === 'cancel' && styles.buttonCancel,
                      variant === 'destructive' && styles.buttonDestructive,
                      stacked && styles.buttonStacked,
                    ]}
                    onPress={() => close(button)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        variant === 'default' && styles.buttonTextDefault,
                        variant === 'destructive' && styles.buttonTextDestructive,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: palette.overlayStrong,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  card: {
    width: 332,
    maxWidth: '100%',
    backgroundColor: palette.dialog,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.dialogBorder,
    padding: spacing.xl,
    ...shadows.floating,
  },
  title: {
    ...sora('600'),
    fontSize: 16.5,
    color: palette.textPrimary,
  },
  message: {
    ...sora('400'),
    fontSize: 12.5,
    lineHeight: 18,
    color: palette.textSecondary,
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  buttonColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    minHeight: 40,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStacked: {
    minHeight: 44,
  },
  buttonDefault: {
    backgroundColor: palette.accent,
  },
  buttonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  buttonDestructive: {
    backgroundColor: palette.dangerSoft,
    borderWidth: 1,
    borderColor: palette.dangerBorder,
  },
  buttonText: {
    ...sora('600'),
    fontSize: 13.5,
    color: palette.textPrimary,
  },
  buttonTextDefault: {
    ...sora('700'),
    color: palette.onAccent,
  },
  buttonTextDestructive: {
    color: palette.danger,
  },
});
