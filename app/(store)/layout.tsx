import { CatalogProvider } from "@/components/catalog";
import { CartDrawer, FlyLayer, Footer, Header, StoreHydrator, Toast } from "@/components/store/chrome";
import { loadCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const catalog = await loadCatalog();
  return (
    <CatalogProvider catalog={catalog}>
      <StoreHydrator />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-card">
        Skip to content
      </a>
      <Header />
      <main id="main" className="px-3 pt-[78px] sm:px-4">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <FlyLayer />
      <Toast />
    </CatalogProvider>
  );
}
