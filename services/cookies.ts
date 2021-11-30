import express from "express";

export default (req: express.Request, res: express.Response, next: any) => {
  if (req.cookies.jwt) {
    // attach to the authorization header
    req.headers.authorizeation = `Bearer ${req.cookies.jwt}`;
  }
  next();
};