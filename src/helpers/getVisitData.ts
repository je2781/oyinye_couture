import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const getVisitData = (req: NextRequest) => {
  const visitId = req.cookies.get("visit")?.value;

  if (!visitId) {
    return null;
  }

  return visitId;
};
