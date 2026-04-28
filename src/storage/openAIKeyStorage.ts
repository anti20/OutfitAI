import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.outfitai.openai';
const KEYCHAIN_USERNAME = 'openai-api-key';

export async function getOpenAIKey(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (!credentials) {
      return null;
    }

    return credentials.password || null;
  } catch {
    return null;
  }
}

export async function saveOpenAIKey(apiKey: string): Promise<void> {
  await Keychain.setGenericPassword(KEYCHAIN_USERNAME, apiKey, {
    service: KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearOpenAIKey(): Promise<void> {
  await Keychain.resetGenericPassword({
    service: KEYCHAIN_SERVICE,
  });
}
