import { prisma } from '@/lib/prisma';
import { updateProduct } from '@/app/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return <div>Некорректный ID товара</div>;
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
        return <div>Товар не найден</div>;
    }

    const updateProductWithId = updateProduct.bind(null, id);

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Редактировать товар</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Информация о товаре</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateProductWithId} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Название</Label>
                            <Input id="title" name="title" defaultValue={product.title} required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Описание</Label>
                            <Textarea id="description" name="description" defaultValue={product.description} rows={5} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Цена (₽)</Label>
                                <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} required />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">Тип</Label>
                                <Select name="type" defaultValue={product.type}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SUBSCRIPTION">Подписка</SelectItem>
                                        <SelectItem value="ACCOUNT">Аккаунт</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="text-sm font-medium">Настройки видимости</h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isShowLanding"
                                        name="isShowLanding"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        defaultChecked={product.isShowLanding}
                                    />
                                    <Label htmlFor="isShowLanding" className="font-normal cursor-pointer">На Лендинге</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isShowBot"
                                        name="isShowBot"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        defaultChecked={product.isShowBot}
                                    />
                                    <Label htmlFor="isShowBot" className="font-normal cursor-pointer">В Боте</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isShowBuyPage"
                                        name="isShowBuyPage"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        defaultChecked={product.isShowBuyPage}
                                    />
                                    <Label htmlFor="isShowBuyPage" className="font-normal cursor-pointer">На /buy</Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image">Изображение</Label>
                            {product.imageUrl && (
                                <div className="mb-2">
                                    <Image src={product.imageUrl} alt="Current" width={100} height={100} className="rounded-md object-cover" />
                                </div>
                            )}
                            <Input id="image" name="image" type="file" accept="image/*" />
                            <p className="text-xs text-muted-foreground">Загрузите новое изображение для замены.</p>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="submit">Сохранить изменения</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
