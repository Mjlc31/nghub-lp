import { useEffect } from 'react';
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;

export const useAnalytics = () => {
    useEffect(() => {
        if (GA_MEASUREMENT_ID && !isInitialized) {
            ReactGA.initialize(GA_MEASUREMENT_ID);
            isInitialized = true;
            console.log('Analytics initialized');
        }
    }, []);

    const trackEvent = (category: string, action: string, label?: string, value?: number) => {
        if (!GA_MEASUREMENT_ID) return;

        ReactGA.event({
            category,
            action,
            label,
            value,
        });
    };

    const trackPageView = (path: string) => {
        if (!GA_MEASUREMENT_ID) return;
        ReactGA.send({ hitType: 'pageview', page: path });
    };

    return { trackEvent, trackPageView };
};

// Predefined events for easy tracking
export const AnalyticsEvents = {
    FORM_START: { category: 'Form', action: 'start' },
    FORM_SUBMIT: { category: 'Form', action: 'submit' },
    FORM_SUCCESS: { category: 'Form', action: 'success' },
    FORM_ERROR: { category: 'Form', action: 'error' },
    MANIFESTO_OPEN: { category: 'Engagement', action: 'manifesto_open' },
    MANIFESTO_CLOSE: { category: 'Engagement', action: 'manifesto_close' },
    CTA_CLICK: { category: 'Engagement', action: 'cta_click' },
    MENU_OPEN: { category: 'Navigation', action: 'menu_open' },
};
