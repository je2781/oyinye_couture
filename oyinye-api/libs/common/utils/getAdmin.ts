import {Request} from 'express';

export const getAdminData = (req: Request) => {
  const adminStatus = req.cookies["admin_status"];

  if (!adminStatus) {
    return null;
  }

  return Boolean(adminStatus);
};
