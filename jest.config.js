/** @type {import('ts-jest').JestConfigWithTsJest} **/
const { dir } = require("console");
const nextJest = require("next/jest");
require("dotenv").config({ path: ".env.development" });
const nextJestConfig = nextJest({
  dir: ".",
});
const jestConfig = nextJestConfig({
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
});
module.exports = jestConfig;
