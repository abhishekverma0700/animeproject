"use client";

import React, { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function CountUp({
  end,
  decimals = 0,
  duration = 1.2,
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * end;
      setVal(Number(current.toFixed(decimals)));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setVal(end);
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [end, decimals, duration]);

  return (
    <span>
      {prefix}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
