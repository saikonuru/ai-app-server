import {llmClient, type ChatResponse} from '../llm/llmClient';
// import template from '../prompts/summary.txt';
import {conversationRepository, ConversationType} from '../repositories/conversation.repository';
import {reviewRepository} from '../repositories/review.repository';

export const reviewService = {
  // async getReviews(productId: number, limit?: number): Promise<Review[]> {
  //   return reviewRepository.getReviews(productId, limit);
  // },

  async summarizeReviews(productId: number, conversationId: string): Promise<ChatResponse> {
    const existingSummary = await reviewRepository.getReviewSummary(productId);

    if (existingSummary) {
      return {id: 'cached-summary', message: existingSummary.content};
    }

    const reviews = await reviewRepository.getReviews(productId, 20);
    const joinedReviews = reviews.map(r => r.content).join('\n\n');

    if (joinedReviews.length <= 0) {
      return {id: 'no-reviews', message: 'There are no reviews to summarize'};
    }

    const system_prompt = conversationRepository.getInstructions(ConversationType.Review);
    if (!system_prompt) {
      return {
        id: 'no-template',
        message: 'No template found for review summary.',
      };
    }
    //const prompt = template.replace('{{reviews}}', joinedReviews);
    const response = await llmClient.summarizeReviews(system_prompt, joinedReviews);

    await reviewRepository.storeReviewsSummary(productId, response);
    return {id: 'summary-id', message: response};
  },
};
