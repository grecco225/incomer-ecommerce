import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product, Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Body()
    data: {
      title: string;
      description?: string;
      price: number;
      image?: string;
      badge?: string;
      category?: string;
      stock?: number;
    },
  ): Promise<Product> {
    return this.productsService.create(data);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
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
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<Product> {
    return this.productsService.remove(id);
  }
}
