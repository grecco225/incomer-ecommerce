import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
    });
    return items.map(item => item.product);
  }

  async addProduct(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    if (existing) return existing;

    return this.prisma.wishlist.create({
      data: { userId, productId },
    });
  }

  async removeProduct(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    if (!existing) throw new NotFoundException('Item not found in wishlist');

    return this.prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }
}
