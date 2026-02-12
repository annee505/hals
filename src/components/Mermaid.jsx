import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
    logLevel: 'error'
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
    // Allow TB (Top-Bottom) alias for TD
    if (!validStarts.some(s => firstWord.startsWith(s.toLowerCase()))) {
        if (firstWord.startsWith('graph') || firstWord.startsWith('flowchart')) {
            // It's valid but maybe with TB
        } else {
            chart = `graph TD\n${chart}`;
        }
    }

    // Fix common AI arrow mistakes:
    // Replace |> with | globally (fixes -->|Label|> error)
    chart = chart.replace(/\|>/g, '|');
    chart = chart.replace(/\|\s+>/g, '|');

    // Remove trailing semicolons
    chart = chart.replace(/;\s*$/gm, '');

    // Split first line (diagram type) from body to apply detailed regexes
    const lines = chart.split('\n');
    const firstLine = lines[0];
    let body = lines.slice(1).join('\n');

    // Fix spaces in node IDs before brackets: Blues Style["label"] -> Blues_Style["label"]
    body = body.replace(/^(\s*)(\w+(?:\s+\w+)+)(\s*[\[\(\{])/gm, (match, indent, nodeId, bracket) => {
        return indent + nodeId.replace(/\s+/g, '_') + bracket.trim();
    });

    // Fix space between node ID and bracket (e.g. A ["Label"] -> A["Label"])
    body = body.replace(/(\w)\s+([\[\(\{])/g, '$1$2');

    // Fix spaces in node IDs around arrows: Node One --> Node Two -> Node_One --> Node_Two
    body = body.replace(/(\s+)([\w]+(?:\s+[\w]+)+)(\s*-->)/gm, (match, pre, nodeId, arrow) => {
        return pre + nodeId.replace(/\s+/g, '_') + arrow;
    });
    body = body.replace(/(-->(?:\|[^|]*\|)?\s*)([\w]+(?:\s+[\w]+)+)(\s*$)/gm, (match, arrow, nodeId, end) => {
        return arrow + nodeId.replace(/\s+/g, '_') + end;
    });

    chart = firstLine + '\n' + body;

    return chart.trim();
}

const Mermaid = ({ chart }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [isRendering, setIsRendering] = useState(true);

    const sanitized = sanitizeChart(chart);

    useEffect(() => {
        if (!containerRef.current) return;

        const runMermaid = async () => {
            setIsRendering(true);
            setError(null);

            try {
                // We use key={sanitized} on the div, so it's always a fresh element with text content
                await mermaid.run({
                    nodes: [containerRef.current],
                    suppressErrors: false
                });
                setIsRendering(false);
            } catch (err) {
                console.error('Mermaid run failed:', err);
                setError(err);
                setIsRendering(false);
            }
        };

        // Small timeout to allow DOM paint? usually usually not needed with Effect but safer
        requestAnimationFrame(() => runMermaid());

    }, [sanitized]);

    if (error) {
        return (
            <details className="my-6 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <summary className="px-4 py-3 text-sm text-gray-400 cursor-pointer hover:text-gray-300 select-none flex justify-between">
                    <span>📊 Diagram error (click to view source)</span>
                    <span className="text-red-400 text-xs font-mono">{String(error.message || error).slice(0, 50)}...</span>
                </summary>
                <div className="p-4 border-t border-gray-700/50">
                    <p className="text-red-400 text-xs font-mono mb-2 whitespace-pre-wrap">{String(error.message || error)}</p>
                    <pre className="text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap">
                        {chart}
                    </pre>
                </div>
            </details>
        );
    }

    return (
        <div className="my-6 flex justify-center">
            {/* key={sanitized} forces React to destroy and recreate the div when chart changes,
                restoring it to a plain text container before mermaid.run processes it. */}
            <div
                key={sanitized}
                className="mermaid bg-white dark:bg-gray-800 p-4 rounded-xl overflow-x-auto"
                ref={containerRef}
                style={{ opacity: isRendering ? 0 : 1, transition: 'opacity 0.2s' }}
            >
                {sanitized}
            </div>
            {isRendering && (
                <div className="absolute py-10 text-gray-400 animate-pulse">
                    Loading diagram...
                </div>
            )}
        </div>
    );
};

export default Mermaid;
