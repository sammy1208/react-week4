import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   base: import.meta.env.MODE === "production" ? "/react-week4/" : "/",
//   plugins: [react()],
// })
export default defineConfig({
  base: "/react-week4/",   // ← 這裡改成你的 repo 名稱！
  plugins: [react()],
});