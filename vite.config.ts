import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React bundle
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI components (shared across app)
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-tabs',
            '@radix-ui/react-sheet'
          ],
          
          // Heavy studio dependencies
          studio: ['konva', 'react-konva'],
          fabric: ['fabric'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          
          // AI/ML dependencies
          ai: ['@huggingface/transformers', 'openai'],
          
          // Data management
          data: ['@tanstack/react-query', 'zustand'],
          
          // Utilities
          utils: ['clsx', 'tailwind-merge', 'date-fns', 'sonner']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'konva', 
      'react-konva',
      '@radix-ui/react-dialog',
      '@radix-ui/react-sheet',
      'zustand',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      'fabric',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@huggingface/transformers'
    ]
  }
}));