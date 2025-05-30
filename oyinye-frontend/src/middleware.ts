import { createCsrfMiddleware } from "@edge-csrf/nextjs";

// initalize csrf protection middleware
const csrfMiddleware = createCsrfMiddleware({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  },
});


export const middleware = csrfMiddleware;

