type ValidationResult = {
  valid: boolean;
  error?: string;
};

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = 'gpt-4.1-mini';

function normalizeApiKey(apiKey: string): string {
  return apiKey.trim();
}

export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  const trimmedKey = normalizeApiKey(apiKey);

  if (!trimmedKey) {
    return {valid: false, error: 'Please enter your OpenAI API key.'};
  }

  if (!trimmedKey.startsWith('sk-')) {
    return {valid: false, error: 'This does not look like a valid OpenAI key.'};
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: 'Validate key',
        max_output_tokens: 16,
      }),
    });

    if (response.ok) {
      return {valid: true};
    }

    if (response.status === 401) {
      return {valid: false, error: 'Invalid API key. Please check and try again.'};
    }

    if (response.status === 429) {
      return {valid: false, error: 'Rate limit reached. Please try again shortly.'};
    }

    if (response.status >= 500) {
      return {valid: false, error: 'OpenAI service is unavailable right now.'};
    }

    return {
      valid: false,
      error: 'Unable to validate the key. Please verify it and try again.',
    };
  } catch {
    return {
      valid: false,
      error: 'Network error while validating key. Check your connection.',
    };
  }
}
