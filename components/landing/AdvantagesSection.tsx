import { Zap, ShieldCheck, MessageCircle, Globe } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Мгновенная работа",
        description: "Никаких очередей и ожиданий. OpenAI предоставляет приоритетный доступ к серверам для Plus подписчиков.",
    },
    {
        icon: Globe,
        title: "Без VPN",
        description: "Наш бот работает напрямую в Telegram. Вам не нужно включать VPN или искать иностранные карты.",
    },
    {
        icon: ShieldCheck,
        title: "Гарантия качества",
        description: "Мы используем официальный API OpenAI. Вы получаете оригинальный ChatGPT, а не урезанную версию.",
    },
    {
        icon: MessageCircle,
        title: "Поддержка 24/7",
        description: "Наша команда всегда на связи и готова помочь с любыми вопросами по использованию сервиса.",
    },
];

export function AdvantagesSection() {
    return (
        <section id="features" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-4">
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
