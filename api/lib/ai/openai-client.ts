/**
 * OpenAI Client - GPT-4.1-mini for simple queries
 *
 * Handles simple conversational queries (greetings, FAQs, info)
 * that don't need tool_use. Uses the same LAURA_PROMPT.md system prompt
 * as Claude for consistent personality.
 *
 * Cost: $0.40/$1.60 per M tokens (vs Claude Sonnet $3/$15)
 */

import OpenAI from 'openai';

// Singleton client
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI(); // uses OPENAI_API_KEY from env
  }
  return openaiClient;
}

/**
 * Generate a simple text response with GPT-4.1-mini.
 * No tools — text only. Same system prompt as Claude for consistent Laura personality.
 *
 * @throws if OpenAI API fails (caller should fallback to Claude)
 */
export async function generateSimpleResponse(params: {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    max_tokens: 400,
    temperature: 0.2,
    messages: [{ role: 'system', content: params.systemPrompt }, ...params.messages],
  });

  return response.choices[0]?.message?.content || '';
}
