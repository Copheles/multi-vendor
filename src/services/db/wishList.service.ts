import { WishList } from '@prisma/client';
import { IWishListBody } from '~/features/wishList/interface/wishList.interface';
import { BadRequestException, NotFoundException } from '~/globals/middleware/error.middleware';
import { prisma } from '~/prisma';

class WishListService {
  public async add(requestBody: IWishListBody, currentUser: UserPayload): Promise<void> {
    const { productId } = requestBody;

    // check
    const wishList = await this.getWishlist(productId, currentUser.id);

    if (wishList) {
      throw new BadRequestException(`This product with ID:${productId} already exist in wishlist`);
    }

    const currentProduct = await prisma.product.findFirst({
      where: {
        id: productId
      }
    });

    if (!currentProduct) {
      throw new NotFoundException(`Product with ID:${productId} not found`);
    }

    await prisma.wishList.create({
      data: {
        productId,
        userId: currentUser.id
      }
    });
  }

  public async remove(productId: number, currentUser: UserPayload) {
    if ((await this.getCountWishList(productId, currentUser.id)) <= 0) {
      throw new NotFoundException('No product in wishList');
    }

    await prisma.wishList.delete({
      where: {
        userId_productId: {
          productId,
          userId: currentUser.id
        }
      }
    });
  }

  public async get(currentUser: UserPayload): Promise<WishList[]> {
    const wishLists: WishList[] = await prisma.wishList.findMany({
      where: {
        userId: currentUser.id
      },
      include: {
        product: true
      }
    });

    return wishLists;
  }

  private async getWishlist(productId: number, userId: number) {
    const wishList: WishList | null = await prisma.wishList.findFirst({
      where: {
        productId,
        userId
      }
    });
    return wishList;
  }

  private async getCountWishList(productId: number, userId: number): Promise<number> {
    const count: number = await prisma.wishList.count({
      where: {
        productId,
        userId
      }
    });
    return count;
  }
}

export const wishListService = new WishListService();
