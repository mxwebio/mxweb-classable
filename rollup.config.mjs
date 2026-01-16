import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import path from "path";
import { glob } from "glob";

// Collect all source files except tests
const inputFiles = glob.sync("src/**/*.{ts,tsx}", {
  ignore: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
});

// Build Rollup input map
const input = inputFiles.reduce((acc, file) => {
  const relativePath = path.relative("src", file);
  const key = relativePath.replace(path.extname(relativePath), "");
  acc[key] = file;
  return acc;
}, {});

// ESM-only, no framework assumptions
const external = [];

// Simple minification
const minifyOptions = {
  compress: {
    drop_console: false,
    drop_debugger: true,
  },
  mangle: true,
};

export default {
  input,
  external,
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].mjs",
    preserveModules: true,
    preserveModulesRoot: "src",
    exports: "named",
    generatedCode: {
      symbols: true,
    },
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
      rootDir: "src",
    }),
    terser(minifyOptions),
  ],
};
