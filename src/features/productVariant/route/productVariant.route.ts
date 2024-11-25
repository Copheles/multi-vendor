import express from 'express';
import { productVariantController } from '../controller/productVariant.controller';
import { verifyUser } from '~/globals/middleware/auth.middleware';
import { checkPermission } from '../../../globals/middleware/auth.middleware';

const productVariantRoute = express.Router();

productVariantRoute
  .route('/:productId')
  .post(verifyUser, checkPermission('ADMIN', 'SHOP'), productVariantController.addVariants);
productVariantRoute
  .route('/:productId/:variantId')
  .delete(verifyUser, checkPermission('ADMIN', 'SHOP'), productVariantController.delete);

export default productVariantRoute;
