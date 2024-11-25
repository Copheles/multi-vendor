import { Request, Response } from 'express';
import { HTTP_STATUS } from '~/globals/constants/http';
import { reviewService } from '~/services/db/review.service';

class ReviewController {
  public async addReview(req: Request, res: Response) {
    const review = await reviewService.add(req.body, req.currentUser);

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Add a review',
      data: review
    });
  }

  public async updateReview(req: Request, res: Response) {
    const review = await reviewService.update(req.body, parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Update a review',
      data: review
    });
  }

  public async deleteReview(req: Request, res: Response) {
    await reviewService.delete(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Delete a review'
    });
  }

  public async getAvg(req: Request, res: Response) {
    const avg = await reviewService.getAvgRating(parseInt(req.params.id));
    return res.status(HTTP_STATUS.CREATED).json({
      message: 'get average rating of product',
      data: avg
    });
  }
}

export const reviewController: ReviewController = new ReviewController();
