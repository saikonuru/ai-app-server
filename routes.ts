import type {Request, Response} from 'express';
import express from 'express';
import {chatController} from './controllers/chat.controller';
import {reviewsController} from './controllers/review.controller';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

router.get('/api/', (req: Request, res: Response) => {
  res.send('Welcome to AI Chat API!');
});

router.get('/api/hello', (req: Request, res: Response) => {
  res.json({message: 'Hello World!'});
});

router.post('/api/chat', chatController.sendMessage);
router.get('/api/products/:id/reviews', reviewsController.getReviews);
router.post('/api/products/:id/reviews/summarize', reviewsController.summarizeReviews);

export default router;
