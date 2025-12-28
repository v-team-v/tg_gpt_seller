import { MessageCircleQuestion, ArrowRight } from "lucide-react";

export function QuestionsSection() {
    return (
        <section id="faq" className="py-12 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto bg-muted/30 border border-border rounded-3xl p-6 md:p-8 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <MessageCircleQuestion size={24} />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Остались вопросы?</h2>
                    <p className="text-base text-muted-foreground mb-6 max-w-xl mx-auto">
                        Если у вас возникли трудности с оплатой или выбором тарифа, напишите нам.
                        Мы на связи и готовы помочь!
                    </p>

                    <a
                        href="https://t.me/manager_gptsub"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium items-center gap-2 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                    >
                        Задать вопрос
                        <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
}
