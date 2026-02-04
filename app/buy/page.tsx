import { prisma } from '@/lib/prisma';
import { BuyProductCard } from './components/BuyProductCard';
import { BuyHeader } from './components/BuyHeader';
import { BuyHero } from './components/BuyHero';
import { BuyActivation } from './components/BuyActivation';
import { QuestionsSection } from '@/components/landing/QuestionsSection';
import { BuyFooter } from './components/BuyFooter';
import { PRODUCT_DATA } from './data';

export const dynamic = 'force-dynamic';

export default async function BuyPage() {
    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            isShowBuyPage: true
        },
        orderBy: {
            sortOrder: 'asc'
        }
    });

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <BuyHeader />

            <main className="flex-1">
                <BuyHero />
                <BuyActivation />

                <section id="products" className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Подписки</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Выберите подписку, которая подходит именно вам.
                                Мгновенная активация после оплаты.
                            </p>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-lg border">
                                <p className="text-muted-foreground text-lg">
                                    Нет доступных тарифов для отображения.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                                {products.map((product) => (
                                    <div key={product.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-md">
                                        <BuyProductCard
                                            product={product}
                                            productData={PRODUCT_DATA[product.title]}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <QuestionsSection />
            </main>

            <BuyFooter />
        </div>
    );
}
