import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "BioLab";

export default defineConfig({
  root: fileURLToPath(new URL("./github-pages", import.meta.url)),
  base: `/${repositoryName}/`,
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./gh-pages-dist", import.meta.url)),
    emptyOutDir: true,
  },
});
