import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Plugins que são executados apenas em desenvolvimento
    mode === 'development' &&
    componentTagger(),
    // Gerar arquivos .d.ts para a biblioteca
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.ts', 'src/**/*.stories.tsx'],
      outDir: 'dist',
    }),
    // Nota: O Stagewise Toolbar é inicializado no arquivo main.tsx apenas em desenvolvimento
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FinmanageCore',
      fileName: (format) => `finmanage-core.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    // Não minificar para facilitar a depuração
    minify: mode === 'production',
  },
}));
