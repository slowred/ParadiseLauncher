import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Prevents conflicts with Tauri
  clearScreen: false,
  
  // Development server settings
  server: {
    port: 5173,
    strictPort: true,
  }
})