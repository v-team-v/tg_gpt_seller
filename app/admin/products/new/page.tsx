import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProduct } from '@/app/actions/products';

export default function NewProductPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Новый товар</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createProduct} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Название</Label>
                            <Input id="title" name="title" placeholder="ChatGPT Plus 1 месяц" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Описание</Label>
                            <Textarea id="description" name="description" placeholder="Описание товара..." required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Цена (RUB)</Label>
                                <Input id="price" name="price" type="number" step="0.01" placeholder="2990" required />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">Тип товара</Label>
                                <div className="relative">
                                    <select
                                        name="type"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="SUBSCRIPTION">Подписка</option>
                                        <option value="ACCOUNT">Аккаунт</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image">Изображение</Label>
                            <Input id="image" name="image" type="file" accept="image/*" />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full">Создать товар</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
