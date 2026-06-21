import { Controller, Get, Post, Delete, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Headers('X-User-Id') userId: string) {
    if (!userId) throw new UnauthorizedException('No user ID provided');
    return this.wishlistService.getWishlist(userId);
  }

  @Post(':productId')
  async addProduct(
    @Headers('X-User-Id') userId: string,
    @Param('productId') productId: string,
  ) {
    if (!userId) throw new UnauthorizedException('No user ID provided');
    return this.wishlistService.addProduct(userId, productId);
  }

  @Delete(':productId')
  async removeProduct(
    @Headers('X-User-Id') userId: string,
    @Param('productId') productId: string,
  ) {
    if (!userId) throw new UnauthorizedException('No user ID provided');
    return this.wishlistService.removeProduct(userId, productId);
  }
}
