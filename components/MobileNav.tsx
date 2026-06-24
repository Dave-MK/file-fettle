"use client";

import { createContext, useContext, useState, useEffect } from "react";
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

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Toggle a class on <body> so CSS can offset content for the fixed sidebar.
  // Using a class (not inline style) lets media queries scale the offset
  // responsively — 240px desktop, 200px tablet, 0 mobile drawer.
  useEffect(() => {
    document.body.classList.toggle("sidebar-visible", hasSidebar);
    return () => document.body.classList.remove("sidebar-visible");
  }, [hasSidebar]);

  return (
    <Ctx.Provider
      value={{
        open,
        toggle: () => setOpen(v => !v),
        close: () => setOpen(false),
        hasSidebar,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useMobileNav() {
  return useContext(Ctx);
}
