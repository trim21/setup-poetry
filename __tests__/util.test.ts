import { getLatestPoetryVersion } from "../src/utils";

test("throws invalid number", async () => {
  expect(await getLatestPoetryVersion()).toMatch(/\d+\.\d+\.\d+/);
});
