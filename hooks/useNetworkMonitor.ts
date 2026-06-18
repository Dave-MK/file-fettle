"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface NetworkStats {
  externalRequests: number;
  externalBytes:    number;
}

const TRUSTED = ["localhost", "127.0.0.1", "unpkg.com"]; // unpkg = FFmpeg WASM CDN (disclosed)

function isTrusted(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return TRUSTED.some(t => host === t || host.endsWith("." + t));
  } catch {
    return true; // relative URLs are local
  }
}

export function useNetworkMonitor(active: boolean) {
  const [stats, setStats]   = useState<NetworkStats>({ externalRequests: 0, externalBytes: 0 });
  const originalFetch       = useRef<typeof fetch | null>(null);
  const originalXHROpen     = useRef<typeof XMLHttpRequest.prototype.open | null>(null);

  // Reset synchronously before the patching effect fires, so the counter
  // starts at zero the moment monitoring becomes active.
  useLayoutEffect(() => {
    if (active) setStats({ externalRequests: 0, externalBytes: 0 });
  }, [active]);

  useEffect(() => {
    if (!active) return;

    // Patch fetch
    originalFetch.current = window.fetch;
    window.fetch = async function patchedFetch(input, init) {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      if (!isTrusted(url)) {
        setStats(s => ({ externalRequests: s.externalRequests + 1, externalBytes: s.externalBytes }));
      }
      return originalFetch.current!(input, init);
    };

    // Patch XHR
    originalXHROpen.current = XMLHttpRequest.prototype.open;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (XMLHttpRequest.prototype as any).open = function patchedOpen(
      method: string,
      url: string | URL,
      async = true,
      username?: string | null,
      password?: string | null
    ) {
      const urlStr = String(url);
      if (!isTrusted(urlStr)) {
        setStats(s => ({ externalRequests: s.externalRequests + 1, externalBytes: s.externalBytes }));
      }
      return originalXHROpen.current!.call(this, method, url, async, username, password);
    };

    return () => {
      if (originalFetch.current)   window.fetch = originalFetch.current;
      if (originalXHROpen.current) XMLHttpRequest.prototype.open = originalXHROpen.current;
    };
  }, [active]);

  return stats;
}
