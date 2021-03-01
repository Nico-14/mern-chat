import { Request, Response } from 'express';
import { Types } from 'mongoose';
import UserModel from '../models/user.model';
import { generateToken } from '../util';
import { getChats } from '../util';

export const addFriend = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { friendId } = req.body;

  try {
    if (
      req.user?.id &&
      friendId &&
      (userId === req.user.id || userId === 'client') &&
      (await UserModel.exists({ _id: friendId }))
    ) {
      const clientDoc = await UserModel.findByIdAndUpdate(req.user.id)
        .select('-password -createdAt -updatedAt')
        .populate({
          path: 'friends',
          select: '-password -friends -createdAt -updatedAt',
        });
      await UserModel.updateOne({ _id: friendId }, { $addToSet: { friends: Types.ObjectId(req.user.id) } });

      res.send(clientDoc);
    } else {
      res.sendStatus(404);
    }
  } catch {
    res.sendStatus(500);
  }
};

export const search = async (req: Request, res: Response) => {
  const { query } = req.query;
  if (query) {
    try {
      const users = await UserModel.find({ username: new RegExp(query.toString(), 'i') });
      res.send(
        users.map((user) => ({
          id: user._id,
          username: user.username,
        }))
      );
    } catch {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
};

export const getData = async (req: Request, res: Response) => {
  if (req.user?.id) {
    try {
      const user = await UserModel.findById(req.user.id).populate({
        path: 'friends',
        select: '-password -friends -createdAt -updatedAt',
      });
      if (user) {
        const chats = await getChats(user.id);
        return res.send({
          username: user.username,
          friends: user.friends,
          id: user.id,
          token: generateToken(user.id),
          chats,
        });
      } else res.sendStatus(404);
    } catch {
      res.sendStatus(500);
    }
  }
};
