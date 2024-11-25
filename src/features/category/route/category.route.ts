import express from 'express';
import { categoryController } from '../controller/category.controller';
import { validateSchema } from '~/globals/middleware/validate.middleware';
import { categorySchemaCreate } from '../schema/category.schema';
import { checkPermission, preventInActiveUser, verifyUser } from '~/globals/middleware/auth.middleware';

const categoryRoute = express.Router();

categoryRoute.get('/', categoryController.getAll);
categoryRoute.get('/:id', categoryController.getOne);

categoryRoute.use(verifyUser);
categoryRoute.use(preventInActiveUser);
categoryRoute.use(checkPermission('ADMIN', 'SHOP'));

categoryRoute.route('/').post(validateSchema(categorySchemaCreate), categoryController.create);
categoryRoute.route('/:id').put(categoryController.update).delete(categoryController.delete);

export default categoryRoute;
