import {Request} from 'express';

export const getUserData = (req: Request) => {
  const userId = req.cookies["user"];

  if (!userId) {
    return null;
  }

  return userId;
};
