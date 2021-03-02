import jwt from 'jsonwebtoken';
import ChatModel from './models/chat.model';
import { Types } from 'mongoose';

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET as string, {
    expiresIn: '15d',
  });
};

export const getChats = async (userId: string) => {
  let chats = await ChatModel.find({ participants: { $in: [Types.ObjectId(userId)] } })
    .populate({
      path: 'messages',
      options: { sort: { date: -1 }, limit: 1 },
      select: '-to',
    })
    .populate({ path: 'participants', select: 'username id' });

  chats = chats.map((chat: any) => {
    chat = chat.toObject();
    const user = chat.participants.find((user: any) => user._id != userId);
    user.id = user._id;
    delete user._id;

    const messages = chat.messages.map((message: any) => {
      message.id = message._id;
      delete message._id;
      delete message.__v;
      return message;
    });

    const id = chat._id;

    delete chat.participants;
    delete chat.__v;
    delete chat._id;

    return { ...chat, id, user, messages };
  });

  return chats.filter((chat) => chat.messages.length > 0);
};
