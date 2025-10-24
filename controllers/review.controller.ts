import type {Request, Response} from 'express';
import {productRepository} from '../repositories/productRepository';
import {reviewRepository} from '../repositories/review.repository';
import {reviewService} from '../services/review.service';

export const reviewsController = {
  async getReviews(req: Request, res: Response) {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({error: 'Invalid product Id'});
    }

    try {
      const reviews = await reviewRepository.getReviews(productId);
      let summary = await reviewRepository.getReviewSummary(productId);

      // Format the existing summary to match the client's expected structure
      return res.json({
        summary: summary ? {message: summary.content} : null,
        reviews,
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      res.status(500).json({error: 'Failed to fetch reviews'});
    }
  },

  async summarizeReviews(req: Request, res: Response) {
    const productId = Number(req.params.id);
    // const conversationId = String(
    //   req.query.conversationId || req.body.conversationId
    // );
    const conversationId = '';
    if (isNaN(productId)) {
      return res.status(400).json({error: 'Invalid product Id'});
    }

    try {
      const product = await productRepository.getProduct(productId);
      if (!product) {
        res.status(400).json({error: 'Product does note exists'});
        return;
      }
      const summary = await reviewService.summarizeReviews(productId, conversationId);
      return res.json({summary});
    } catch (error) {
      console.error('Failed to summarize reviews:', error);
      res.status(500).json({error: 'Failed to summarize reviews'});
    }
  },
};
