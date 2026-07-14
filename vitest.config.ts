import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // python_generation.test.ts rewrites the shared generated package. Running
    // test files in parallel can make parity tests import it mid-regeneration.
    fileParallelism: false,
  },
})
