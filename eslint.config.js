import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi", ".wrangler", "worker-configuration.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Componentes gerados do shadcn/ui: por design cada arquivo exporta o componente
    // e suas variants (badgeVariants, buttonVariants…) no mesmo modulo. A regra pede
    // o contrario, e reescrever arquivos vendorizados so os faz divergir do upstream.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  eslintPluginPrettier,
);
