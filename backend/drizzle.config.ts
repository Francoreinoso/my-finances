import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/infrastructure/persistence/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DB_PATH ?? './data/finanzas.db',
  },
});
