import { prisma } from "@/lib/prisma";
import { BotLink } from "./BotLink";
import { Check } from "lucide-react";

const PRODUCT_DESCRIPTIONS: Record<string, { description: string, features: string[] }> = {
    "Новый аккаунт ChatGPT Plus 1 месяц": {
        description: "Мы создадим новый аккаунт ChatGPT и сразу активируем подписку Plus на 1 месяц. Вы получаете полный доступ к аккаунту ChatGPT и привязанной почте.",
        features: [
            "Подписка ChatGPT Plus на месяц",
            "Персональный аккаунт - доступ только у вас",
            "Быстрая доставка - получите аккаунт за считанные минуты",
            "Оплата через СБП и карты МИР"
        ]
    },
    "Продление подписки ChatGPT Plus": {
        description: "Продлим подписку на вашем аккаунте. Для активации подписки потребуется логин и пароль для входа в аккаунт (сообщите данные от аккаунта менеджеру).",
        features: [
            "Продлевает подписку ChatGPT Plus на месяц",
            "Сохранение всей истории чатов на вашем аккаунте",
            "Быстрая активация",
            "Оплата через СБП и карты МИР"
        ]
    },
    "ChatGPT Business 1 месяц": {
        description: "Подключим ваш аккаунт ChatGPT к Business тарифу. Активация подписки не требует входа в аккаунт, доступ предоставляется по ссылке-приглашению.",
        features: [
            "Подписка ChatGPT Plus на месяц",
            "Доступ к модели Pro (есть лимиты)",
            "Быстрая активация",
            "Оплата через СБП и карты МИР"
        ]
    }
};

export async function ProductsSection() {
    const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
    });

    return (
        <section id="pricing" className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Тарифы</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Выберите подписку, которая подходит именно вам.
                        Мгновенная активация после оплаты.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-card border border-border rounded-3xl p-8 flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{Math.round(product.price)} ₽</span>
                                </div>
                            </div>

                            <div className="flex-grow mb-8">
                                <p className="text-muted-foreground mb-6 min-h-[80px]">
                                    {PRODUCT_DESCRIPTIONS[product.title]?.description || product.description}
                                </p>

                                <ul className="space-y-3">
                                    {(PRODUCT_DESCRIPTIONS[product.title]?.features || product.description.split('\n')).map((line, i) => (
                                        line.trim() && (
                                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                                <span>{line.trim().replace(/^[-•*]\s*/, '')}</span>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </div>

                            <BotLink className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center hover:opacity-90 transition-opacity">
                                Выбрать
                            </BotLink>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
