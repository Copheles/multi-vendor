import express from 'express';
import { cartController } from '../controller/cart.controller';
import { verifyUser } from '~/globals/middleware/auth.middleware';

const cartRoute = express.Router();

cartRoute.use(verifyUser);

cartRoute.route('/').post(cartController.addToCart).get(cartController.getMyCart);
cartRoute.route('/:id').delete(cartController.clearCart);
cartRoute.route('/item/:id').delete(cartController.removeCartItem);

export default cartRoute;
