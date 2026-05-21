const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-large-latest';
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Kept for the existing route imports while the app supports both providers.
export type MistralMessage = ChatMessage;

function getChatProvider() {
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      apiUrl: OPENAI_API_URL,
      model: DEFAULT_OPENAI_MODEL,
    };
  }

  if (process.env.MISTRAL_API_KEY) {
    return {
      apiKey: process.env.MISTRAL_API_KEY,
      apiUrl: MISTRAL_API_URL,
      model: DEFAULT_MISTRAL_MODEL,
    };
  }

  throw new Error('OPENAI_API_KEY oder MISTRAL_API_KEY ist nicht gesetzt');
}

export async function createMistralChatCompletion({
  messages,
  maxTokens,
  temperature,
  responseFormat,
  stream = false,
}: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: 'json_object' };
  stream?: boolean;
}) {
  const provider = getChatProvider();

  return fetch(provider.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: responseFormat,
      stream,
    }),
  });
}
