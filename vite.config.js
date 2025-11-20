import { resolve, dirname } from 'path'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        404: resolve(__dirname, 'pages/404.html'),
        about: resolve(__dirname, 'pages/about.html'),
        admin: resolve(__dirname, 'pages/admin.html'),
        car: resolve(__dirname, 'pages/car.html'),
        destinations: resolve(__dirname, 'pages/destinations.html'),
        login: resolve(__dirname, 'pages/login.html'),
        register: resolve(__dirname, 'pages/register.html'),
        tours: resolve(__dirname, 'pages/tours.html'),
        user: resolve(__dirname, 'pages/user.html'),
      }
    }
  }
})
