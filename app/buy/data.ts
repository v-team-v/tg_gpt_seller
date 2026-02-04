export interface ProductData {
    displayTitle?: string;
    description: string;
    features: string[];
    requiresToken: boolean;
}

export const PRODUCT_DATA: Record<string, ProductData> = {
    "Новый аккаунт ChatGPT с подпиской Plus ": {
        description: "Мы создадим новый аккаунт ChatGPT и сразу активируем подписку Plus на 1 месяц. Вы получаете полный доступ к аккаунту ChatGPT и привязанной почте.",
        features: [
            "Подписка ChatGPT Plus на месяц",
            "Персональный аккаунт - доступ только у вас",
            "Быстрая доставка - получите аккаунт за считанные минуты",
            "Оплата через СБП и карты МИР"
        ],
        requiresToken: false
    },
    "Продление подписки Plus (без входа в аккаунт)": {
        description: "Продлим подписку ChatGPT Plus на вашем аккаунте без входа.\nСледуйте инструкции при оформлении заказа.\nПосле оплаты сообщите номер заказа менеджеру.",
        features: [
            "Подписка ChatGPT Plus на вашем аккаунте",
            "Сохранение всей истории чатов на вашем аккаунте",
            "Быстрая активация",
            "Оплата через СБП и карты МИР"
        ],
        requiresToken: true
    }
};
