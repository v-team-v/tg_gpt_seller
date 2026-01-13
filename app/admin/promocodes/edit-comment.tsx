'use client';

import { useState } from 'react';
import { updatePromoComment } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';

export function EditComment({ id, initialComment }: { id: number, initialComment: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [comment, setComment] = useState(initialComment);
    const [originalComment, setOriginalComment] = useState(initialComment);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await updatePromoComment(id, comment);
        setIsSaving(false);
        setOriginalComment(comment);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setComment(originalComment);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="h-8 text-sm w-full min-w-[150px]"
                    autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave} disabled={isSaving}>
                    <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="group flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded" onClick={() => setIsEditing(true)}>
            <span className={comment ? "" : "text-gray-400 italic text-sm"}>
                {comment || "Нет комментария"}
            </span>
            <Pencil className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
