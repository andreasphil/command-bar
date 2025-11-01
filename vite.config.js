import { defineConfig } from "rolldown-vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./mod.js",
      formats: ["es"],
      fileName: (_, entryname) => `${entryname}.js`,
    },
    minify: false,
    target: "esnext",
  },
});
