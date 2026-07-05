import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const SAVE_COUNT_KEY = 'review-save-count';
const PROMPTED_KEY = 'review-prompted';
/** Ask only after this many saved drills — proven engagement, not a nag. */
const SAVES_BEFORE_PROMPT = 2;

/**
 * Counts a successful drill save and, once the user has shown real
 * engagement, requests Play's native in-app review dialog — once ever.
 * Play additionally rate-limits and may skip the dialog; every failure is
 * swallowed so review plumbing can never affect the save flow.
 */
export async function recordSaveForReviewPrompt(): Promise<void> {
  try {
    if (await AsyncStorage.getItem(PROMPTED_KEY)) return;

    const count = Number((await AsyncStorage.getItem(SAVE_COUNT_KEY)) ?? '0') + 1;
    await AsyncStorage.setItem(SAVE_COUNT_KEY, String(count));
    if (count < SAVES_BEFORE_PROMPT) return;

    // No Play services (e.g. bare emulator): skip now, retry on a later save.
    if (!(await StoreReview.hasAction())) return;

    // Mark before requesting so an interrupted dialog can never re-prompt.
    await AsyncStorage.setItem(PROMPTED_KEY, '1');
    await StoreReview.requestReview();
  } catch {
    // Never let review plumbing break a save.
  }
}
