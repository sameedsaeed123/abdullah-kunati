import { CartDrawer, FlyLayer, Footer, Header, StoreHydrator, Toast } from "@/components/store/chrome";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
