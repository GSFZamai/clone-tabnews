/** @type {import('ts-jest').JestConfigWithTsJest} **/
const nextJest = require("next/jest");
require("dotenv").config({ path: ".env.development" });
const nextJestConfig = nextJest({
  dir: ".",
});
const jestConfig = nextJestConfig({
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});
module.exports = jestConfig;
