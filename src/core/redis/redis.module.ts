// src/redis/redis.module.ts
import { Module, Global, OnModuleDestroy, Inject } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Global() // 전역 모듈로 설정
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: process.env.REDIS_URL,
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          socket: {
            reconnectStrategy: (retries) => {
              // 재연결 간격을 지수적으로 증가 (최대 10초)
              return Math.min(retries * 100, 10000);
            },
            connectTimeout: 10000, // 연결 타임아웃 10초
            keepAlive: 5000 as unknown as boolean, // TCP Keep-Alive 5초
          }
        });

        client.on('error', (err) => console.error('Redis 클라이언트 에러:', err));
        await client.connect();
        return client;
      }
    },
    RedisService
  ],
  exports: [RedisService, 'REDIS_CLIENT']
})
export class RedisModule implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: ReturnType<typeof createClient>
  ) { }

  async onModuleDestroy() {
    // 애플리케이션 종료 시 레디스 연결 정리
    await this.redisClient.quit();
  }
}