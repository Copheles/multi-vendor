import { Product, ProductVariant, ProductVariantItem } from '@prisma/client';
import { prisma } from '~/prisma';
import { productService } from './product.service';
import { NotFoundException } from '~/globals/middleware/error.middleware';
import { Helper } from '~/globals/helpers/helper';
import { IProductVariant, IProductVariantBody } from '~/features/productVariant/interface/productVariant.interface';

class ProductVariantItemsService {
  public async add(
    productId: number,
    variantId: number,
    requestBody: IProductVariantBody,
    currentUser: UserPayload
  ): Promise<ProductVariantItem> {
    const { name } = requestBody;

    const currentProduct: Product | null = await productService.getProduct(productId);
    if (!currentProduct) {
      throw new NotFoundException(`Product with ID:${productId} not found`);
    }

    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    const variantItem: ProductVariantItem = await prisma.productVariantItem.create({
      data: {
        name,
        variantId
      }
    });

    return variantItem;
  }

  public async remove(productId: number, variantId: number, variantItemId: number, currentUser: UserPayload) {
    const currentProduct: Product | null = await productService.getProduct(productId);
    if (!currentProduct) {
      throw new NotFoundException(`Product with ID:${productId} not found`);
    }

    Helper.checkPermit(currentProduct!, 'shopId', currentUser);

    const variant: IProductVariant | null = await prisma.productVariant.findFirst({
      where: {
        id: variantId
      },
      include: {
        productVariantItems: true
      }
    });

    console.log(variant);

    if (!variant) {
      throw new NotFoundException(`Product Variant with ID:${variantId} not found`);
    }

    const index = variant.productVariantItems.find((item: ProductVariantItem) => item.id === variantItemId);

    if (!index) {
      throw new NotFoundException(`Product variant item ID:${variantItemId} not found.`);
    }

    await prisma.productVariantItem.delete({
      where: {
        id: variantItemId
      }
    });
  }
}

export const productVariantItemsService: ProductVariantItemsService = new ProductVariantItemsService();
