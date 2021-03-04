import { Request, Response } from 'express';
import ChatModel from '../models/chat.model';
import * as util from '../util';

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { last } = req.query;

  if (chatId) {
    try {
      const lastMessageQuery = last ? { _id: { $lt: last } } : {};
      const chat = await ChatModel.findById(chatId).populate({
        path: 'messages',
        options: { sort: { date: -1 }, limit: 10 },
        match: lastMessageQuery,
        select: '-to',
      });

      res.send(chat?.messages);
    } catch {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
};

export const getChats = async (req: Request, res: Response) => {
  if (req?.user?.id) {
    try {
      const chats = await util.getChats(req.user.id);
      res.send(chats);
    } catch {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
};
