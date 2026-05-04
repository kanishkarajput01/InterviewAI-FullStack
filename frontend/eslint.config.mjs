import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import unicorn from "eslint-plugin-unicorn";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: {
      unicorn,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // React/Next.js
      "react/self-closing-comp": "error",
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-html-link-for-pages": "error",

      // General Code Quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "no-unneeded-ternary": "error",
      "prefer-arrow-callback": "error",
      "no-nested-ternary": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],

      // File Naming Convention
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            pascalCase: true,
            camelCase: true,
          },
          ignore: [
            "^layout\\.tsx?$",
            "^page\\.tsx?$",
            "^loading\\.tsx?$",
            "^not-found\\.tsx?$",
            "^error\\.tsx?$",
            "^global-error\\.tsx?$",
            "^route\\.ts?$",
            "^template\\.tsx?$",
            "^default\\.tsx?$",
            "^middleware\\.ts?$",
            "^instrumentation\\.ts?$",
          ],
        },
      ],

      // Import Organization
      "no-duplicate-imports": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".git/**",
  ]),
]);

export default eslintConfig;
