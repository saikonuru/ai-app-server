import type {Request, Response} from 'express';
import {LLMError} from '../llm-error';
import {chatSchema} from '../repositories/chat.schema';
import {chatService} from '../services/chat.service';
export const chatController = {
  async sendMessage(req: Request, res: Response) {
    const parseResult = chatSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json(parseResult.error.format());
      return;
    }

    const {prompt, conversationId} = parseResult.data;

    try {
      const llmResponse = await chatService.sendMessage(prompt, conversationId);

      res.json({
        message: llmResponse.message,
        conversationId: conversationId,
      });
    } catch (error) {
      console.error('Error calling LLM:', error);
      if (error instanceof LLMError) {
        return res.status(error.status).json({
          message: error.message,
          type: error.type,
        });
      }
      // Fallback for any other unexpected errors
      return res.status(500).json({
        message: 'An unexpected error occurred while communicating with the assistant.',
      });
    }
  },
};
