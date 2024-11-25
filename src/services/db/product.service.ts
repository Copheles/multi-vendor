import { Product } from '@prisma/client';
import { IProductBody, ProductWithDetails } from '~/features/product/interface/product.interface';
import { REDIS_KEY } from '~/globals/constants/redis.keys';
import { UtilConstant } from '~/globals/constants/utils';
import { Helper } from '~/globals/helpers/helper';
import { NotFoundException } from '~/globals/middleware/error.middleware';
import { prisma } from '~/prisma';
import { productCache } from '../cache/productCache';

class ProductService {
  public async add(
    requestBody: IProductBody,
    currentUser: UserPayload,
    file: Express.Multer.File | undefined
  ): Promise<Product> {
    const { name, longDescription, shortDescription, quantity, price, categoryId } = requestBody;

    const product: Product = await prisma.product.create({
      data: {
        name,
        longDescription,
        shortDescription,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        mainImage: file?.filename ? file.filename : '',
        categoryId: parseInt(categoryId),
        shopId: currentUser.id
      }
    });

    await productCache.invalidateProducts();
    return product;
  }

  public async getAll(): Promise<Product[]> {
    const products: Product[] = await prisma.product.findMany();
    return products;
  }

  public async getPagination(
    page: number = UtilConstant.DEFAULT_PAGE,
    pageSize: number = UtilConstant.DEFAULT_PAGE_SIZE,
    sortBy: string = UtilConstant.DEFAULT_SORT_BY,
    sortDir: string = UtilConstant.DEFAULT_SORT_DIR,
    where = {}
  ) {
    const productKey = `${REDIS_KEY.PRODUCTS}:${page}:${pageSize}:${sortBy}:${sortDir}`;

    await productCache.getProducts(productKey);

    const skip: number = (page - 1) * pageSize;
    const take: number = pageSize;

    const products: Product[] = await prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortDir
      }
    });
    // save to redis

    await productCache.saveProducts(productKey, products);

    return products;
  }

  public async getOne(id: number): Promise<ProductWithDetails | null> {
    await productCache.getProduct(`${REDIS_KEY.PRODUCTS}:${id}`);

    const product: ProductWithDetails | null = await prisma.product.findFirst({
      where: { id },
      include: {
        productImages: true,
        productVariants: {
          include: {
            productVariantItems: true
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID:${id} not found`);
    }

    await productCache.saveProduct(`${REDIS_KEY.PRODUCTS}:${id}`, product);

    return product;
  }

  public async edit(id: number, requestBody: IProductBody, currentUser: UserPayload): Promise<Product> {
    const { name, longDescription, shortDescription, quantity, mainImage, price, categoryId } = requestBody;

    if ((await this.getCountProduct(id)) <= 0) {
      throw new NotFoundException(`Product with ID: ${id} not found`);
    }

    const currentProduct = await this.getProduct(id);
    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    const product = await prisma.product.update({
      where: {
        id
      },
      data: {
        name,
        longDescription,
        shortDescription,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        mainImage,
        categoryId: parseInt(categoryId)
      }
    });

    await productCache.invalidateProducts();

    return product;
  }

  public async remove(id: number, currentUser: UserPayload) {
    if ((await this.getCountProduct(id)) <= 0) {
      throw new NotFoundException(`Product with ID:${id} not found`);
    }

    const currentProduct = await this.getProduct(id);
    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    await productCache.invalidateProducts();
    await prisma.product.delete({
      where: { id }
    });
  }

  public async getMyProducts(currentUser: UserPayload) {
    // Must be unique
    const productKey = `${REDIS_KEY.PRODUCTS}:${REDIS_KEY.USERS}:${currentUser.id}`;

    await productCache.getProducts(productKey);

    const products = await prisma.product.findMany({
      where: {
        shopId: currentUser.id
      }
    });

    await productCache.saveProducts(productKey, products);

    return products;
  }

  public async getProduct(id: number): Promise<Product | null> {
    const product: Product | null = await prisma.product.findFirst({
      where: {
        id
      }
    });
    return product;
  }

  private async getCountProduct(id: number): Promise<number> {
    const count: number = await prisma.product.count({
      where: { id }
    });

    return count;
  }
}

export const productService: ProductService = new ProductService();
