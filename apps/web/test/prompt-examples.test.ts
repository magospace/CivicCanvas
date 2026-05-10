import { describe, expect, it } from "vitest";
import { getPromptExamples } from "../lib/data";

describe("prompt example fixture data", () => {
  it("loads supported prompt chips through the data loader", () => {
    const examples = getPromptExamples();

    expect(examples).toHaveLength(3);
    expect(examples.map((example) => example.label)).toEqual([
      "Dallas 311 by ZIP",
      "Austin permits trend",
      "Houston incidents"
    ]);
    expect(examples.every((example) => example.prompt.length > 20)).toBe(true);
  });
});
