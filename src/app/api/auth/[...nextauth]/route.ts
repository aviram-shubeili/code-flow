import { handlers } from '@/auth';

export const runtime = 'nodejs'; // Important: Drizzle works in Node.js runtime

export const { GET, POST } = handlers;
