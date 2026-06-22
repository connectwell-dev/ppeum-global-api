import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingService implements OnModuleInit {
  private defaultLanguage = 'ja';
  private publicLanguage = 'ko';
  private siteUseLanguages: string[] = ['en', 'zhCN', 'zhTW', 'th', 'vi', 'ru'];

  constructor(private readonly prisma: PrismaService) { }

  async onModuleInit() {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const info = await this.prisma.generalInfo.findFirst({
        select: { defaultLanguage: true, publicLanguage: true, useLanguage: true },
      });
      if (!info) return;

      this.defaultLanguage = info.defaultLanguage;
      this.publicLanguage = info.publicLanguage;

      const useLanguage = info.useLanguage as Record<string, boolean>;
      this.siteUseLanguages = Object.entries(useLanguage)
        .filter(([lang, enabled]) => enabled && lang !== info.defaultLanguage && lang !== info.publicLanguage)
        .map(([lang]) => lang);

      console.log(this.defaultLanguage, this.publicLanguage, this.siteUseLanguages);
    } catch {
      // DB 연결 실패 시 fallback 값 유지
    }
  }

  getDefaultLanguage(): string {
    return this.defaultLanguage;
  }

  getPublicLanguage(): string {
    return this.publicLanguage;
  }

  getSiteUseLanguages(): string[] {
    return this.siteUseLanguages;
  }

  getAllLanguages(): string[] {
    return [this.defaultLanguage, this.publicLanguage, ...this.siteUseLanguages];
  }
}
