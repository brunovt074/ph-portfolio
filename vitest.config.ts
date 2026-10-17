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
        'migrations/localize-fields/localizeFieldPatches.ts',
        'sanity/validation/reservedSlugs.ts',
        'sanity/validation/seriesSlugTakenQuery.ts',
        'src/domain/Locale.ts',
        'src/domain/formatText.ts',
        'src/domain/routing/**',
        'src/infrastructure/seed/**',
        'src/infrastructure/texts/**',
        'src/infrastructure/sanity/SanityContentRepository.ts',
        'src/infrastructure/sanity/CachedSanityClient.ts',
        'src/infrastructure/sanity/mapping/**',
        'src/infrastructure/email/**',
        'src/infrastructure/rateLimit/SlidingWindowLimiter.ts',
        'src/infrastructure/rateLimit/resolveClientKey.ts',
        'src/infrastructure/reporting/ConsoleErrorReporter.ts',
      ],
      exclude: ['src/infrastructure/seed/data/**', 'src/application/results/**', 'src/application/inputs/**', 'src/infrastructure/texts/defaults/**'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
