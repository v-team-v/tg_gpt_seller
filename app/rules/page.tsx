import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export const dynamic = 'force-dynamic';

const DEFAULT_RULES = `
### 1. Общие положения
1.1. Настоящий документ является официальным предложением (публичной офертой) Сервиса (далее — «Исполнитель») и содержит все существенные условия предоставления услуг по содействию в оплате и активации цифровых подписок.
1.2. Акцептом (принятием) настоящей оферты считается совершение Пользователем действий по оплате услуг Сервиса.

### 2. Предмет соглашения
2.1. Исполнитель обязуется по поручению Пользователя совершить действия, направленные на оплату и активацию подписки на сервис ChatGPT (OpenAI), а Пользователь обязуется оплатить эти услуги.
2.2. Исполнитель не является владельцем сервиса ChatGPT, не имеет отношения к компании OpenAI и выступает исключительно в роли посредника (агента) по осуществлению платежа.

### 3. Порядок оказания услуг
3.1. Услуга считается оказанной в момент успешной активации подписки на аккаунте Пользователя или предоставления Пользователю данных для доступа к оплаченному ресурсу.
3.2. Срок выполнения заказа составляет от 5 до 60 минут в рабочее время после предоставления Пользователем всех необходимых данных (логин/пароль или иные данные, требуемые для входа).
3.3. Пользователь обязан предоставить корректные данные для входа. Исполнитель не несет ответственности за задержки, вызванные неверно указанными данными.

### 4. Оплата и безопасность
4.1. Оплата производится через платежные методы, доступные в интерфейсе Бота/Сайта.
4.2. Исполнитель гарантирует, что данные карты или иные платежные реквизиты Пользователя не хранятся на серверах Исполнителя и обрабатываются защищенными платежными шлюзами.

### 5. Политика возврата средств
5.1. **Полный возврат средств** осуществляется в случае, если услуга не была оказана по вине Исполнителя (например, техническая невозможность произвести оплату).
5.2. Возврат средств **не производится**, если:
* Подписка была успешно активирована.
* Пользователь нарушил правила использования сервиса OpenAI, что привело к блокировке аккаунта.
* Пользователь передумал после начала фактического исполнения заказа.
5.3. Срок рассмотрения заявки на возврат — 3 рабочих дня.

### 6. Политика конфиденциальности
6.1. Для выполнения заказа Исполнитель может запрашивать данные для входа в аккаунт (логин, пароль).
6.2. **Гарантия безопасности:** Исполнитель обязуется не передавать данные аккаунта третьим лицам, не менять пароли без ведома Пользователя и не использовать аккаунт в личных целях. После выполнения заказа Пользователю настоятельно рекомендуется сменить пароль.

### 7. Ограничение ответственности
7.1. Исполнитель не несет ответственности за работу сервиса ChatGPT, возможные сбои на стороне OpenAI, а также за блокировки аккаунтов, вызванные нарушением Пользователем правил OpenAI.
7.2. Услуга предоставляется по принципу «как есть».
`;

export default async function RulesPage() {
    const settings = await prisma.settings.findUnique({
        where: { key: 'rules_text' },
    });

    const content = settings?.value || DEFAULT_RULES;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="text-center border-b bg-white rounded-t-xl pb-8">
                        <CardTitle className="text-3xl font-bold text-gray-900">Пользовательское соглашение (Оферта)</CardTitle>
                        <p className="text-sm text-gray-500 mt-2">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <ReactMarkdown
                            remarkPlugins={[remarkBreaks]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-5" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4" {...props} />,
                                p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700 block" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-gray-700 block" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                                a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600" {...props} />,
                            }}
                        >
                            {content}
                        </ReactMarkdown>

                        <div className="mt-12 pt-8 border-t text-sm text-gray-500 text-center">
                            <p>Используя данный сервис, вы автоматически принимаете условия данной оферты.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
