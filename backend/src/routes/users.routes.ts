import { Router } from 'express';
import * as usersController from '../controllers/users.controller';

const router = Router();

router.get('/', usersController.search);

router.get('/client/data', usersController.getData);

router.put('/:userId', usersController.editUser);
export default router;
