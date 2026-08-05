/* eslint-disable @typescript-eslint/no-deprecated -- tseslint.config() is the only way to use extends; core defineConfig has incompatible API */
import { includeIgnoreFile } from "@eslint/config-helpers";
import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginAstro from "eslint-plugin-astro";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import tseslint from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

// packages/code-reviewer is an isolated workspace with its own tsconfig. The root project
// service cannot resolve it, so type-aware rules are applied everywhere except there; see
// reviewerConfig below for how it is still linted.
const REVIEWER_PACKAGE = "packages/code-reviewer/**";

const baseConfig = tseslint.config({
  ignores: [REVIEWER_PACKAGE],
  extends: [eslint.configs.recommended, tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
  },
});

const reactConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  ignores: [REVIEWER_PACKAGE],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    "react-hooks": eslintPluginReactHooks,
    "react-compiler": reactCompiler,
  },
  settings: { react: { version: "detect" } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react-compiler/react-compiler": "error",
  },
});

const astroConfig = tseslint.config({
  files: ["**/*.astro"],
  rules: {
    "astro/no-set-html-directive": "error",
    "astro/no-unused-css-selector": "warn",
    "astro/prefer-class-list-directive": "warn",
  },
});

const nodeScriptConfig = tseslint.config({
  files: ["scripts/**/*.mjs", "packages/ai-toolkit/**/*.{js,mjs}"],
  extends: [tseslint.configs.disableTypeChecked],
  languageOptions: {
    parserOptions: {
      sourceType: "commonjs",
    },
    globals: {
      console: "readonly",
      process: "readonly",
      require: "readonly",
      __dirname: "readonly",
    },
  },
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-require-imports": "off",
  },
});

// Linted without type information rather than not at all: the package runs its own
// `tsc --noEmit` and vitest suite, which cover what type-aware rules would have caught.
const reviewerConfig = tseslint.config({
  files: ["packages/code-reviewer/**/*.ts"],
  extends: [eslint.configs.recommended, tseslint.configs.recommended],
  languageOptions: {
    globals: {
      console: "readonly",
      process: "readonly",
    },
  },
  rules: {
    "no-console": "off",
  },
});

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  baseConfig,
  reactConfig,
  reviewerConfig,
  eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],
  astroConfig,
  nodeScriptConfig,
  eslintPluginPrettier,
);
