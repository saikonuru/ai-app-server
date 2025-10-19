import {llmClient, type ChatResponse} from '../llm/llmClient';
// import template from '../prompts/chatbot.txt';
import {ConversationType} from '../repositories/conversation.repository';
// const parkIno = fs.readFileSync(
//   path.join(__dirname, '..', 'prompts', 'WonderWorld.md'),
//   'utf-8'
// );

export const chatService = {
  async sendMessage(prompt: string, conversationId: string): Promise<ChatResponse> {
    // const instructions = template.replace('{{parkInfo}}', parkIno);

    return await llmClient.generateText({
      // model: process.env.LLM_MODEL,
      prompt,
      temperature: 0.2,
      maxTokens: 500,
      conversationId,
      conversationType: ConversationType.Chat,
    });
  },
};
