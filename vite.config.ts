import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['src/index.tsx'],
      exclude: ['src/Demo/**', '**/*.test.*', '**/*.spec.*'],
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'EyeUX',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        interop: 'auto',
      },
    },
    minify: 'esbuild',
    sourcemap: true,
    target: 'es2018',
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
  },
}));
