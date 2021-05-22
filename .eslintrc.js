module.exports = {
  extends: [
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: [
    "import",
    "promise",
    "@typescript-eslint",
    "jest",
  ],
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: [
        "*.test.ts",
        "*.test.js",
      ],
      env: {
        "jest/globals": true,
      },
      rules: {
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error",
      },
    },
  ],
  parserOptions: {
    sourceType: "module",
    // project: './tsconfig.json',
    ecmaVersion: 6,
  },
  rules: {
    "object-curly-spacing": ["error", "always"],
    "@typescript-eslint/object-curly-spacing": ["error", "always"],
    quotes: ["error", "double", { "avoidEscape": true }],
    "@typescript-eslint/member-delimiter-style": ["error", {
      "multiline": {
        "delimiter": "semi",
        "requireLast": true,
      },
      "singleline": {
        "delimiter": "semi",
        "requireLast": false,
      },
      "multilineDetection": "brackets",
    }],
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always",
    }],
    semi: ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "import/no-unused-modules": [
      1,
      {
        unusedExports: true,
      },
    ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
    ],
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        groups: [
          "builtin",
          "external",
          [
            "index",
            "sibling",
            "parent",
          ],
          "internal",
          "object",
        ],
      },
    ],
  },
};
