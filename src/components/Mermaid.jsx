import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit'
});

const Mermaid = ({ chart }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && chart) {
            mermaid.contentLoaded();
            const renderId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

            try {
                mermaid.render(renderId, chart).then(({ svg }) => {
                    if (containerRef.current) {
                        containerRef.current.innerHTML = svg;
                    }
                });
            } catch (error) {
                console.error('Mermaid render error:', error);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<p class="text-red-500 text-sm">Failed to render diagram</p><pre class="text-xs text-gray-500 mt-2">${chart}</pre>`;
                }
            }
        }
    }, [chart]);

    return (
        <div className="mermaid-container my-6 flex justify-center bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 overflow-x-auto">
            <div ref={containerRef} className="w-full text-center" />
        </div>
    );
};

export default Mermaid;
