import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Il chunk "data" contiene calendario + rose storiche (~575 KB, 60 KB gzip).
    // E' caricato in lazy solo dalle rotte che lo usano, quindi la soglia
    // di default non ci interessa.
    chunkSizeWarningLimit: 700,
  },
})
