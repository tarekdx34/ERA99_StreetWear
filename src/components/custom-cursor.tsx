"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 1500, damping: 34, mass: 0.14 });
  const smoothY = useSpring(y, { stiffness: 1500, damping: 34, mass: 0.14 });
  const trailX = useSpring(x, { stiffness: 520, damping: 28, mass: 0.22 });
  const trailY = useSpring(y, { stiffness: 520, damping: 28, mass: 0.22 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(media.matches);

    const onChange = () => setEnabled(media.matches);
    media.addEventListener("change", onChange);

    const move = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("mousemove", move);

    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("mousemove", move);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[70] h-5 w-5 -translate-x-1/2 -translate-y-1/2 border border-ash/70"
        style={{ x: smoothX, y: smoothY }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[60] h-10 w-10 -translate-x-1/2 -translate-y-1/2 border border-ash/12"
        style={{ x: trailX, y: trailY }}
      />
    </>
  );
}
