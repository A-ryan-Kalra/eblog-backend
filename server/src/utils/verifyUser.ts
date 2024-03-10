import jwt from "jsonwebtoken";
import { errorHandler } from "./errorHandler";
import express from "express";

export interface UserProps extends express.Request {
  user?: any;
}

export const verifyToken = (
  req: UserProps,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.cookies.access_token;

  if (!token) {
    next(errorHandler(401, "Unauthorized"));
  }
  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: Error | null, user: any) => {
      if (err) {
        return next(errorHandler(401, "Unauthorized"));
      }
      req.user = user;
      next();
    }
  );
};
