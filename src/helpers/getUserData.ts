import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const getUserData = (req: NextRequest) => {
  const userId = req.cookies.get("user")?.value;

  if (!userId) {
    return '';
  }

  return userId;
};
