const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const DEFAULT_MODEL = process.env.MISTRAL_MODEL || 'mistral-large-latest';

export type MistralMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function getMistralApiKey() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY ist nicht gesetzt');
  }
  return apiKey;
}

export async function createMistralChatCompletion({
  messages,
  maxTokens,
  temperature,
  responseFormat,
  stream = false,
}: {
  messages: MistralMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: 'json_object' };
  stream?: boolean;
}) {
  return fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getMistralApiKey()}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: responseFormat,
      stream,
    }),
  });
}
