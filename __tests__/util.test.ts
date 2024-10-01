import { getPoetryPypiJSON, getLatestMatchedVersion } from "../src/utils";
import { test, expect } from "@jest/globals";

test("throws invalid number", async () => {
  await expect(getPoetryPypiJSON()).resolves.toHaveProperty(
    "info.version",
    expect.stringMatching(/\d+\.\d+\.\d+/),
  );
});

test("select latest version", () => {
  expect(getLatestMatchedVersion(["1.0.0", "1.2.3"], ">1.2.0")).toBe("1.2.3");
  expect(getLatestMatchedVersion(["1.0.0", "1.2.3"], "==1.2.*")).toBe("1.2.3");
  expect(getLatestMatchedVersion(["1.0.0", "1.2.3"], ">=1.3,<2.0")).toBe(null);
  expect(
    getLatestMatchedVersion(["1.1.3", "1.1.2", "1.2.3"], "~=1.1.0, != 1.1.3"),
  ).toBe("1.1.2");
});
