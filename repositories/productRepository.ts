import {PrismaClient, type Product} from '@prisma/client';

const prisma = new PrismaClient();

export const productRepository = {
  getProduct(productId: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: {Id: productId},
    });
  },
};
