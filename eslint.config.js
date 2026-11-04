import astro from "eslint-plugin-astro";
import ts from "typescript-eslint";
import a11y from "eslint-plugin-jsx-a11y";
export default [
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  { ignores: ["dist/**", ".astro/**", "node_modules/**"] },
  {
    files: ["**/*.tsx"],
    plugins: { "jsx-a11y": a11y },
    rules: a11y.configs.recommended.rules,
  },
];
