import express from 'express';
import { userController } from '../controller/ user.controller';
import { userSchemaCreate, userSchemaUpdate } from '../schema/user.schema';

import { validateSchema } from '~/globals/middleware/validate.middleware';
import { preventInActiveUser, verifyUser } from '~/globals/middleware/auth.middleware';
import { checkPermission } from '../../../globals/middleware/auth.middleware';
import { uploadAvatar } from '~/globals/helpers/upload';

const userRoute = express.Router();

userRoute.use(verifyUser);
userRoute.use(preventInActiveUser);

userRoute.post('/change-avatar', uploadAvatar.single('avatar'), userController.uploadAvatar);
userRoute.post('/change-password', userController.changePassword);
userRoute.route('/').post(checkPermission('ADMIN'), validateSchema(userSchemaCreate), userController.createUser);
userRoute.route('/:id').put(validateSchema(userSchemaUpdate), userController.update).delete(userController.delete);
userRoute.route('/me').get(userController.getMe);

export default userRoute;
