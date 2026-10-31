"use client";

/**
 * Purpose: rotating role line for the hero. Roles are stacked in one grid cell so the layout never shifts.
 * Rotation is disabled under prefers-reduced-motion (first role stays). Animated reveal is added in step 5.
 * Inputs: roles array. Used by: hero.
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RotatingRole({ roles }: { roles: readonly string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (roles.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % roles.length), 2800);
    return () => clearInterval(id);
  }, [roles.length]);

  return (
    <>
      <span className="sr-only">{roles.join(", ")}</span>
      <span className="inline-grid align-bottom" aria-hidden="true">
        {roles.map((role, i) => (
          <span
            key={role}
            className={cn(
              "text-gradient col-start-1 row-start-1 transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            {role}
          </span>
        ))}
      </span>
    </>
  );
}
