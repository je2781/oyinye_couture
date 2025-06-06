import {Request} from 'express';

export const getGuestData = (req: Request) => {
  const guestId = req.cookies["guest"];

  if (!guestId) {
    return null;
  }

  return guestId;
};
