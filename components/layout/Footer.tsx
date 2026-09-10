import React from 'react';
import { Footer as SectionFooter, ParallaxQuote as SectionParallaxQuote } from '../sections/Footer';

export const Footer: React.FC = () => <SectionFooter />;
export const ParallaxQuote: typeof SectionParallaxQuote = SectionParallaxQuote;
export default Footer;
