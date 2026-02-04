import { LayoutGrid, CreditCard, Zap, Sparkles } from "lucide-react";

const features = [
    {
        icon: LayoutGrid,
        title: "1. Выберите план",
        description: "Выберите вариант подключения, который вам больше всего подходит - продление подписки или получение нового аккаунта.",
    },
    {
        icon: CreditCard,
        title: "2. Оплатите подписку",
        description: "Оплатите подписку следуя инструкции при оформлении заказа. Оплатить услугу можно как картой РФ, так и по QR коду через СБП.",
    },
    {
        icon: Zap,
        title: "3. Активация подписки",
        description: "Сообщите менеджеру номер заказа после оплаты. Мы активируем подписку за считанные минуты.",
    },
    {
        icon: Sparkles,
        title: "4. Наслаждайтесь подпиской ChatGPT Plus",
        description: "Получите полный доступ к ChatGPT Plus на месяц.",
    },
];

export function BuyActivation() {
    return (
        <section id="activation" className="py-20 relative overflow-hidden bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Как получить подписку</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:bg-card hover:border-border transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
