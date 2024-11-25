import { Product, ProductImage } from '@prisma/client';
import { Helper } from '~/globals/helpers/helper';
import { prisma } from '~/prisma';
import { productService } from './product.service';
import { NotFoundException } from '~/globals/middleware/error.middleware';

class ProductImageService {
  public async add(productId: number, currentUser: UserPayload, files: Express.Multer.File[]): Promise<void> {
    const currentProduct: Product | null = await productService.getProduct(productId);
    if (!currentProduct) {
      throw new NotFoundException(`Product with ID:${productId} does not exists`);
    }

    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    const productImages: ProductImage[] = [];
    for (const file of files) {
      productImages.push({
        image: file.filename,
        productId
      } as ProductImage);
    }

    await prisma.productImage.createMany({
      data: productImages
    });
  }

  public async remove(productId: number, imageId: number, currentUser: UserPayload): Promise<void> {
    const currentProduct: Product | null = await productService.getProduct(productId);
    if (!currentProduct) {
      throw new NotFoundException(`Product with ID:${productId} does not exists`);
    }

    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    await prisma.productImage.delete({
      where: { id: imageId }
    });
  }
}

export const productImageService: ProductImageService = new ProductImageService();
