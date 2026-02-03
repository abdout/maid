import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'src/db/migrations/**',
        'src/db/seed.ts',
        '**/*.d.ts',
      ],
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
