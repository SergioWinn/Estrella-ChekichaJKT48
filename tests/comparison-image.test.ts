import test from "node:test";
import assert from "node:assert/strict";

import { createComparisonImage } from "../lib/comparison-image.ts";

test("comparison PNG keeps every row, wraps names, and reports rendering failures", async (t) => {
  const labels: { text: string; x: number; y: number }[] = [];
  const context = {
    fillRect() {},
    measureText: (text: string) => ({ width: [...text].length * 16 }),
    fillText: (text: string, x: number, y: number) => labels.push({ text, x, y }),
  };
  let available = true;
  let blob: Blob | null = new Blob(["png"], { type: "image/png" });
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => available ? context : null,
    toBlob: (callback: (value: Blob | null) => void, type: string) => {
      assert.equal(type, "image/png");
      callback(blob);
    },
  };
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    fonts: { ready: Promise.resolve() },
    body: {},
    createElement: (tag: string) => { assert.equal(tag, "canvas"); return canvas; },
  } });
  Object.defineProperty(globalThis, "getComputedStyle", { configurable: true, value: () => ({ fontFamily: "sans-serif" }) });
  t.after(() => {
    Reflect.deleteProperty(globalThis, "document");
    Reflect.deleteProperty(globalThis, "getComputedStyle");
  });

  const longName = "Member with a very long name 🎀 & <special> characters";
  const members = [
    { id: "long", full_name: longName, showEventCheki: 0, lastShowEventTime: null },
    ...Array.from({ length: 80 }, (_, index) => ({
      id: String(index), nickname: `Member ${index}`, showEventCheki: index,
      lastShowEventTime: "2026-10-15T18:30:00Z",
    })),
  ];
  assert.equal(await createComparisonImage(members), blob);
  assert.equal(canvas.width, 1080);
  const names = labels.filter(({ x, y }) => x === 64 && y >= 300 && y < canvas.height - 124);
  const longNameLines = names.slice(0, names.length - 80);
  assert.equal(longNameLines.map(({ text }) => text).join(""), longName);
  assert.deepEqual(names.slice(-80).map(({ text }) => text), Array.from({ length: 80 }, (_, index) => `Member ${index}`));
  assert.ok(names.every(({ text }) => context.measureText(text).width <= 440));
  assert.ok(names.some(({ text }) => text === "Member 79"));
  assert.ok(labels.some(({ text }) => text === "16 Oct 2026"));
  assert.ok(labels.some(({ text }) => text === "Not recorded"));
  assert.ok(labels.some(({ text }) => text.includes("Excludes birthday & graduation")));
  assert.ok(labels.every(({ y }) => y + 36 < canvas.height));

  available = false;
  await assert.rejects(createComparisonImage(members), /Canvas is unavailable/);
  available = true;
  blob = null;
  await assert.rejects(createComparisonImage(members), /PNG export failed/);
});
