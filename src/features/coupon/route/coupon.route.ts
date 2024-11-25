import express from 'express';
import { checkPermission, verifyUser } from '~/globals/middleware/auth.middleware';
import { couponController } from '../controller/coupon.controller';
import { validateSchema } from '~/globals/middleware/validate.middleware';
import { couponSchema, couponUpdateSchema } from '../schema/coupon.schema';

const couponRoute = express.Router();

couponRoute.use(verifyUser);
couponRoute.use(checkPermission('ADMIN', 'SHOP'));
couponRoute.route('/').post(validateSchema(couponSchema), couponController.create).get(couponController.read);
couponRoute
  .route('/:code')
  .get(couponController.readOne)
  .put(validateSchema(couponUpdateSchema), couponController.edit)
  .delete(couponController.delete);

export default couponRoute;
