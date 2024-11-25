import { verify } from 'crypto';
import express from 'express';
import { verifyUser } from '~/globals/middleware/auth.middleware';
import { wishListController } from '../controller/wishList.controller';

const wishListRoute = express.Router();

wishListRoute.use(verifyUser);

wishListRoute.route('/').post(wishListController.addWishList).get(wishListController.read);

wishListRoute.route('/:productId').delete(wishListController.delete);

export default wishListRoute;
