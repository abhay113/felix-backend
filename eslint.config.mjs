import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Configuration for JavaScript/TypeScript files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.browser },
  },
  // TypeScript ESLint configuration
  tseslint.configs.recommended,
  {
    // Adding custom rules
    rules: {
      // Disabling the 'no-explicit-any' rule globally
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
