import {InferenceClient} from '@huggingface/inference';
import {Ollama} from 'ollama';
import OpenAI from 'openai';
import {LLMError} from '../llm-error';
import {conversationRepository, type ConversationType} from '../repositories/conversation.repository';

const openAIclient = new OpenAI({
  baseURL: process.env.LLM_BASE_URL || 'http://localhost:11434/v1',
  apiKey: process.env.HF_TOKEN, // Optional for local LLM like Ollama
});

const inferenceClient = new InferenceClient(process.env.HF_TOKEN);

const ollamaClient = new Ollama();

type ChatOptions = {
  model?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  conversationId?: string;
  conversationType: ConversationType;
};

export type ChatResponse = {
  id: string;
  message: string;
};

export const llmClient = {
  async generateText({
    model = process.env.LLM_MODEL || 'llama3',
    prompt,
    temperature = 0.2,
    maxTokens = 300,
    conversationId,
    conversationType,
  }: ChatOptions): Promise<ChatResponse> {
    let messages;
    if (conversationId) {
      conversationRepository.addMessageToConversation(conversationId, conversationType, {
        role: 'user',
        content: prompt,
      });
      messages = conversationRepository.getConversationHistory(conversationId, conversationType);
    } else {
      messages = [{role: 'user' as const, content: prompt}];
    }

    try {
      console.log('Calling LLM');
      const response = await openAIclient.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
      if (!response.choices?.length || !response.choices[0]?.message?.content) {
        throw new LLMError('No response from LLM', 502, 'no_llm_response');
      }
      const response_text = response.choices[0].message.content;
      if (conversationId) {
        conversationRepository.addMessageToConversation(conversationId, conversationType, {
          role: 'assistant',
          content: response_text,
        });
      }
      return {
        id: response.id,
        message: response_text,
      };
    } catch (error) {
      if (conversationId) {
        conversationRepository.removeLastMessageFromConversation(conversationId, conversationType);
      }

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
  // async summarizeReviews(prompt: string, reviews: string) {
  //   const chatCompletion = await inferenceClient.chatCompletion({
  //     provider: 'novita',
  //     model: 'meta-llama/Llama-3.1-8B-Instruct',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: prompt,
  //       },
  //       {
  //         role: 'user',
  //         content: reviews,
  //       },
  //     ],
  //   });

  //   return chatCompletion.choices[0]?.message?.content || '';
  // },

  async summarizeReviews(prompt: string, reviews: string) {
    const response = await ollamaClient.chat({
      model: 'tinyllama',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: reviews,
        },
      ],
    });

    return response.message?.content || '';
  },
};
