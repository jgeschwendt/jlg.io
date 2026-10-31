import { log } from '@/lib/log';

export function register(): void {
  log('server ready', {
    environment: process.env['VERCEL_ENV'] ?? process.env.NODE_ENV,
    runtime: process.env['NEXT_RUNTIME'],
  });
}
