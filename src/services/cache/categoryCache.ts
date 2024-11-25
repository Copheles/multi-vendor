import { REDIS_KEY } from '~/globals/constants/redis.keys';
import RedisCache from './redis.cache';
import { Category } from '@prisma/client';

const redisCache: RedisCache = new RedisCache();

class CategoryCache {
  public async getCategories() {
    const cachedCategories = await redisCache.client.get(REDIS_KEY.CATEGORIES);

    if (cachedCategories) {
      return JSON.parse(cachedCategories) as Category;
    }
  }

  public async setCategories(data: Category[]) {
    await redisCache.client.set(REDIS_KEY.CATEGORIES, JSON.stringify(data), {
      EX: 60 * 60 // 1 hour
    });
  }

  public async getCategory(id: number) {
    const cachedCategory = await redisCache.client.hGetAll(`${REDIS_KEY.CATEGORIES}:${id}`);

    // keys must be unique

    const cacheCategoryObject = { ...cachedCategory };

    if (Object.keys(cacheCategoryObject).length) {
      const dataToReturn = {
        id: parseInt(cacheCategoryObject.id),
        name: cacheCategoryObject.name,
        icon: cacheCategoryObject.icon,
        status: cacheCategoryObject.status === 'true'
      } as Category;

      return dataToReturn;
    }
  }

  public async saveCategory(data: Category, id: number) {
    // Save data to redis

    const dataToRedis = {
      id: data.id.toString(),
      name: data.name,
      icon: data.icon,
      status: data.status ? 'true' : 'false'
    };
    for (const [field, value] of Object.entries(dataToRedis)) {
      await redisCache.client.hSet(`${REDIS_KEY.CATEGORIES}:${id}`, field, value);
    }
  }

  public async invalidate() {
    await redisCache.client.del(REDIS_KEY.CATEGORIES);
  }
}

export const categoryCache: CategoryCache = new CategoryCache();
