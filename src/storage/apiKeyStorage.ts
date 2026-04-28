import * as SecureStore from 'expo-secure-store';

const OPENAI_API_KEY_STORAGE_KEY = 'outfitai.openai_api_key';

export async function getOpenAIApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(OPENAI_API_KEY_STORAGE_KEY);
}

export async function setOpenAIApiKey(value: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) {
    await clearOpenAIApiKey();
    return;
  }
  await SecureStore.setItemAsync(OPENAI_API_KEY_STORAGE_KEY, trimmed);
}

export async function clearOpenAIApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(OPENAI_API_KEY_STORAGE_KEY);
}

