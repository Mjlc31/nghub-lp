import React from 'react';
import { BentoGrid, BentoGridProps } from './BentoGrid';

export type ArsenalProps = BentoGridProps;

/**
 * @deprecated Merged into BentoGrid (Feature 10). Re-exported for backwards compatibility.
 */
export const Arsenal: React.FC<ArsenalProps> = (props) => <BentoGrid {...props} id="arsenal" />;
export default Arsenal;
