import { Router } from 'express';
import * as usersController from '../controllers/users.controller';

const router = Router();

router.get('/', usersController.search);

router.get('/client/data', usersController.getData);

router.put('/client', usersController.editUser);

router.get('/last', usersController.getLastUsers);
export default router;
