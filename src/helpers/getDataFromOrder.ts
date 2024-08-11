import { NextRequest } from "next/server";

export const getDataFromOrder = (req: NextRequest) => {
  const orderId = req.cookies.get("order")?.value;
  const checkoutSessionToken = req.cookies.get("checkout_session_token")?.value;

  if (!orderId && !checkoutSessionToken) {
    return [];
  }

  return [orderId, checkoutSessionToken];
};
