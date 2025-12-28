import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductsSection } from "@/components/landing/ProductsSection";
import { AdvantagesSection } from "@/components/landing/AdvantagesSection";
import { QuestionsSection } from "@/components/landing/QuestionsSection";
import { Footer } from "@/components/landing/Footer";

export const revalidate = 60;

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main>
        <HeroSection />
        <AdvantagesSection />
        <ProductsSection />
        <QuestionsSection />
      </main>
      <Footer />
    </div>
  );
}
