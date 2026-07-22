"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

type MobileNavCtx = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  hasSidebar: boolean;
};

const Ctx = createContext<MobileNavCtx>({
  open: false,
  toggle: () => {},
  close: () => {},
  hasSidebar: false,
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hasSidebar = pathname.startsWith("/tools") || pathname === "/converter";

  // Close the drawer whenever the route changes. Adjusting state during render
  // (rather than in an effect) lets React discard this render and redo it
  // before committing, so the drawer never paints open on the new route.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Toggle a class on <body> so CSS can offset content for the fixed sidebar.
  // Using a class (not inline style) lets media queries scale the offset
  // responsively — 240px desktop, 200px tablet, 0 mobile drawer.
  useEffect(() => {
    document.body.classList.toggle("sidebar-visible", hasSidebar);
    return () => document.body.classList.remove("sidebar-visible");
  }, [hasSidebar]);

  // Stable identity — this provider wraps the whole app, so a fresh object on
  // every render would re-render every consumer of the context.
  const toggle = useCallback(() => setOpen(v => !v), []);
  const close  = useCallback(() => setOpen(false), []);
  const value  = useMemo(
    () => ({ open, toggle, close, hasSidebar }),
    [open, toggle, close, hasSidebar],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMobileNav() {
  return useContext(Ctx);
}
