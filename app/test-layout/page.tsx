
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export const dynamic = 'force-dynamic';

export default function TestLayoutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-20">
                <h1 className="text-2xl font-bold">Test Layout</h1>
                <p>Testing Header and Footer impact.</p>
            </div>
            <Footer />
        </div>
    );
}
