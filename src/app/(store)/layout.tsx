import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-page-bg">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
