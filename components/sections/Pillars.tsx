import React from 'react';
import { BentoGrid, BentoGridProps } from './BentoGrid';

export interface Pillar {
  title: string;
  description: string;
}

export interface PillarsProps extends BentoGridProps {
  pillars?: Pillar[];
}

/**
 * @deprecated Merged into BentoGrid (Feature 10). Re-exported for backwards compatibility.
 */
export const Pillars: React.FC<PillarsProps> = (props) => <BentoGrid {...props} />;
export default Pillars;
