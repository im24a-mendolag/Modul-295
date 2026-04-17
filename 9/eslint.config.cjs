const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "eqeqeq": "error",
      "curly": "error",
      "semi": ["error", "always"],
    },
  },
  {
    ignores: ["node_modules/**"],
  },
];
