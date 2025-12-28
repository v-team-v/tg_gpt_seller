
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ProductsSection } from "@/components/landing/ProductsSection";

export const dynamic = 'force-dynamic';

export default function TestProductsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="py-20">
                <h1 className="text-center text-2xl font-bold mb-10">Test Products</h1>
                <ProductsSection />
            </div>
            <Footer />
        </div>
    );
}
