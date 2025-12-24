import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { prisma } from '@/lib/prisma';
import { updateSettings } from '@/app/actions/settings';

export default async function SettingsPage() {
    const manualModeSetting = await prisma.settings.findUnique({ where: { key: 'manual_mode' } });
    const offlineMessageSetting = await prisma.settings.findUnique({ where: { key: 'offline_message' } });

    const isManualMode = manualModeSetting?.value === 'true';
    const offlineMessage = offlineMessageSetting?.value || 'Здравствуйте! Сейчас я офлайн. Оставьте ваш вопрос, я отвечу вам утром.';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Настройки</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Режим работы</CardTitle>
                    <CardDescription>Управляйте статусом "Онлайн/Офлайн" для бота.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateSettings} className="space-y-6">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Ручной режим (Онлайн)</Label>
                                <p className="text-sm text-muted-foreground">
                                    Если включено, бот будет пересылать сообщения вам. Если выключено — отправлять авто-ответ "Офлайн".
                                </p>
                            </div>
                            {/* Switch in form needs a hidden input or client component handling. 
                    Using a simple checkbox logic for server action simplicity for now, 
                    OR native switch with 'name'. Shadcn Switch is a radix primitive, doesn't always expose native input.
                    Let's use a native checkbox styled or a wrapper. 
                    Actually Shadcn Switch accepts 'name' prop usually, but checks 'checked'.
                    Cleaner is to use a Client Component for the form, but let's try a simple trick with hidden input.
                */}
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" name="manual_mode" defaultChecked={isManualMode} className="w-5 h-5 accent-primary" />
                                <span>Включено</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="offline_message">Сообщение для режима Офлайн</Label>
                            <Textarea
                                id="offline_message"
                                name="offline_message"
                                defaultValue={offlineMessage}
                                rows={4}
                            />
                        </div>

                        <Button type="submit">Сохранить изменения</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
