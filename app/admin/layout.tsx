import Link from 'next/link';
import { Home, Package, ShoppingCart, Settings, Users, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
            <div className="hidden border-r bg-white w-64 md:block dark:bg-slate-950/50">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <span className="">GPT Shop Admin</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-2">
                        <NavItem href="/admin" icon={<Home className="h-4 w-4" />} label="Дашборд" />
                        <NavItem href="/admin/products" icon={<Package className="h-4 w-4" />} label="Товары" />
                        <NavItem href="/admin/orders" icon={<ShoppingCart className="h-4 w-4" />} label="Заказы" />
                        <NavItem href="/admin/users" icon={<Users className="h-4 w-4" />} label="Пользователи" />
                        <NavItem href="/admin/promocodes" icon={<Ticket className="h-4 w-4" />} label="Промокоды" />
                        <NavItem href="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Настройки" />
                    </nav>
                </div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 dark:bg-slate-950/50">
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                {/* Search or Title placeholder */}
                                <h1 className="text-lg font-medium">Панель Управления</h1>
                            </div>
                        </form>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Users className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50",
            )}
        >
            {icon}
            {label}
        </Link>
    );
}
