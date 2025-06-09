// vite.config.ts
import { defineConfig } from "file:///C:/Users/User/Desktop/finmanage_spl/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/User/Desktop/finmanage_spl/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/User/Desktop/finmanage_spl/node_modules/lovable-tagger/dist/index.js";
import { resolve } from "path";
import dts from "file:///C:/Users/User/Desktop/finmanage_spl/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\User\\Desktop\\finmanage_spl\\packages\\core";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    // Plugins que são executados apenas em desenvolvimento
    mode === "development" && componentTagger(),
    // Gerar arquivos .d.ts para a biblioteca
    dts({
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.ts", "src/**/*.stories.tsx"],
      outDir: "dist"
    })
    // Nota: O Stagewise Toolbar é inicializado no arquivo main.tsx apenas em desenvolvimento
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "FinmanageCore",
      fileName: (format) => `finmanage-core.${format}.js`,
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      }
    },
    sourcemap: true,
    // Não minificar para facilitar a depuração
    minify: mode === "production"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERlc2t0b3BcXFxcZmlubWFuYWdlX3NwbFxcXFxwYWNrYWdlc1xcXFxjb3JlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERlc2t0b3BcXFxcZmlubWFuYWdlX3NwbFxcXFxwYWNrYWdlc1xcXFxjb3JlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Vc2VyL0Rlc2t0b3AvZmlubWFuYWdlX3NwbC9wYWNrYWdlcy9jb3JlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgLy8gUGx1Z2lucyBxdWUgc1x1MDBFM28gZXhlY3V0YWRvcyBhcGVuYXMgZW0gZGVzZW52b2x2aW1lbnRvXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICAgIC8vIEdlcmFyIGFycXVpdm9zIC5kLnRzIHBhcmEgYSBiaWJsaW90ZWNhXHJcbiAgICBkdHMoe1xyXG4gICAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qLnRzJywgJ3NyYy8qKi8qLnRzeCddLFxyXG4gICAgICBleGNsdWRlOiBbJ3NyYy8qKi8qLnRlc3QudHMnLCAnc3JjLyoqLyoudGVzdC50c3gnLCAnc3JjLyoqLyouc3Rvcmllcy50cycsICdzcmMvKiovKi5zdG9yaWVzLnRzeCddLFxyXG4gICAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgIH0pLFxyXG4gICAgLy8gTm90YTogTyBTdGFnZXdpc2UgVG9vbGJhciBcdTAwRTkgaW5pY2lhbGl6YWRvIG5vIGFycXVpdm8gbWFpbi50c3ggYXBlbmFzIGVtIGRlc2Vudm9sdmltZW50b1xyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBsaWI6IHtcclxuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXHJcbiAgICAgIG5hbWU6ICdGaW5tYW5hZ2VDb3JlJyxcclxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBmaW5tYW5hZ2UtY29yZS4ke2Zvcm1hdH0uanNgLFxyXG4gICAgICBmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIGdsb2JhbHM6IHtcclxuICAgICAgICAgIHJlYWN0OiAnUmVhY3QnLFxyXG4gICAgICAgICAgJ3JlYWN0LWRvbSc6ICdSZWFjdERPTScsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICAvLyBOXHUwMEUzbyBtaW5pZmljYXIgcGFyYSBmYWNpbGl0YXIgYSBkZXB1cmFcdTAwRTdcdTAwRTNvXHJcbiAgICBtaW5pZnk6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVYsU0FBUyxvQkFBb0I7QUFDaFgsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTO0FBTGhCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLElBRU4sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQTtBQUFBLElBRWhCLElBQUk7QUFBQSxNQUNGLFNBQVMsQ0FBQyxlQUFlLGNBQWM7QUFBQSxNQUN2QyxTQUFTLENBQUMsb0JBQW9CLHFCQUFxQix1QkFBdUIsc0JBQXNCO0FBQUEsTUFDaEcsUUFBUTtBQUFBLElBQ1YsQ0FBQztBQUFBO0FBQUEsRUFFSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDeEMsTUFBTTtBQUFBLE1BQ04sVUFBVSxDQUFDLFdBQVcsa0JBQWtCLE1BQU07QUFBQSxNQUM5QyxTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsSUFDdkI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLFdBQVc7QUFBQSxNQUMvQixRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsUUFDZjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUE7QUFBQSxJQUVYLFFBQVEsU0FBUztBQUFBLEVBQ25CO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
