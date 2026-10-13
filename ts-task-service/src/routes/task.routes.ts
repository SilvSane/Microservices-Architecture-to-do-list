import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.route('/').get(taskController.list).post(taskController.create);

taskRouter
  .route('/:id')
  .get(taskController.getOne)
  .post(taskController.update)
  .delete(taskController.remove);
