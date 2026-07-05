import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { recordSaveForReviewPrompt } from '../reviewPrompt';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories cannot use import
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-store-review', () => ({
  hasAction: jest.fn(async () => true),
  requestReview: jest.fn(async () => {}),
}));

const mockedReview = StoreReview as jest.Mocked<typeof StoreReview>;

describe('recordSaveForReviewPrompt', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    mockedReview.hasAction.mockResolvedValue(true);
  });

  it('does not prompt on the first save', async () => {
    await recordSaveForReviewPrompt();
    expect(mockedReview.requestReview).not.toHaveBeenCalled();
  });

  it('prompts exactly once at the engagement threshold', async () => {
    await recordSaveForReviewPrompt();
    await recordSaveForReviewPrompt();
    expect(mockedReview.requestReview).toHaveBeenCalledTimes(1);

    await recordSaveForReviewPrompt();
    await recordSaveForReviewPrompt();
    expect(mockedReview.requestReview).toHaveBeenCalledTimes(1);
  });

  it('retries later when the review action is unavailable', async () => {
    mockedReview.hasAction.mockResolvedValue(false);
    await recordSaveForReviewPrompt();
    await recordSaveForReviewPrompt();
    expect(mockedReview.requestReview).not.toHaveBeenCalled();

    mockedReview.hasAction.mockResolvedValue(true);
    await recordSaveForReviewPrompt();
    expect(mockedReview.requestReview).toHaveBeenCalledTimes(1);
  });

  it('never throws even when storage fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    await expect(recordSaveForReviewPrompt()).resolves.toBeUndefined();
  });
});
