import OpenAI from 'openai';
import type {ChatCompletionMessageParam} from 'openai/resources/chat/completions';
import {LLMError} from '../llm-error';
import {conversationRepository} from '../repositories/conversation.repository';

type ChatResponse = {
  id: string;
  message: string;
};

// Configure the OpenAI client to connect to the local Ollama server
const ollama = new OpenAI({
  baseURL: process.env.LLM_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama', // required but not used
});

const queryLLM = async (
  messages: ChatCompletionMessageParam[],
  client: OpenAI
): Promise<ChatResponse> => {
  const response = await client.chat.completions.create({
    model: process.env.LLM_MODEL || 'llama3', // Provide a default model
    messages: messages,
    temperature: 0.3,
    max_tokens: 1000,
  });

  return {
    id: response.id,
    message: response.choices[0]?.message?.content || '',
  };
};

export const chatService = {
  async sendMessage(
    prompt: string,
    conversationId: string
  ): Promise<ChatResponse> {
    // Add user message to the conversation
    conversationRepository.addMessageToConversation(conversationId, {
      role: 'user',
      content: prompt,
    });

    try {
      const conversationHistory =
        conversationRepository.getConversationHistory(conversationId);
      // Pass the full conversation history to the LLM to provide context.
      const llmResponse = await queryLLM(conversationHistory, ollama);
      conversationRepository.addMessageToConversation(conversationId, {
        role: 'assistant',
        content: llmResponse.message,
      });

      return llmResponse;
    } catch (error) {
      conversationRepository.removeLastMessageFromConversation(conversationId);

      // Wrap the specific LLM error in a generic LLMError
      if (error instanceof OpenAI.APIError) {
        throw new LLMError(error.message, error.status, error.type, error);
      }

      // Re-throw a generic error for other cases
      throw new LLMError(
        'An unexpected error occurred while communicating with the assistant.',
        500,
        'internal_server_error',
        error
      );
    }
  },
};
