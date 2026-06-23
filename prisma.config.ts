import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development', override: true });
dotenv.config({ override: false });
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
