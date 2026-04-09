import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ignores: ["src/lib/**/*", "src/components/ui/**/*", "node_modules", "dist"],
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    plugins: {
      "react-hooks": pluginReactHooks,
      "unused-imports": pluginUnusedImports,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": "warn",
      "unused-imports/no-unused-imports": "error",
    },
  },
];