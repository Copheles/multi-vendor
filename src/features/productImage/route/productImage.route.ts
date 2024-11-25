import express from 'express';
import { productImageController } from '../controller/productImage.controller';
import { upload } from '~/globals/helpers/upload';
import { verifyUser } from '~/globals/middleware/auth.middleware';
import { checkPermission } from '../../../globals/middleware/auth.middleware';

const productImageRoute = express.Router();

productImageRoute.use(verifyUser);
productImageRoute.use(checkPermission('ADMIN', 'SHOP'));

productImageRoute.route('/:productId').post(upload.array('images', 5), productImageController.addImages);

productImageRoute.route('/:productId/:imageId').delete(productImageController.delete);
export default productImageRoute;
