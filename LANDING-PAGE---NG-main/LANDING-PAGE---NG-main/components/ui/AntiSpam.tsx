import React, { useState, useRef, useEffect } from 'react';

interface HoneypotFieldProps {
    value: string;
    onChange: (value: string) => void;
}

export const HoneypotField: React.FC<HoneypotFieldProps> = ({ value, onChange }) => {
    return (
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

interface RateLimiterProps {
    children: (canSubmit: boolean, timeLeft: number) => React.ReactNode;
    cooldownSeconds?: number;
}

export const RateLimiter: React.FC<RateLimiterProps> = ({ children, cooldownSeconds = 60 }) => {
    const [canSubmit, setCanSubmit] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const lastSubmitTime = useRef<number>(0);

    useEffect(() => {
        const stored = localStorage.getItem('last_form_submit');
        if (stored) {
            const elapsed = Date.now() - parseInt(stored);
            if (elapsed < cooldownSeconds * 1000) {
                setCanSubmit(false);
                setTimeLeft(Math.ceil((cooldownSeconds * 1000 - elapsed) / 1000));
            }
        }
    }, [cooldownSeconds]);

    useEffect(() => {
        if (!canSubmit && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setCanSubmit(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [canSubmit, timeLeft]);

    const recordSubmit = () => {
        const now = Date.now();
        lastSubmitTime.current = now;
        localStorage.setItem('last_form_submit', now.toString());
        setCanSubmit(false);
        setTimeLeft(cooldownSeconds);
    };

    return <>{children(canSubmit, timeLeft)}</>;
};
