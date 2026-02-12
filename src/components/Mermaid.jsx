import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
    themeVariables: {
        primaryColor: '#818cf8',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#6366f1',
        lineColor: '#6366f1',
        secondaryColor: '#e0e7ff',
        tertiaryColor: '#f0f0ff',
        noteBkgColor: '#e0e7ff',
        noteTextColor: '#1f2937',
        fontSize: '14px'
    }
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
        chart = `graph TD\n${chart}`;
    }

    // Fix common AI arrow mistakes:
    // -->|label|> should be -->|label| (stray > after pipe)
    chart = chart.replace(/\|>\s/g, '| ');
    // Remove trailing semicolons
    chart = chart.replace(/;\s*$/gm, '');

    return chart.trim();
}

const Mermaid = ({ chart }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !chart) return;

        let cancelled = false;
        const sanitized = sanitizeChart(chart);
        const renderId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        setError(false);

        mermaid.render(renderId, sanitized)
            .then(({ svg }) => {
                if (cancelled) return;
                if (!svg || svg.trim().length < 10) {
                    // Empty or trivial SVG = silent failure
                    setError(true);
                    return;
                }
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            })
            .catch((err) => {
                if (cancelled) return;
                console.warn('Mermaid render failed:', err?.message || err);
                setError(true);
                // Clean up any orphaned SVG element mermaid may have created
                const orphan = document.getElementById(renderId);
                if (orphan) orphan.remove();
            });

        return () => { cancelled = true; };
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
        <div className="mermaid-container my-6 flex justify-center bg-white dark:bg-gray-100 p-6 rounded-xl border border-gray-200 dark:border-gray-600 overflow-x-auto shadow-sm">
            <div ref={containerRef} className="w-full text-center" />
        </div>
    );
};

export default Mermaid;
