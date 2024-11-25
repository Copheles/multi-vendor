import express from 'express';
import { userSchemaCreate } from '../schema/user.schema';
import { validateSchema } from '~/globals/middleware/validate.middleware';
import { authController } from '../controller/auth.controller';

const authRoute = express.Router();

authRoute.post('/register', validateSchema(userSchemaCreate), authController.registerUser);
authRoute.post('/login', authController.loginUser);
authRoute.post('/forget-password', authController.forgetFassword);
authRoute.post('/reset-password', authController.resetPassword);

export default authRoute;
