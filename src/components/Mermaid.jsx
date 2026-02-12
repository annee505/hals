import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    suppressErrorRendering: true
});

// Sanitize common AI-generated Mermaid mistakes
function sanitizeChart(raw) {
    let chart = raw.trim();

    // Remove leading "mermaid" if the AI put it as first word
    if (/^mermaid\s/i.test(chart)) {
        chart = chart.replace(/^mermaid\s*/i, '');
    }

    // Remove wrapping ```mermaid ... ``` if the AI double-wrapped
    chart = chart.replace(/^```mermaid\s*/i, '').replace(/```\s*$/, '');

    // Ensure it starts with a valid diagram type
    const validStarts = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
        'erDiagram', 'gantt', 'pie', 'gitgraph', 'mindmap', 'timeline', 'journey',
        'quadrantChart', 'xychart', 'block'];
    const firstWord = chart.split(/[\s\n]/)[0].toLowerCase();
    if (!validStarts.some(s => firstWord.startsWith(s.toLowerCase()))) {
        // Wrap in a default flowchart if no valid diagram type
        chart = `graph TD\n${chart}`;
    }

    // Replace problematic round-bracket nodes: A(Label) -> A["Label"]
    chart = chart.replace(/(\w+)\(([^)]+)\)/g, '$1["$2"]');

    return chart.trim();
}

const Mermaid = ({ chart }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !chart) return;

        const sanitized = sanitizeChart(chart);
        const renderId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        setError(false);

        mermaid.render(renderId, sanitized)
            .then(({ svg }) => {
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            })
            .catch((err) => {
                console.warn('Mermaid render failed:', err?.message || err);
                setError(true);
                // Clean up any orphaned SVG element mermaid may have created
                const orphan = document.getElementById(renderId);
                if (orphan) orphan.remove();
            });
    }, [chart]);

    if (error) {
        return (
            <details className="my-6 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <summary className="px-4 py-3 text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                    📊 Diagram (click to view source)
                </summary>
                <pre className="px-4 py-3 text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap">
                    {chart}
                </pre>
            </details>
        );
    }

    return (
        <div className="mermaid-container my-6 flex justify-center bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 overflow-x-auto">
            <div ref={containerRef} className="w-full text-center" />
        </div>
    );
};

export default Mermaid;
