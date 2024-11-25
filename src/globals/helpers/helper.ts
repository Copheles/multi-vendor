import { Coupon } from '@prisma/client';
import { ForbiddenException } from '../middleware/error.middleware';

export class Helper {
  public static checkPermit<T extends { [key: string]: any }>(
    entity: T,
    entityProperty: string,
    currentUser: UserPayload
  ) {
    if (currentUser.role === 'ADMIN') return;
    if (currentUser.id === entity![entityProperty]) return;

    throw new ForbiddenException('You cannot perform this action');
  }

  public static getOrderTotalPrice(coupon: Coupon, totalOrderPrice: number) {
    if (coupon.discountType === 'PERCENT') {
      return totalOrderPrice - totalOrderPrice * (coupon.discountPrice / 100);
    } else if (coupon.discountType === 'VALUE') {
      return totalOrderPrice - coupon.discountPrice;
    }

    return totalOrderPrice;
  }
}
