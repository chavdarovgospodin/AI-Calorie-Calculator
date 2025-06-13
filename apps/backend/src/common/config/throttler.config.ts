import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'default',
      ttl: 60 * 1000, // 1 minute
      limit: 100, // 100 requests per minute (general)
    },
    {
      name: 'auth',
      ttl: 5 * 60 * 1000, // 5 minutes  
      limit: 5, // 5 login attempts per 5 minutes
    },
    {
      name: 'ai',
      ttl: 60 * 1000, // 1 minute
      limit: 10, // 10 AI requests per minute (generous for friends)
    }
  ],
};