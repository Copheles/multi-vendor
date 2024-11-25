import express from 'express';
import { verifyUser } from '~/globals/middleware/auth.middleware';
import { reviewController } from '../controller/review.controller';
import { validateSchema } from '../../../globals/middleware/validate.middleware';
import { reviewSchemaCreate, reviewSchemaUpdate } from '../schema/review.schema';

const reviewRoute = express.Router();

reviewRoute.get('/avg/:id', reviewController.getAvg);

reviewRoute.use(verifyUser);
reviewRoute.route('/').post(validateSchema(reviewSchemaCreate), reviewController.addReview);
reviewRoute
  .route('/:id')
  .put(validateSchema(reviewSchemaUpdate), reviewController.updateReview)
  .delete(reviewController.deleteReview);

export default reviewRoute;
