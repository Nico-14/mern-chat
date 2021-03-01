import { Router } from 'express';
import * as usersController from '../controllers/users.controller';

const router = Router();

router.post('/:userId/friends', usersController.addFriend);

router.get('/', usersController.search);

router.get('/client/data', usersController.getData);

export default router;
