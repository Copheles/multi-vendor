import express from 'express';
import { productController } from '../controller/product.controller';
import { validateSchema } from '~/globals/middleware/validate.middleware';
import { productSchemaCreate } from '../schema/product.schema';
import { checkPermission, preventInActiveUser, verifyUser } from '../../../globals/middleware/auth.middleware';
import { upload } from '~/globals/helpers/upload';

const productRoute = express.Router();

// ANyONE

productRoute.get('/', productController.read);
productRoute.get('/me', verifyUser, productController.readMyProducts);
productRoute.get('/:id', productController.readOne);

// VERIFY
productRoute.use(verifyUser);

productRoute.use(checkPermission('SHOP', 'ADMIN'));
productRoute.use(preventInActiveUser);

productRoute.route('/').post(upload.single('mainImage'), validateSchema(productSchemaCreate), productController.create);

productRoute
  .route('/:id')
  .put(validateSchema(productSchemaCreate), productController.update)
  .delete(productController.delete);

export default productRoute;
