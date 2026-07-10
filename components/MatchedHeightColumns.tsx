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
  const [leftHeight, setLeftHeight] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    const syncHeight = () => {
      if (!mediaQuery.matches) {
        setLeftHeight(undefined);
        return;
      }

      const nextHeight = rightRef.current ? `${Math.ceil(rightRef.current.getBoundingClientRect().height)}px` : undefined;
      setLeftHeight(nextHeight);
    };

    syncHeight();

    const resizeObserver = rightRef.current ? new ResizeObserver(syncHeight) : null;
    if (rightRef.current && resizeObserver) {
      resizeObserver.observe(rightRef.current);
    }

    mediaQuery.addEventListener("change", syncHeight);
    window.addEventListener("resize", syncHeight);

    return () => {
      resizeObserver?.disconnect();
      mediaQuery.removeEventListener("change", syncHeight);
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr] items-start">
      <div className="min-h-0" style={leftHeight ? { height: leftHeight } : undefined}>{left}</div>
      <div ref={rightRef} className="min-h-0">{right}</div>
    </section>
  );
}
