import {Request} from 'express';

export const getDataFromCart = (req: Request) => {
  const cartId = req.cookies["cart"];

  if (!cartId) {
    return null;
  }

  return cartId;
};
