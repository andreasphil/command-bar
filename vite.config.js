import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/commandBar.js",
      formats: ["es"],
      fileName: (_, entryname) => `${entryname}.js`,
    },
    minify: false,
    target: "esnext",
  },
});
