import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import { generateToken } from '../util';
import { getChats } from '../util';

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
      const user = await UserModel.findById(req.user.id);
      if (user) {
        const chats = await getChats(user.id);
        return res.send({
          username: user.username,
          displayName: user.displayName,
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

export const editUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { username, displayName } = req.body;

  try {
    if (req.user?.id && (userId === req.user.id || userId === 'client')) {
      const query: any = {};
      if (username) query.username = username;
      if (displayName) query.displayName = displayName;

      if (
        username &&
        (await UserModel.exists({ username: { $regex: new RegExp(`^${username.toLowerCase()}$`, 'i') } }))
      )
        return res.status(400).send('Username already use.');

      const clientDoc = await UserModel.findByIdAndUpdate(req.user.id, query, { new: true }).select(
        '-password -createdAt -updatedAt'
      );

      res.send(clientDoc);
    } else {
      res.sendStatus(404);
    }
  } catch {
    res.sendStatus(500);
  }
};
