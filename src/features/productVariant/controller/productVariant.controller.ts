import { Request, Response } from 'express';
import { HTTP_STATUS } from '~/globals/constants/http';
import { productVariantService } from '~/services/db/productVariant.service';

class ProductVariantController {
  public async addVariants(req: Request, res: Response) {
    const variant = await productVariantService.add(parseInt(req.params.productId), req.body, req.currentUser);
    console.log('hello');
    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Add Variant',
      data: variant
    });
  }

  public async delete(req: Request, res: Response) {
    await productVariantService.remove(parseInt(req.params.productId), parseInt(req.params.variantId), req.currentUser);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Delete Varaint'
    });
  }
}

export const productVariantController: ProductVariantController = new ProductVariantController();
