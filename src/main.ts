import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import {
  swaggerConfig,
  applyGlobalErrorResponses,
  applySwaggerTagGroups,
  applyTagDescriptions,
  SWAGGER_GROUPED_OPEN_API,
  buildOpenApiDocumentForGroup,
  swaggerGroupedJsonSlug,
} from './common/swagger/swagger.config';
import { dtoErrorMapping } from './common/utils/dto-error-mapping';
import { setAuthContextPrisma } from './common/utils/auth-context';
import { PrismaService } from './core/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 인증 컨텍스트 헬퍼: createParamDecorator 등 비-DI 위치에서 PrismaService 사용 가능하게 등록
  setAuthContextPrisma(app.get(PrismaService));

  // 전역 Validation Pipe 등록
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: dtoErrorMapping,
    }),
  );

  // CORS 설정
  app.enableCors();

  // 인터셉터 등록 (필터는 AppModule의 APP_FILTER로 DI 기반 등록)
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger 설정
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  applyTagDescriptions(document);
  applySwaggerTagGroups(document);
  applyGlobalErrorResponses(document);

  const httpAdapter = app.getHttpAdapter();
  if (SWAGGER_GROUPED_OPEN_API.length > 0) {
    for (const cfg of SWAGGER_GROUPED_OPEN_API) {
      const slug = swaggerGroupedJsonSlug(cfg.group);
      const groupedDoc = buildOpenApiDocumentForGroup(document, cfg);
      httpAdapter.get(`/api-docs-json-${slug}`, (_req, res) => {
        res.type('application/json');
        res.send(JSON.stringify(groupedDoc));
      });
    }

    SwaggerModule.setup('api-docs', app, document, {
      explorer: true,
      swaggerOptions: {
        spec: null,
        urls: [
          { name: '전체', url: '/api-docs-json' },
          ...SWAGGER_GROUPED_OPEN_API.map((cfg) => ({
            name: cfg.group,
            url: `/api-docs-json-${swaggerGroupedJsonSlug(cfg.group)}`,
          })),
        ],
        'urls.primaryName': '전체',
        docExpansion: 'none',
        tagsSorter: 'alpha',
        filter: true,
      },
    });
  } else {
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        docExpansion: 'none',
        tagsSorter: 'alpha',
        filter: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`📌 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}

bootstrap();
