import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // Use direct connection (port 5432) for migrations
    url: process.env.DATABASE_URL_DIRECT!,
  },
});
