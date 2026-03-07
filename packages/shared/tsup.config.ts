import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'api/index': 'src/api/index.ts',
    'types/index': 'src/types/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'utils/index': 'src/utils/index.ts',
    'store/index': 'src/store/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disable dts, will use tsc separately
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', '@tanstack/react-query', 'zustand', 'zustand/middleware'],
});
