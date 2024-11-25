import express from 'express';
import { addressController } from '../controller/address.controller';
import { verifyUser } from '~/globals/middleware/auth.middleware';
import { validateSchema } from '../../../globals/middleware/validate.middleware';
import { addressSchema } from '../schema/address.schema';

const addressRoute = express.Router();

addressRoute.use(verifyUser);

addressRoute.route('/').post(validateSchema(addressSchema), addressController.addAddress);
addressRoute.route('/me').get(addressController.getMyAddress);
addressRoute
  .route('/:id')
  .delete(addressController.delete)
  .put(validateSchema(addressSchema), addressController.updateAddress);

export default addressRoute;
