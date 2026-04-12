import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDirectory = new URL("./src/frontend", import.meta.url).pathname;
const backendDirectory = new URL("./src/backend", import.meta.url).pathname;
const dbDirectory = new URL("./src/db", import.meta.url).pathname;
const sharedDirectory = new URL("./src/shared", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  root: "src/frontend",
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@frontend": rootDirectory,
      "@backend": backendDirectory,
      "@db": dbDirectory,
      "@shared": sharedDirectory,
    },
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
