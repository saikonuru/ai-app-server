import fs from 'fs';
import type {ChatCompletionMessageParam} from 'openai/resources/chat/completions';
import path from 'path';
import chatTemplate from '../prompts/chatbot.txt';
import summaryTemplate from '../prompts/summary.txt';

export enum ConversationType {
  Chat,
  Review,
  None,
}

const conversations = new Map<string, ChatCompletionMessageParam[]>();

const getInstructions = (conversationType: ConversationType) => {
  if (conversationType == ConversationType.Chat) {
    const parkIno = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'WonderWorld.md'), 'utf-8');
    return chatTemplate.replace('{{parkInfo}}', parkIno);
  } else if (conversationType == ConversationType.Review) {
    return summaryTemplate;
  }
  return process.env.DEFAULT_SYSTEM_MESSAGE;
};

const getConversationHistory = (conversationId: string, conversationType: ConversationType) => {
  let conversationHistory = conversations.get(conversationId);

  if (!conversationHistory) {
    conversationHistory = [
      {
        role: 'system',
        content: getInstructions(conversationType) ?? '',
      },
    ];
    conversations.set(conversationId, conversationHistory);
  }
  return conversationHistory;
};

const addMessageToConversation = (
  conversationId: string,
  conversationType: ConversationType,
  message: ChatCompletionMessageParam
) => {
  const conversationHistory = getConversationHistory(conversationId, conversationType);
  conversationHistory.push(message);
};

const removeLastMessageFromConversation = (conversationId: string, conversationType: ConversationType) => {
  const conversationHistory = getConversationHistory(conversationId, conversationType);
  conversationHistory.pop();
};

export const conversationRepository = {
  getInstructions,
  getConversationHistory,
  addMessageToConversation,
  removeLastMessageFromConversation,
};
