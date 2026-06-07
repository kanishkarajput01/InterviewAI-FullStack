"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade-up" | "fade-in";
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  variant = "fade-up",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(visible && `animate-${variant}`, className)}
      style={{ animationDelay: `${delay}ms`, opacity: visible ? undefined : 0 }}
    >
      {children}
    </div>
  );
}
