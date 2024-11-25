import { Coupon, Order, OrderItem } from '@prisma/client';
import { cartService } from './cart.service';
import { prisma } from '~/prisma';
import { couponService } from './coupon.service';
import { BadRequestException, NotFoundException } from '~/globals/middleware/error.middleware';
import { Helper } from '~/globals/helpers/helper';

class OrderService {
  public async add(requestBody: any, currentUser: UserPayload) {
    const { couponCode, addressId } = requestBody;

    // Get Coupon
    const coupon: Coupon | null = await couponService.get(couponCode);

    if (!coupon) {
      throw new NotFoundException(`The coupon ${couponCode} does not exists`);
    }

    if (coupon.discountPrice <= 0) {
      throw new NotFoundException(`The coupon ${couponCode} not longer valid`);
    }

    // Get all cart items in my cart
    const cart: any | null = await cartService.getMyCart(currentUser);
    console.log('cart', cart);

    // Create a order
    const newOrder = await prisma.order.create({
      data: {
        addressId,
        totalPrice: 0,
        status: 'pending',
        userId: currentUser.id
      }
    });

    const orderItems = [];
    let totalCalculatedQuantitiy = 0;

    for (const cartItem of cart.cartItems) {
      orderItems.push({
        orderId: newOrder.id,
        productId: cartItem.productId,
        variant: cartItem.variant,
        price: cartItem.price,
        quantity: cartItem.quantity
      });
      totalCalculatedQuantitiy += cartItem.quantity;
    }

    await prisma.orderItem.createMany({
      data: orderItems
    });
    // Clear cart

    await cartService.clear(cart.id, currentUser);

    // update total price of order
    await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        totalPrice: Helper.getOrderTotalPrice(coupon, cart.totalPrice),
        totalQuantity: totalCalculatedQuantitiy,
        couponCode
      }
    });
  }

  public async update(orderId: number, requestBody: any) {
    const { status } = requestBody;
    if (status !== 'pending' && status !== 'delivered') {
      throw new BadRequestException('status does not support');
    }

    const order = await this.get(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID: ${orderId} not found`);
    }

    await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status
      }
    });
  }

  public async getMyOrders(currentUser: UserPayload) {
    const orders: Order[] = await prisma.order.findMany({
      where: {
        userId: currentUser.id
      }
    });

    return orders;
  }

  public async getOrderItem(orderId: number, orderItemId: number, currentUser: UserPayload) {
    const order: any = await this.get(orderId, { orderItems: true });

    if (!order) {
      throw new NotFoundException(`Order with ID: ${orderId} not found`);
    }

    Helper.checkPermit(order, 'userId', currentUser);

    const orderIndex = order?.orderItems?.findIndex((item: any) => item.id === orderItemId);

    if (orderIndex === 'undefined' || orderIndex <= -1) {
      throw new NotFoundException(`Order item with id:${orderItemId} not found`);
    }

    const orderItem: OrderItem | null = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId
      },
      include: {
        product: true
      }
    });
    if (!orderItem) {
      throw new NotFoundException(`Ordet item ${orderItemId} not found`);
    }

    return orderItem;
  }

  public async getAllOrders() {
    const orders: Order[] = await prisma.order.findMany();
    return orders;
  }

  private async get(orderId: number, include = {}) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId
      },
      include
    });

    return order;
  }
}

export const orderService: OrderService = new OrderService();
