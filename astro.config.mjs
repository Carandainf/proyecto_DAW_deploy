import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  // ESTE BLOQUE ES PARA QUE EL SERVIDOR RENDER ESCUCHE EN TODAS LAS INTERFACES DE RED Y NO SOLO EN LOCALHOST
  server: {
    host: true, // Esto hace que escuche en 0.0.0.0 en lugar de localhost
    port: 10000,
  },
  security: {
    checkOrigin: false,
  },
});
