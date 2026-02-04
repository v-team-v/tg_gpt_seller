'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Key, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface TokenModalProps {
    token: string | null;
}

export function TokenModal({ token }: TokenModalProps) {
    const [copied, setCopied] = useState(false);

    if (!token) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Показать токен">
                    <Key className="h-4 w-4 text-orange-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Session Token</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="relative">
                        <Textarea
                            className="min-h-[200px] font-mono text-xs p-4 pr-12 break-all whitespace-pre-wrap"
                            value={token}
                            readOnly
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Скопируйте токен для использования при продлении подписки вручную.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
