import { Request, Response } from 'express';
import { HTTP_STATUS } from '~/globals/constants/http';
import { wishListService } from '~/services/db/wishList.service';

class WishListController {
  public async addWishList(req: Request, res: Response) {
    await wishListService.add(req.body, req.currentUser);

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Add product to wishlist successfully'
    });
  }

  public async read(req: Request, res: Response) {
    const wishLists = await wishListService.get(req.currentUser);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Get my wishlist',
      data: wishLists
    });
  }

  public async delete(req: Request, res: Response) {
    console.log('hello');
    await wishListService.remove(parseInt(req.params.productId), req.currentUser);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Delete product to wishlist successfully'
    });
  }
}

export const wishListController: WishListController = new WishListController();
