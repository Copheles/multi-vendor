import { REDIS_KEY } from '~/globals/constants/redis.keys';
import RedisCache from './redis.cache';
import { Product } from '@prisma/client';
import { ProductWithDetails } from '~/features/product/interface/product.interface';

const redisCache: RedisCache = new RedisCache();

class ProductCache {
  public async getProducts(key: string) {
    const cachedProducts = await redisCache.client.get(key);

    if (cachedProducts) {
      return JSON.parse(cachedProducts) as Product[];
    }
  }

  public async saveProducts(key: string, data: Product[]) {
    await redisCache.client.set(key, JSON.stringify(data), { EX: 5 * 60 });
  }

  public async getProduct(key: string) {
    const cachedProduct = await redisCache.client.HGETALL(key);

    const cachedProductObject = { ...cachedProduct };

    if (Object.keys(cachedProductObject).length) {
      console.log('product in cached');
      const dataToReturn = {
        ...cachedProductObject,
        createdAt: new Date(cachedProductObject.createdAt),
        updatedAt: new Date(cachedProductObject.updatedAt),
        shopId: Number(cachedProductObject.shopid),
        price: Number(cachedProductObject.price),
        id: Number(cachedProductObject.id),
        quantity: Number(cachedProductObject.quantity),
        categoryId: Number(cachedProductObject.categoryId),
        productImages: JSON.parse(cachedProductObject.productImages),
        productVariants: JSON.parse(cachedProductObject.productVariants)
      };
      return dataToReturn;
    }
  }

  public async saveProduct(key: string, data: ProductWithDetails) {
    const dataToRedis = {
      ...data,
      createdAt: `${data.createdAt}`,
      updatedAt: `${data.updatedAt}`,

      productImages: data.productImages.length ? JSON.stringify(data.productImages) : JSON.stringify([]),
      productVariants: data.productVariants.length ? JSON.stringify(data.productVariants) : JSON.stringify([])
    };

    for (const [field, value] of Object.entries(dataToRedis)) {
      await redisCache.client.hSet(key, field, value as string);
    }
  }

  public async invalidateProducts() {
    const pattern = `${REDIS_KEY.PRODUCTS}:*`;
    const keys: string[] = [];

    // Get all key match with pattern
    for await (const key of redisCache.client.scanIterator({
      MATCH: pattern,
      COUNT: 100
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisCache.client.del(keys);
    }
  }
}

export const productCache: ProductCache = new ProductCache();
