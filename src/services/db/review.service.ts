import { IReviewBody } from '~/features/review/interface/review.interface';
import { Helper } from '~/globals/helpers/helper';
import { BadRequestException, NotFoundException } from '~/globals/middleware/error.middleware';
import { prisma } from '~/prisma';

class ReviewService {
  public async add(requestBody: IReviewBody, currentUser: UserPayload) {
    const { rating, comment, productId } = requestBody;
    // Make sure user already bought the product
    const orders = await prisma.order.findMany({
      where: {
        userId: currentUser.id,
        orderItems: {
          some: {
            productId
          }
        }
      }
    });
    if (orders.length === 0) {
      throw new BadRequestException('You do not buy this product');
    }

    const existingReview = await this.getReviewByProductIdAndUserId(productId, currentUser.id);

    if (existingReview) {
      throw new BadRequestException('You already reviewed on this product.');
    }

    const review = await prisma.review.create({
      data: {
        productId,
        comment,
        rating,
        userId: currentUser.id
      }
    });

    return review;
  }

  public async update(requestBody: IReviewBody, id: number, currentUser: UserPayload) {
    const { rating, comment } = requestBody;

    const review = await prisma.review.findFirst({
      where: {
        id
      }
    });

    if (!review) {
      throw new NotFoundException(`Review with id:${id} not found`);
    }

    Helper.checkPermit(review, 'userId', currentUser);

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment
      }
    });

    return updatedReview;
  }

  public async delete(id: number, currentUser: UserPayload) {
    const review = await prisma.review.findFirst({
      where: {
        id
      }
    });

    if (!review) {
      throw new NotFoundException(`Review with id:${id} not found`);
    }

    Helper.checkPermit(review, 'userId', currentUser);

    await prisma.review.delete({
      where: { id }
    });
  }

  public async getAvgRating(productId: number): Promise<number | null> {
    const aggregations = await prisma.review.aggregate({
      _avg: {
        rating: true
      },
      where: {
        productId
      }
    });

    return aggregations._avg.rating;
  }

  private async getReviewByProductIdAndUserId(productId: number, userId: number) {
    const review = await prisma.review.findFirst({
      where: {
        productId,
        userId
      }
    });
    return review;
  }
}

export const reviewService: ReviewService = new ReviewService();
