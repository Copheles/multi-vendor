import { Request, Response } from 'express';
import { HTTP_STATUS } from '~/globals/constants/http';
import { productImageService } from '~/services/db/productImage.service';

class ProductImageController {
  public async addImages(req: Request, res: Response) {
    const productId: number = parseInt(req.params.productId);
    await productImageService.add(productId, req.currentUser, req.files as Express.Multer.File[]);

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Add images to product'
    });
  }

  public async delete(req: Request, res: Response) {
    await productImageService.remove(parseInt(req.params.productId), parseInt(req.params.imageId), req.currentUser);
    return res.status(HTTP_STATUS.OK).json({
      message: 'Remove image from product'
    });
  }
}

export const productImageController: ProductImageController = new ProductImageController();
