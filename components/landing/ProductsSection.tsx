import { prisma } from "@/lib/prisma";
import { BotLink } from "./BotLink";
import { Check } from "lucide-react";
import { ProductCardClient } from "./ProductCardClient";

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
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Подписки</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Выберите подписку, которая подходит именно вам.
                        Мгновенная активация после оплаты.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {products.map((product) => (
                        <ProductCardClient
                            key={product.id}
                            product={product}
                            enrichedDescription={PRODUCT_DESCRIPTIONS[product.title]?.description}
                            features={PRODUCT_DESCRIPTIONS[product.title]?.features}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
