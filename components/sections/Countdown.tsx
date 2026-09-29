import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: string): TimeLeft => {
  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-xl backdrop-blur-sm">
        <span className="text-2xl md:text-3xl font-mono font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
    </div>
    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-3 font-mono">
      {label}
    </span>
  </div>
);

export const Countdown: React.FC = () => {
  const { config } = useSiteConfig();
  const eventIsoDate = config.event?.isoDate;
  const eventDate = config.event?.date || '12 de Novembro';
  const eventVenue = config.event?.venue || 'Divina Gula';
  const eventLocation = config.event?.location || 'Maceió, AL';
  const eventSeats = config.event?.seats || 60;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(eventIsoDate || '2026-11-12T19:00:00-03:00')
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventIsoDate || '2026-11-12T19:00:00-03:00'));
    }, 1000);

    return () => clearInterval(timer);
  }, [eventIsoDate]);

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) return null;

  return (
    <section className="py-20 md:py-28 bg-[#060709] relative z-10 border-t border-white/[0.08] overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E5C579]/[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5C579]/20 bg-[#E5C579]/5 mb-8">
            <Clock size={12} className="text-[#E5C579]" />
            <span className="text-[11px] font-mono tracking-widest text-[#E5C579] uppercase">
              Próximo Evento
            </span>
          </div>

          {/* Event Title */}
          <h2 className="text-2xl md:text-4xl font-serif text-white mb-3 tracking-tight">
            {eventDate} — <span className="italic text-[#E5C579]">{eventVenue}</span>
          </h2>
          <p className="text-zinc-500 text-sm font-light mb-10">
            {eventLocation} · Apenas {eventSeats} cadeiras
          </p>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-12">
            <CountdownUnit value={timeLeft.days} label="Dias" />
            <span className="text-zinc-600 text-xl font-light mt-[-1.5rem]">:</span>
            <CountdownUnit value={timeLeft.hours} label="Horas" />
            <span className="text-zinc-600 text-xl font-light mt-[-1.5rem]">:</span>
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <span className="text-zinc-600 text-xl font-light mt-[-1.5rem]">:</span>
            <CountdownUnit value={timeLeft.seconds} label="Seg" />
          </div>

          {/* CTA */}
          <a
            href="#apply"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-sans text-xs md:text-sm uppercase tracking-[0.18em] font-semibold text-[#060709] bg-[#E5C579] hover:shadow-[0_0_40px_rgba(229,197,121,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <span>Garantir minha Cadeira</span>
            <ArrowRight size={15} />
          </a>
        </m.div>
      </div>
    </section>
  );
};

export default Countdown;
