
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";

export const dynamic = 'force-dynamic';

export default function TestFullPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <HeroSection />
            </main>
            <Footer />
        </div>
    );
}
