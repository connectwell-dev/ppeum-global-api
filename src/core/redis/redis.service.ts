// src/redis/redis.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: ReturnType<typeof createClient>
  ) { }

  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await this.redisClient.keys(pattern);
    let deletedCount = 0;
    if (keys.length > 0) {
      deletedCount = await this.redisClient.del(keys) as number;
    }

    return deletedCount;
  }
  // 필요한 다른 레디스 작업 메서드 추가
}