import { test } from "node:test";
import assert from "node:assert";
import { filterMessageByKeywords } from "./filter-messages.js";

test("filter-messages.js", async (t) => {
  await t.test("fuzzyMatch", async (t) => {
    await t.test("should match exact keywords", () => {
      const message = "جندي في الشارع";
      const keywords = { جندي: "חייל" };
      const result = filterMessageByKeywords(
        { message },
        { keywords },
        { silly: () => {} }
      );
      assert.ok(result);
      assert.strictEqual(result[0].arabic, "جندي");
      assert.strictEqual(result[0].hebrew, "חייל");
    });

    await t.test("should match similar keywords with slight variations", () => {
      const message = "جنديي في الشارع";
      const keywords = { جندي: "חייל" };
      const result = filterMessageByKeywords(
        { message },
        { keywords },
        { silly: () => {} }
      );
      assert.ok(result);
      assert.strictEqual(result[0].arabic, "جندي");
      assert.strictEqual(result[0].hebrew, "חייל");
    });

    await t.test("should match keywords with different word forms", () => {
      const message = "جندية في الشارع";
      const keywords = { جندي: "חייל" };
      const result = filterMessageByKeywords(
        { message },
        { keywords },
        { silly: () => {} }
      );
      assert.ok(result);
      assert.strictEqual(result[0].arabic, "جندي");
      assert.strictEqual(result[0].hebrew, "חייל");
    });

    await t.test("should not match completely different words", () => {
      const message = "سيارة في الشارع";
      const keywords = { جندي: "חייל" };
      const result = filterMessageByKeywords(
        { message },
        { keywords },
        { silly: () => {} }
      );
      assert.strictEqual(result, false);
    });

    await t.test("should handle multiple keywords", () => {
      const message = "جندي و جنود في الشارع";
      const keywords = {
        جندي: "חייל",
        جنود: "חיילים",
      };
      const result = filterMessageByKeywords(
        { message },
        { keywords },
        { silly: () => {} }
      );
      assert.ok(result);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].arabic, "جندي");
      assert.strictEqual(result[0].hebrew, "חייל");
      assert.strictEqual(result[1].arabic, "جنود");
      assert.strictEqual(result[1].hebrew, "חיילים");
    });

    await t.test("should handle excluded keywords", () => {
      const message = "جندي في غزة";
      const keywords = { جندي: "חייל" };
      const excludeKeywords = ["غزة"];
      const result = filterMessageByKeywords(
        { message },
        { keywords, excludeKeywords },
        { silly: () => {} }
      );
      assert.strictEqual(result, false);
    });
  });
});
