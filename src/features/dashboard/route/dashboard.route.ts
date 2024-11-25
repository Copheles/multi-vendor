import express from 'express';
import { checkPermission, verifyUser } from '~/globals/middleware/auth.middleware';
import { dashboardController } from '../controller/dashboard.controller';

const dashboardRoute = express.Router();

dashboardRoute.use(verifyUser);
dashboardRoute.route('/').get(dashboardController.read);

export default dashboardRoute;
