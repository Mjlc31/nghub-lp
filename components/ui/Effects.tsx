import React from 'react';

export const GlobalEffects = () => (
    <>
        {/* CSS Noise Overlay defined in index.html */}
        <div className="bg-noise" />
        {/* CSS Vignette Overlay defined in index.html */}
        <div className="vignette-overlay" />
    </>
);

export const AmbientLight = ({ primaryColor }: { primaryColor: string }) => (
    <div className="absolute top-0 left-0 right-0 h-[100vh] overflow-hidden pointer-events-none z-0">
        <div
            className="absolute top-[-20%] left-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[100px] md:blur-[150px]"
            style={{ backgroundColor: primaryColor, opacity: 0.05 }}
        />
        <div className="absolute top-[20%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-900/10 rounded-full blur-[100px] md:blur-[150px]" />
    </div>
);
