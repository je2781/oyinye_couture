import { createCsrfMiddleware } from "@edge-csrf/nextjs";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// initalize csrf protection middleware
const csrfMiddleware = createCsrfMiddleware({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  },
});

export const withAuthMiddleware = (req: NextRequest) => {
  // Check if the request has the custom QStash header to bypass CSRF protection
  const isQstashRequest = req.headers.get("x-internal-qstash-key") === process.env.QSTASH_INTERNAL_KEY!;

  if (isQstashRequest) {
    console.log("Bypassing CSRF protection for QStash request.");
    return NextResponse.next(); // Bypass CSRF middleware
  }

  // Otherwise, run the CSRF middleware normally
  return csrfMiddleware(req);
};


// export const middleware = csrfMiddleware;

