import { prisma } from '~/prisma';

class DashboardSerive {
  public async getInfo() {
    const productCount = await prisma.product.count();
    const usersCount = await prisma.user.count({
      where: {
        isActive: true
      }
    });
    // get total revenue of all products
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalPrice: true
      }
    });

    // get total revenue of every product
    // { productid: 1, totalPrice: 2232}
    // { productid: 2, totalPrice: 234}

    const totalRevenueByProduct = await prisma.$queryRaw`
    SELECT "productId", SUM("quantity" * "price") AS "totalRevenue"
    FROM "OrderItem"
    GROUP BY "productId";
  `;

    console.log(totalRevenueByProduct);

    console.log({ productCount, usersCount, totalRevenue: totalRevenue._sum.totalPrice });
  }
}

export const dashboardService: DashboardSerive = new DashboardSerive();
