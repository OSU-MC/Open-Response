[
  {
    "ignores": [
      "node_modules/**",
      "dist/**"
    ]
  },
  {
    "files": [
      "**/*.{js,jsx}"
    ],
    "languageOptions": {
      "env": {
        "browser": true,
        "node": true,
        "es2021": true
      },
      "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module",
        "ecmaFeatures": {
          "jsx": true
        }
      }
    },
    "plugins": {
      "react": "eslint-plugin-react",
      "react-hooks": "eslint-plugin-react-hooks",
      "prettier": "eslint-plugin-prettier"
    },
    "settings": {
      "react": {
        "version": "detect"
      }
    },
    "extends": [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:prettier/recommended"
    ],
    "rules": {
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "curly": ["error", "all"],

      "eqeqeq": ["error", "always"],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],

      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", { "props": "never", "children": "never" }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": ["warn"],

      "prettier/prettier": ["error"]
    },
    "linterOptions": {
      "reportUnusedDisableDirectives": true
    }
  }
]
