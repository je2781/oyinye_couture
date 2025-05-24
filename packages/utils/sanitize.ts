// utils/sanitize.ts
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

export function sanitizeInput(dirty: string | null | undefined) {
  if (typeof dirty !== 'string') return null;
  return DOMPurify.sanitize(dirty);
}

