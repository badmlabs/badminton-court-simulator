import { Share } from 'react-native';
import { EncodeDrillResult } from '../types/steps';

export function buildShareMessage(result: EncodeDrillResult): string {
  const stepLabel =
    result.totalSteps === 1 ? '1 step' : `${result.sharedSteps} steps`;
  const truncationNote = result.truncated
    ? ` (latest ${result.sharedSteps} of ${result.totalSteps})`
    : '';
  return `Badminton court drill — ${stepLabel}${truncationNote}\n\nOpen in Badminton Court Simulator:\n${result.url}`;
}

export async function shareDrillLink(result: EncodeDrillResult): Promise<void> {
  await Share.share({
    message: buildShareMessage(result),
    title: 'Share badminton drill',
  });
}
