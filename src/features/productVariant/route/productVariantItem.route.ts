import express from 'express';
import { productVariantItemController } from '../controller/productVariantItem.controller';
import { verifyUser } from '~/globals/middleware/auth.middleware';
import { checkPermission } from '../../../globals/middleware/auth.middleware';

const productVariantItemRoute = express.Router();

productVariantItemRoute.use(verifyUser);
productVariantItemRoute.use(checkPermission('ADMIN', 'SHOP'));

productVariantItemRoute.route('/:productId/:variantId').post(productVariantItemController.addItems);

productVariantItemRoute.route('/:productId/:variantId/:variantItemId').delete(productVariantItemController.delete);

export default productVariantItemRoute;
