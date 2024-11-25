import { Product, ProductVariant } from '@prisma/client';
import { prisma } from '~/prisma';
import { productService } from './product.service';
import { NotFoundException } from '~/globals/middleware/error.middleware';
import { Helper } from '~/globals/helpers/helper';
import { IProduct, IProductVariantBody } from '~/features/productVariant/interface/productVariant.interface';

class ProductVariantService {
  public async add(
    productId: number,
    requestBody: IProductVariantBody,
    currentUser: UserPayload
  ): Promise<ProductVariant> {
    const { name } = requestBody;

    const currentProduct: Product | null = await productService.getProduct(productId);
    if (!currentProduct) {
      throw new NotFoundException(`Product with ID:${productId} not found`);
    }

    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    const variant: ProductVariant = await prisma.productVariant.create({
      data: {
        name,
        productId
      }
    });

    return variant;
  }

  public async remove(productId: number, variantId: number, currentUser: UserPayload) {
    const currentProduct: Product | null = await productService.getProduct(productId);
    if (!currentProduct) {
      throw new NotFoundException(`Product with ID:${productId} not found`);
    }

    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    const product: IProduct | null = await prisma.product.findFirst({
      where: {
        id: productId
      },
      include: {
        productVariants: true
      }
    });

    const index = product!.productVariants.find((variant: ProductVariant) => variant.id === variantId);

    if (!index) {
      throw new NotFoundException(`Product variant with ID:${variantId} does not exist`);
    }

    await prisma.productVariant.delete({
      where: {
        id: variantId
      }
    });
  }
}

export const productVariantService: ProductVariantService = new ProductVariantService();
