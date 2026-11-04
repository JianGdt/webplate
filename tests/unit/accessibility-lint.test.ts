import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { Linter } = require("eslint");
const a11y = require("eslint-plugin-jsx-a11y");

describe("accessibility lint with patched minimatch", () => {
  it.each([
    ["<label>Name<CustomInput /></label>", 0],
    ["<label><CustomInput /></label>", 1],
    ["<label>Name<OtherWidget /></label>", 1],
  ])("checks custom control patterns in %s", (source, errors) => {
    const messages = new Linter().verify(source, {
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { "jsx-a11y": a11y },
      rules: {
        "jsx-a11y/label-has-associated-control": [
          "error",
          { controlComponents: ["Custom*"], assert: "nesting" },
        ],
      },
    });
    expect(messages).toHaveLength(errors);
    for (const message of messages) {
      expect(message.ruleId).toBe("jsx-a11y/label-has-associated-control");
    }
  });
});
