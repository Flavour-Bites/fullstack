import { useEffect } from "react";

const BASE = "Flavour Bites | Custom Cake Studio";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Flavour Bites` : BASE;
    return () => { document.title = BASE; };
  }, [title]);
}
