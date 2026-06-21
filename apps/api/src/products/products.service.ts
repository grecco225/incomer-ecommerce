import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(data: {
    title: string;
    description?: string;
    price: number;
    image?: string;
    badge?: string;
    category?: string;
    stock?: number;
  }): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      image?: string;
      badge?: string;
      category?: string;
      stock?: number;
    },
  ): Promise<Product> {
    await this.findOne(id); // Throws NotFoundException if it doesn't exist
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Product> {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
