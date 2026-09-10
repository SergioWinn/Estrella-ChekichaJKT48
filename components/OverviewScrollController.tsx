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

        if (act.classList.contains("archive-opening")) {
          const camera = progress * progress * (3 - 2 * progress);
          act.style.setProperty("--archive-camera", camera.toFixed(4));
        }

        if (act.classList.contains("archive-teams")) {
          const aperture = Math.min(1, progress / 0.3);
          const panels = progress < 0.15 ? progress / 0.15 : progress < 0.82 ? 1 : Math.max(0, 1 - (progress - 0.82) / 0.1);
          const total = progress < 0.92 ? 0 : Math.min(1, (progress - 0.92) / 0.08);
          act.style.setProperty("--archive-open", aperture.toFixed(4));
          act.style.setProperty("--archive-panels", panels.toFixed(4));
          act.style.setProperty("--archive-total", total.toFixed(4));
          act.dataset.archiveVerifyState = `${Math.round(aperture * 100)}:${Math.round(panels * 100)}:${Math.round(total * 100)}`;
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
