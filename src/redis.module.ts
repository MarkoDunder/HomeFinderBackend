import { Module } from '@nestjs/common';

import { redisStore } from 'cache-manager-redis-yet';

import { RedisCacheService } from './redis.cache.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URI,
          ttl: 5000,
        }),
      }),
      isGlobal: true,
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}
