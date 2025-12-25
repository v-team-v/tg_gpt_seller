import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { prisma } from '@/lib/prisma';
import { updateSettings } from '@/app/actions/settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const settings = await prisma.settings.findMany();

    // Helper to get value
    const getVal = (key: string) => settings.find(s => s.key === key)?.value;

    const isManualMode = getVal('manual_mode') === 'true';
    const offlineMessage = getVal('offline_message') || 'Здравствуйте! Сейчас я офлайн. Оставьте ваш вопрос, я отвечу вам утром.';

    const startDescription = getVal('start_description') || 'Добро пожаловать в магазин ChatGPT Plus! Здесь вы можете купить подписку...';
    const welcomeMessage = getVal('welcome_message') || 'Привет! Я бот для покупки подписок.';
    const activationInfo = getVal('activation_info') || '1. Оплатите заказ...\n2. Получите код...';
    const rulesUrl = getVal('rules_url') || 'https://google.com';
    const rulesText = getVal('rules_text') || ''; // Default handled in RulesPage logic if empty
    const supportUrl = getVal('support_url') || 'https://t.me/username';

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10">
            <h2 className="text-3xl font-bold tracking-tight">Настройки</h2>

            <form action={updateSettings} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Контакты и Ссылки</CardTitle>
                        <CardDescription>Настройте внешние ссылки.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="support_url">Ссылка на Поддержку</Label>
                            <p className="text-xs text-muted-foreground">Ссылка на аккаунт менеджера или чат (например: https://t.me/my_support).</p>
                            <Input id="support_url" name="support_url" defaultValue={supportUrl} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="rules_url">Ссылка на правила</Label>
                            <p className="text-xs text-muted-foreground">Ссылка, которая открывается по кнопке "Правила" в профиле.</p>
                            <Input id="rules_url" name="rules_url" defaultValue={rulesUrl} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="rules_text">Текст правил (Markdown)</Label>
                            <p className="text-xs text-muted-foreground">Полный текст страницы /rules. Поддерживает заголовки (###), списки (*), жирный (**).</p>
                            <Textarea id="rules_text" name="rules_text" defaultValue={rulesText} rows={10} className="font-mono text-sm" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Тексты Бота</CardTitle>
                        <CardDescription>Настройте сообщения, которые видит пользователь.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="start_description">Описание (До старта)</Label>
                            <p className="text-xs text-muted-foreground">Текст, который виден на пустом экране чата до нажатия кнопки Start.</p>
                            <Textarea id="start_description" name="start_description" defaultValue={startDescription} rows={3} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="welcome_message">Приветствие (После старта)</Label>
                            <p className="text-xs text-muted-foreground">Первое сообщение, которое приходит после нажатия /start.</p>
                            <Textarea id="welcome_message" name="welcome_message" defaultValue={welcomeMessage} rows={4} />

                            <Label htmlFor="welcome_image" className="mt-2 text-sm">Фото приветствия (Опционально)</Label>
                            <Input id="welcome_image" name="welcome_image" type="file" accept="image/*" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="activation_info">Как происходит активация</Label>
                            <p className="text-xs text-muted-foreground">Текст для раздела "Как происходит активация".</p>
                            <Textarea id="activation_info" name="activation_info" defaultValue={activationInfo} rows={6} />

                            <Label htmlFor="activation_image" className="mt-2 text-sm">Фото инструкции (Опционально)</Label>
                            <Input id="activation_image" name="activation_image" type="file" accept="image/*" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg">Сохранить все настройки</Button>
                </div>
            </form>
        </div>
    );
}
