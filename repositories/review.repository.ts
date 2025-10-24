import {PrismaClient, type Review, type Summary} from '@prisma/client';
import dayjs from 'dayjs';

// Singleton PrismaClient instance
const prisma = new PrismaClient();

export const reviewRepository = {
  getReviews(productId: number, limit?: number): Promise<Review[]> {
    return prisma.review.findMany({
      where: {productId},
      orderBy: {createdAt: 'desc'},
      take: limit,
    });
  },

  async getReviewSummary(productId: number): Promise<Summary | null> {
    const summary = await prisma.summary.findFirst({
      where: {
        AND: [{productId}, {expiresAt: {gt: new Date()}}],
      },
    });

    return summary ? summary : null;
  },
  storeReviewsSummary(productId: number, summary: string) {
    const now = new Date();
    const expiresAt = dayjs().add(7, 'days').toDate();
    const data = {
      content: summary,
      expiresAt,
      generatedAt: now,
      productId,
    };

    return prisma.summary.upsert({
      where: {productId},
      create: data,
      update: data,
    });
  },
};
