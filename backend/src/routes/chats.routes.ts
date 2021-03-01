import { Router } from 'express';
import * as chatController from '../controllers/chats.controller';

const router = Router();

router.get('/:chatId/messages', chatController.getMessages);

router.get('/', chatController.getChats);

export default router;
