import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [
      react(),
  ],
  publicDir: resolve(__dirname, "static"),
  build: {
    rollupOptions: {
      input: {
        'home': resolve(__dirname, "templates", "home.html"),
      }
    }
  }
})
