import {Request} from 'express';

export const getVisitData = (req: Request) => {
  const visitId = req.cookies["visit"];

  if (!visitId) {
    return null;
  }

  return visitId;
};
