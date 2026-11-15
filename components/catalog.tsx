"use client";

import { createContext, useContext } from "react";
import { fallbackCatalog, setCatalog, type Catalog } from "@/lib/products";

const Ctx = createContext<Catalog>(fallbackCatalog);

/** Makes the live catalog available to everything below it (and to the cart helpers). */
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  setCatalog(catalog);
  return <Ctx value={catalog}>{children}</Ctx>;
}

export const useCatalog = () => useContext(Ctx);
