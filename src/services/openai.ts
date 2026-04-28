type ValidationResult = { ok: true } | { ok: false; error: string };

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const REQUEST_TIMEOUT_MS = 12000;

function withTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { ok: false, error: 'Please enter an API key' };
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${trimmed}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        input: 'Reply with exactly: ok',
        max_output_tokens: 16,
      }),
      signal: withTimeoutSignal(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) {
      return { ok: true };
    }

    if (response.status === 401 || response.status === 403) {
      return { ok: false, error: 'Invalid API key' };
    }

    if (response.status === 429) {
      return { ok: false, error: 'Rate limited, try again shortly' };
    }

    let fallbackError = 'Validation failed. Try again.';
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body?.error?.message) {
        fallbackError = body.error.message.slice(0, 120);
      }
    } catch {
      // ignore parse failures and keep fallback message
    }

    return { ok: false, error: fallbackError };
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error instanceof TypeError)) {
      return { ok: false, error: 'Network error' };
    }
    return { ok: false, error: 'Unexpected error. Please try again.' };
  }
}

