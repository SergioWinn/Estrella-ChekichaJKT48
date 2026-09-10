"use client";

import { useEffect } from "react";

export function OverviewScrollController() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-archive-experience]");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const acts = Array.from(root.querySelectorAll<HTMLElement>("[data-archive-act]"));
    let frame = 0;

    const paint = () => {
      frame = 0;
      const viewport = window.innerHeight;

      for (const act of acts) {
        const rect = act.getBoundingClientRect();
        const travel = Math.max(rect.height - viewport, 1);
        const progress = Math.min(1, Math.max(0, -rect.top / travel));
        act.style.setProperty("--archive-p", progress.toFixed(4));

        if (act.classList.contains("archive-teams")) {
          const aperture = progress < 0.3 ? progress / 0.3 : progress < 0.78 ? 1 : 1 - (progress - 0.78) / 0.22;
          act.style.setProperty("--archive-open", Math.max(0, aperture).toFixed(4));
          act.dataset.archiveVerifyState = `${Math.round(aperture * 100)}`;
        }

        if (act.dataset.archiveFocus) {
          act.dataset.active = String(Math.min(3, Math.floor(progress * 4)));
        }
      }
    };

    const requestPaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
    };
  }, []);

  return null;
}
