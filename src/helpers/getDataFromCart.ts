import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const getDataFromCart = (req: NextRequest) => {
  const cartId = req.cookies.get("cart")?.value;

  if (!cartId) {
    return null;
  }

  return cartId;
};
