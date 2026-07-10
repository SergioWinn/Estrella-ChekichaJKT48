"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export function MatchedHeightColumns({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr] items-stretch">
      <div className="min-h-0">{left}</div>
      <div className="min-h-0">{right}</div>
    </section>
  );
}
