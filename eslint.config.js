import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // TypeScript recommended rules
      ...typescript.configs.recommended.rules,
      
      // React recommended rules
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      "quotes": ["error", "double"],
      "prefer-const": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      
      // Custom React rules
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",
      
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Disable JS rules that conflict with TypeScript
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  {
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "coverage/",
      "*.min.js",
      ".react-router/"
    ],
  },
];