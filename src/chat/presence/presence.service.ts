import { Injectable } from '@nestjs/common';

import { ActiveUser } from './interfaces/ActiveUser.interface';

import { RedisCacheService } from 'src/redis.cache.service';
@Injectable()
export class PresenceService {
  constructor(private readonly cache: RedisCacheService) {}

  async getActiveUser(id: number) {
    const user = await this.cache.get(`user ${id}`);

    console.log(user);

    return user as ActiveUser | undefined;
  }
}
