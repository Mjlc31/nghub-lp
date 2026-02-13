import React from 'react';
import { Key, Target, Shield } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { WeaponCard } from '../ui/WeaponCard';

interface ArsenalProps {
    colors: { primary: string };
}

export const Arsenal: React.FC<ArsenalProps> = ({ colors }) => (
    <section id="arsenal" className="py-24 md:py-40 bg-[#050505] relative z-20">
        <div className="max-w-7xl mx-auto px-6">
            <SectionHeading
                title="O Arsenal"
                subtitle="Não vendemos features. Entregamos vantagem competitiva injusta."
                primaryColor={colors.primary}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <WeaponCard
                    icon={<Key size={32} strokeWidth={1} />}
                    title="Acesso"
                    description="Networking não é trocar cartão de visita. É ter o WhatsApp de quem resolve o seu problema em 5 minutos. Conexão direta com quem fatura múltiplos 7 dígitos."
                    primaryColor={colors.primary}
                />
                <WeaponCard
                    icon={<Target size={32} strokeWidth={1} />}
                    title="A Trincheira"
                    description="Esqueça a teoria de palco. Aqui compartilhamos o 'Campo de Batalha'. Estratégias de escala, gestão e vendas que nenhuma faculdade de administração vai te ensinar."
                    primaryColor={colors.primary}
                />
                <WeaponCard
                    icon={<Shield size={32} strokeWidth={1} />}
                    title="O Ambiente"
                    description="Eventos que separam os meninos dos homens. Jantares, viagens e experiências desenhadas para elevar seu padrão de merecimento e sua régua de qualidade."
                    primaryColor={colors.primary}
                />
            </div>
        </div>
    </section>
);
