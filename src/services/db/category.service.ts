import { Category } from '@prisma/client';
import { ICategoryBody } from '~/features/category/interface/category.interface';
import { NotFoundException } from '~/globals/middleware/error.middleware';
import { prisma } from '~/prisma';
import { REDIS_KEY } from '~/globals/constants/redis.keys';
import { categoryCache } from '../cache/categoryCache';

class CategoryService {
  public async add(requestBody: ICategoryBody): Promise<Category> {
    const { name, icon } = requestBody;
    const category: Category = await prisma.category.create({
      data: {
        name,
        icon
      }
    });

    // Invalidate data in redis
    await categoryCache.invalidate();

    return category;
  }

  public async read(): Promise<Category[]> {
    await categoryCache.getCategories();

    const categories: Category[] = await prisma.category.findMany();

    await categoryCache.setCategories(categories);

    return categories;
  }

  public async readOne(id: number): Promise<Category> {
    await categoryCache.getCategory(id);

    const category: Category | null = await prisma.category.findFirst({
      where: {
        id
      }
    });

    if (!category) {
      throw new NotFoundException(`Categorty with ID:${id} not found`);
    }

    await categoryCache.saveCategory(category, id);

    return category;
  }

  public async edit(id: number, requestBody: ICategoryBody) {
    const { name, icon } = requestBody;

    if ((await this.getCountCategory(id)) <= 0) {
      throw new NotFoundException(`Categorty with ID:${id} not found`);
    }
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, icon }
    });

    // Invalidate data in redis
    await categoryCache.invalidate();
    return updatedCategory;
  }

  public async remove(id: number) {
    if ((await this.getCountCategory(id)) <= 0) {
      throw new NotFoundException(`Categorty with ID:${id} not found`);
    }

    // Invalidate data in redis
    await categoryCache.invalidate();

    await prisma.category.delete({
      where: { id }
    });
  }

  private async getCountCategory(id: number): Promise<number> {
    const count = await prisma.category.count({
      where: {
        id,
        status: true
      }
    });

    return count;
  }
}

export const categoryService: CategoryService = new CategoryService();
