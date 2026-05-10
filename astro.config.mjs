import { defineConfig } from "astro/config";
import node from "@astrojs/node"; // <--- Cambio vercel por node

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone", // <--- Esto es necesario para Render
  }),
  security: {
    checkOrigin: false, // Lo mantengo por seguridad en los formularios
  },
});
