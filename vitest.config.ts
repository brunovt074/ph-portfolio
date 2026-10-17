import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/application/**',
        'src/infrastructure/seed/**',
        'src/infrastructure/sanity/SanityContentRepository.ts',
        'src/infrastructure/sanity/CachedSanityClient.ts',
        'src/infrastructure/sanity/mapping/**',
      ],
      exclude: ['src/infrastructure/seed/data/**', 'src/application/results/**'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
