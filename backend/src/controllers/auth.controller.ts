import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import { generateToken, getChats } from '../util';

export const signUp = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (
    !username ||
    !password ||
    typeof username != 'string' ||
    typeof password != 'string' ||
    username.length < 3 ||
    username.length > 30 ||
    password.length < 6 ||
    password.length > 30 ||
    !/^(?!.*\.\.)(?!_)(?!.*\.$)(?!\d+$)[a-zA-Z0-9_]*$/.test(username)
  ) {
    return res.status(400).send('Please send the form data.');
  }

  try {
    const isUsernameAlreadyUse = await UserModel.exists({ username });
    if (isUsernameAlreadyUse) {
      return res.status(400).send('Username already use.');
    }
    const user = new UserModel({
      username,
      password,
    });
    await user.save();
    res.send({
      username,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

export const logIn = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password || typeof username != 'string' || typeof password != 'string') {
    return res.status(400).send('Please send the form data.');
  }

  try {
    const user = await UserModel.findOne({ username: username }).populate({
      path: 'friends',
      select: '-password -friends -createdAt -updatedAt',
    });
    if (user) {
      const isValid = await user.comparePasswords(password);
      if (isValid) {
        const chats = await getChats(user.id);
        return res.send({
          username: user.username,
          friends: user.friends,
          id: user.id,
          token: generateToken(user.id),
          chats,
        });
      }
    } else res.status(400).send('Wrong username or password!');
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
