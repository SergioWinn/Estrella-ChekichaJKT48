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
  const rightRef = useRef<HTMLDivElement | null>(null);
  const [leftHeight, setLeftHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    const syncHeight = () => {
      if (!mediaQuery.matches) {
        setLeftHeight(null);
        return;
      }

      setLeftHeight(rightRef.current?.offsetHeight ?? null);
    };

    syncHeight();

    const observer = new ResizeObserver(() => syncHeight());
    if (rightRef.current) {
      observer.observe(rightRef.current);
    }

    mediaQuery.addEventListener("change", syncHeight);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", syncHeight);
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr] xl:items-start">
      <div className="min-h-0" style={leftHeight ? { height: `${leftHeight}px` } : undefined}>
        {left}
      </div>
      <div ref={rightRef}>{right}</div>
    </section>
  );
}
