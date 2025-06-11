// eslint.config.js
import eslint from "@eslint/js";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  eslint.configs.recommended,
  {
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: hooksPlugin.configs.recommended.rules,
  },
];