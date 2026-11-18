import { formatEventDate } from "./format.ts";
import type { MemberChekiStats, MemberRecord } from "./types.ts";

export type ComparisonImageTheme = "dark" | "light";

const imageThemes = {
  dark: { background: "#201a1f", foreground: "#f8eef2", muted: "#d4c2cb", border: "#59434e", accent: "#f297b5", metric: "#55cbd2" },
  light: { background: "#fffafb", foreground: "#29252b", muted: "#70616a", border: "#e3ccd3", accent: "#b93652", metric: "#147f86" },
} satisfies Record<ComparisonImageTheme, Record<string, string>>;

export async function copyComparisonImage(members: (MemberRecord & MemberChekiStats)[], theme: ComparisonImageTheme = "light"): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new Error("Image copying requires a supported browser over HTTPS.");
  }
  // Start the clipboard write during the click, before rendering awaits fonts.
  await navigator.clipboard.write([new ClipboardItem({ "image/png": createComparisonImage(members, theme) })]);
}

export async function createComparisonImage(members: (MemberRecord & MemberChekiStats)[], theme: ComparisonImageTheme = "light"): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  const colors = imageThemes[theme];
  const font = getComputedStyle(document.body).fontFamily;
  context.font = `28px ${font}`;
  const rows = members.map((member) => {
    const lines = [""];
    for (const character of member.nickname || member.full_name || "Unknown member") {
      const index = lines.length - 1;
      if (lines[index] && context.measureText(lines[index] + character).width > 440) {
        lines.push(character);
      } else {
        lines[index] += character;
      }
    }
    return { member, lines, height: Math.max(76, lines.length * 36 + 28) };
  });

  canvas.width = 1080;
  canvas.height = 300 + rows.reduce((height, row) => height + row.height, 0) + 124;
  context.fillStyle = colors.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textBaseline = "top";
  context.fillStyle = colors.accent;
  context.font = `24px ${font}`;
  context.fillText("JKT48 Chekicha! Archive", 64, 48);
  context.fillStyle = colors.foreground;
  context.font = `600 44px ${font}`;
  context.fillText("Compare members", 64, 94);
  context.fillStyle = colors.muted;
  context.font = `23px ${font}`;
  context.fillText("Show/event only · Excludes birthday & graduation", 64, 158);
  context.fillText("Unrecorded first, then oldest last date", 64, 194);
  context.fillText("Member", 64, 258);
  context.fillText("Last Chekicha", 560, 258);
  context.textAlign = "right";
  context.fillText("Times", 1016, 258);

  let y = 300;
  for (const { member, lines, height } of rows) {
    context.fillStyle = colors.border;
    context.fillRect(64, y, 952, 1);
    context.textAlign = "left";
    context.fillStyle = colors.foreground;
    context.font = `28px ${font}`;
    lines.forEach((line, index) => context.fillText(line, 64, y + 22 + index * 36));
    context.fillStyle = colors.muted;
    context.fillText(member.lastShowEventTime ? formatEventDate(member.lastShowEventTime) : "Not recorded", 560, y + 22);
    context.textAlign = "right";
    context.fillStyle = colors.metric;
    context.fillText(String(member.showEventCheki), 1016, y + 22);
    y += height;
  }
  context.textAlign = "left";
  context.fillStyle = colors.muted;
  context.font = `22px ${font}`;
  context.fillText(`Exported ${formatEventDate(new Date())} (WIB)`, 64, y + 36);
  context.fillText("by @estrellawin19", 64, y + 72);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed")), "image/png");
  });
}
