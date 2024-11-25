import express from 'express';
import { verifyUser, checkPermission } from '~/globals/middleware/auth.middleware';
import { orderController } from '../controller/order.controller';

const orderRoute = express.Router();

orderRoute.use(verifyUser);
orderRoute.route('/').post(orderController.addOrder).get(orderController.getMyOrders);
orderRoute.route('/all').get(checkPermission('ADMIN'), orderController.getAllOrders);
orderRoute.route('/:id').put(checkPermission('ADMIN', 'SHOP'), orderController.updateOrderStatus);
orderRoute.route('/:orderId/:orderItemId').get(orderController.getOrderItem);

export default orderRoute;
