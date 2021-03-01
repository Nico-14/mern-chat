import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default () => (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')?.[1];

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err, user: any) => {
    if (err) return res.status(401).send('Unauthorized');
    if (!err)
      req.user = {
        id: user.id,
      };
    next();
  });
};
