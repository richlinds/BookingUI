import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config — tells Vite to use the React plugin which handles JSX/TSX transformation
// and enables fast refresh (live reload without losing component state)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Match the CRA default port so nothing else needs to change
  },
});
