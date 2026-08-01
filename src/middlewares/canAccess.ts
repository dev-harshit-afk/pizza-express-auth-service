import { NextFunction, Request, Response } from "express";
import { RequestAuth } from "../types";
import createHttpError from "http-errors";

export default function canAccess(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as RequestAuth;
    const userRole = _req.auth.role;
    if (!roles.includes(userRole)) {
      const err = createHttpError(403, "Forbidden");
      return next(err);
    }
    next();
  };
}
