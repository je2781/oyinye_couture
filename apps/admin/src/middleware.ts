// apps/admin/middleware.ts
import type { NextRequest } from 'next/server';
import {withAuthMiddleware} from '@middleware/auth';

export function middleware(request: NextRequest) {
  return withAuthMiddleware(request);
}


