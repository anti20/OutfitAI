import RNFS from 'react-native-fs';
import { getOpenAIKey } from '../storage/openAIKeyStorage';
import { OutfitAnalysisResult } from '../types/navigation';

type ValidationResult = {
  valid: boolean;
  error?: string;
};

type AnalyzeOutfitParams = {
  imageUri: string;
  mimeType?: string;
  apiKey?: string;
};

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = 'gpt-4.1';

const OUTFIT_STYLIST_INSTRUCTIONS = `You are a practical fashion stylist.

Analyze the outfit in the image.

Be honest but not rude. Do not over-compliment. If the outfit does not work, say so clearly.

Evaluate:
- color matching
- style consistency, especially formal vs casual mismatch
- whether individual pieces belong together
- shoes, outerwear, pants, and top harmony if visible
- overall outfit type, such as casual, smart-casual, business, formal, sporty, streetwear, mixed, or unknown
- where this outfit would be appropriate

Verdict rules:
- Use "yes" only if the outfit clearly works well.
- Use "mostly" if it is acceptable but has 1 noticeable issue.
- Use "no" if there is a clear mismatch, such as formal pants with a very casual jacket, clashing colors, or pieces that feel like different dress codes.

Outfit type rules:
- outfitType should describe the overall style.
- recommendedFor should list 1-3 short, practical contexts, such as daily wear, office, business meeting, dinner, casual weekend, date night, travel, or formal event.
- If the outfit is mismatched, use outfitType: "mixed".
- If the image is unclear, use outfitType: "unknown".

Output must stay short:
- explanation max 2 sentences
- suggestions max 2 items
- recommendedFor max 3 items
- no body comments
- focus only on clothes, colors, and styling`;

function getFilePathFromUri(uri: string): string {
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

function inferMimeType(uri: string, mimeType?: string): string {
  if (mimeType) {
    return mimeType;
  }

  const normalized = uri.toLowerCase();
  if (normalized.endsWith('.png')) {
    return 'image/png';
  }
  if (normalized.endsWith('.webp')) {
    return 'image/webp';
  }
  if (normalized.endsWith('.heic') || normalized.endsWith('.heif')) {
    return 'image/heic';
  }

  return 'image/jpeg';
}

function extractTextFromResponse(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const maybeOutputText = (payload as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === 'string' && maybeOutputText.trim()) {
    return maybeOutputText.trim();
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return null;
  }

  for (const outputItem of output) {
    if (!outputItem || typeof outputItem !== 'object') {
      continue;
    }
    const content = (outputItem as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== 'object') {
        continue;
      }
      const text = (contentItem as { text?: unknown }).text;
      if (typeof text === 'string' && text.trim()) {
        return text.trim();
      }
    }
  }

  return null;
}

function parseAndValidateAnalysis(text: string): OutfitAnalysisResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('INVALID_JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('INVALID_JSON');
  }

  const obj = parsed as Partial<OutfitAnalysisResult>;
  const verdictValues: OutfitAnalysisResult['verdict'][] = [
    'yes',
    'mostly',
    'no',
  ];
  const outfitTypeValues: OutfitAnalysisResult['outfitType'][] = [
    'casual',
    'smart-casual',
    'business',
    'formal',
    'sporty',
    'streetwear',
    'mixed',
    'unknown',
  ];
  const ratingValues: OutfitAnalysisResult['colorMatching'][] = [
    'good',
    'okay',
    'poor',
  ];

  if (!obj.verdict || !verdictValues.includes(obj.verdict)) {
    throw new Error('INVALID_JSON');
  }
  if (!obj.outfitType || !outfitTypeValues.includes(obj.outfitType)) {
    throw new Error('INVALID_JSON');
  }
  if (!Array.isArray(obj.recommendedFor)) {
    throw new Error('INVALID_JSON');
  }
  if (!obj.colorMatching || !ratingValues.includes(obj.colorMatching)) {
    throw new Error('INVALID_JSON');
  }
  if (!obj.styleConsistency || !ratingValues.includes(obj.styleConsistency)) {
    throw new Error('INVALID_JSON');
  }
  if (typeof obj.explanation !== 'string' || !obj.explanation.trim()) {
    throw new Error('INVALID_JSON');
  }
  if (!Array.isArray(obj.suggestions)) {
    throw new Error('INVALID_JSON');
  }

  const recommendedFor = obj.recommendedFor
    .filter(
      (item): item is string =>
        typeof item === 'string' && item.trim().length > 0,
    )
    .map(item => item.trim())
    .slice(0, 3);

  if (recommendedFor.length === 0) {
    throw new Error('INVALID_JSON');
  }

  return {
    verdict: obj.verdict,
    outfitType: obj.outfitType,
    recommendedFor,
    colorMatching: obj.colorMatching,
    styleConsistency: obj.styleConsistency,
    explanation: obj.explanation.trim(),
    suggestions: obj.suggestions
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map(s => s.trim())
      .slice(0, 2),
  };
}

function toFriendlyApiError(status: number): string {
  if (status === 401) {
    return 'Missing or invalid API key. Please update it in Settings.';
  }
  if (status === 429) {
    return 'OpenAI rate limit reached. Please try again in a moment.';
  }
  if (status >= 500) {
    return 'OpenAI is temporarily unavailable. Please try again.';
  }

  return 'Could not analyze this image right now.';
}

function normalizeApiKey(apiKey: string): string {
  return apiKey.trim();
}

export async function validateOpenAIKey(
  apiKey: string,
): Promise<ValidationResult> {
  const trimmedKey = normalizeApiKey(apiKey);

  if (!trimmedKey) {
    return { valid: false, error: 'Please enter your OpenAI API key.' };
  }

  if (!trimmedKey.startsWith('sk-')) {
    return {
      valid: false,
      error: 'This does not look like a valid OpenAI key.',
    };
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
      return { valid: true };
    }

    if (response.status === 401) {
      return {
        valid: false,
        error: 'Invalid API key. Please check and try again.',
      };
    }

    if (response.status === 429) {
      return {
        valid: false,
        error: 'Rate limit reached. Please try again shortly.',
      };
    }

    if (response.status >= 500) {
      return {
        valid: false,
        error: 'OpenAI service is unavailable right now.',
      };
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

export async function analyzeOutfitImage({
  imageUri,
  mimeType,
  apiKey,
}: AnalyzeOutfitParams): Promise<OutfitAnalysisResult> {
  const resolvedApiKey = (apiKey ?? (await getOpenAIKey()) ?? '').trim();
  if (!resolvedApiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const localPath = getFilePathFromUri(imageUri);
  let base64Image: string;

  try {
    base64Image = await RNFS.readFile(localPath, 'base64');
  } catch {
    throw new Error('IMAGE_READ_FAILED');
  }

  if (!base64Image) {
    throw new Error('IMAGE_READ_FAILED');
  }

  const detectedMimeType = inferMimeType(imageUri, mimeType);
  const imageDataUrl = `data:${detectedMimeType};base64,${base64Image}`;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resolvedApiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `${OUTFIT_STYLIST_INSTRUCTIONS}

Return ONLY valid JSON using this exact shape:
{
  "verdict": "yes" | "mostly" | "no",
  "outfitType": "casual" | "smart-casual" | "business" | "formal" | "sporty" | "streetwear" | "mixed" | "unknown",
  "recommendedFor": ["string", "string", "string"],
  "colorMatching": "good" | "okay" | "poor",
  "styleConsistency": "good" | "okay" | "poor",
  "explanation": "short text max 2 sentences",
  "suggestions": ["string", "string"]
}`,
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
            },
          ],
        },
      ],
      max_output_tokens: 320,
    }),
  });

  if (!response.ok) {
    throw new Error(toFriendlyApiError(response.status));
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('INVALID_JSON');
  }

  const textOutput = extractTextFromResponse(payload);
  if (!textOutput) {
    throw new Error('INVALID_JSON');
  }

  return parseAndValidateAnalysis(textOutput);
}
