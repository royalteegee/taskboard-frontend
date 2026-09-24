import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: Number(env.FRONTEND_PORT) || 5173,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
      port: Number(env.PREVIEW_PORT) || 4173,
      strictPort: true,
    },
  };
});
