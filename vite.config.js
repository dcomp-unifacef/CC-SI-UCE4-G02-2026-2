import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento, toda chamada para /api/... é repassada ao back-end
// (Express, porta 8888) sem o prefixo /api. Assim o navegador enxerga front
// e API no mesmo endereço, e o cookie de login funciona sem precisar de CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (caminho) => caminho.replace(/^\/api/, ''),
      },
    },
  },
})
