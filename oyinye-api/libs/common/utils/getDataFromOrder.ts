import { Request } from "express";

export const getDataFromOrder = (req: Request) => {
  const orderId = req.cookies["order"];
  const checkoutSessionToken = req.cookies["checkout_session_token"];

  if (!orderId && !checkoutSessionToken) {
    return [];
  }

  return [orderId, checkoutSessionToken];
};
