import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
    if (mermaidInitialized) return;
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif'
    });
    mermaidInitialized = true;
}

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

// Global render counter to create unique IDs
let renderCounter = 0;

const Mermaid = ({ chart }) => {
    const containerRef = useRef(null);
    const [svgContent, setSvgContent] = useState(null);
    const [error, setError] = useState(false);

    const renderChart = useCallback(async () => {
        if (!chart) return;

        initMermaid();
        const sanitized = sanitizeChart(chart);
        const uniqueId = `mermaid-diagram-${++renderCounter}`;

        try {
            // Use mermaid.render which returns an SVG string
            const { svg } = await mermaid.render(uniqueId, sanitized);
            if (svg && svg.length > 50) {
                setSvgContent(svg);
                setError(false);
            } else {
                throw new Error('Empty SVG output');
            }
        } catch (err) {
            console.warn('Mermaid render failed:', err?.message || err, '\nChart:', sanitized);
            setError(true);
            setSvgContent(null);

            // Cleanup: mermaid.render creates a temp element with the ID
            try {
                const orphan = document.getElementById(uniqueId);
                if (orphan) orphan.remove();
            } catch (e) { /* ignore */ }
        }
    }, [chart]);

    useEffect(() => {
        renderChart();
    }, [renderChart]);

    if (error) {
        return (
            <details className="my-6 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <summary className="px-4 py-3 text-sm text-gray-400 cursor-pointer hover:text-gray-300 select-none">
                    📊 Diagram could not render (click to view source)
                </summary>
                <pre className="px-4 py-3 text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap border-t border-gray-700/50">
                    {chart}
                </pre>
            </details>
        );
    }

    if (svgContent) {
        return (
            <div
                className="mermaid-container my-6 flex justify-center bg-white p-6 rounded-xl border border-gray-200 dark:border-gray-600 overflow-x-auto shadow-sm"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        );
    }

    // Loading state
    return (
        <div className="my-6 flex justify-center items-center bg-gray-800/30 p-8 rounded-xl border border-gray-700/50">
            <span className="text-sm text-gray-500">Loading diagram...</span>
        </div>
    );
};

export default Mermaid;
