import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Göreli yollar: site GitHub Pages'te alt klasörden açılınca da çalışsın
  base: "./",
  server: {
    // İndirme sırasında oluşan kilitli geçici dosyalar sunucuyu çökertiyor
    watch: { ignored: ["**/*.crdownload", "**/*.tmp"] },
  },
});
