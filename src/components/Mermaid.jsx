import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with defaults (will be re-initialized tailored to theme on render)
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

    // Strips comments (both %% and // which AI sometimes hallucinates)
    chart = chart.replace(/%%.*$/gm, '');
    chart = chart.replace(/\/\/.*$/gm, '');

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

    // Fix "add" arrows (AI hallucination like +.->)
    chart = chart.replace(/\+\.->/g, '-.->');
    chart = chart.replace(/\+->/g, '-->');

    // Remove trailing semicolons
    chart = chart.replace(/;\s*$/gm, '');

    // Auto-quote arrow labels to handle math symbols like ln(2)/k
    // Matches -->|Label| and replaces with -->|"Label"| unless already quoted
    // Note: This regex is simple and assumes labels don't contain | inside
    // Matches arrow types: -->, -.->, ==>
    const quoteLabelRegex = /([-=.]+(?:>))\|([^"|\n]+)\|/g;
    chart = chart.replace(quoteLabelRegex, '$1|"$2"|');

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

    // Fix spaces/symbols in node IDs around arrows
    // Regex matches: (pre)(ID)(arrow start)
    // ID matched group #2 is strictly alphanumeric/spaces/plus/minus
    // BUT we must exclude lines with quotes/brackets to avoid breaking labels
    // So we use a negative lookahead or strict character class
    const arrowRegex = /(\s+)([^"\[\]\(\)\n]+?)(\s*[-=.]+(?:>|\|))/gm;
    body = body.replace(arrowRegex, (match, pre, nodeId, arrow) => {
        // Only sanitize if it truly looks like an ID (no quotes/brackets in match)
        return pre + nodeId.replace(/[\s\+\-]+/g, '_') + arrow;
    });

    // Handle end of line nodes (e.g. A --> B)
    // Regex matches: (arrow)(ID)(end)
    const endNodeRegex = /([-=.]+(?:>|\|)(?:\|[^|]*\|)?\s*)([^"\[\]\(\)\n]+?)(\s*$)/gm;
    body = body.replace(endNodeRegex, (match, arrow, nodeId, end) => {
        return arrow + nodeId.replace(/[\s\+\-]+/g, '_') + end;
    });

    // Fix lines where nodes with labels and the arrow are all on one line,
    // which some Mermaid versions can be picky about, e.g.:
    //   Start["Starting Point"] --> Step1["Plot the intercept (b)"]
    // We rewrite this into:
    //   Start["Starting Point"]
    //   Step1["Plot the intercept (b)"]
    //   Start --> Step1
    const inlineNodeWithLabel = /^(\s*)([A-Za-z0-9_]+)\s*(\[[^\]]+\])\s*([-=.]+>)\s*([A-Za-z0-9_]+)\s*(\[[^\]]+\])\s*$/gm;
    body = body.replace(inlineNodeWithLabel, (match, indent, id1, label1, arrow, id2, label2) => {
        const line1 = `${indent}${id1}${label1}`;
        const line2 = `${indent}${id2}${label2}`;
        const line3 = `${indent}${id1} ${arrow} ${id2}`;
        return `${line1}\n${line2}\n${line3}`;
    });

    chart = firstLine + '\n' + body;

    return chart.trim();
}

const Mermaid = ({ chart }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    // Use themeKey to force re-render when theme changes
    const [themeKey, setThemeKey] = useState(0);
    const [isRendering, setIsRendering] = useState(true);

    const sanitized = sanitizeChart(chart);

    // Watch for dark mode changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setThemeKey(k => k + 1);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const runMermaid = async () => {
            setIsRendering(true);
            setError(null);

            try {
                // Detect dark mode from html or body class
                const isDark = document.documentElement.classList.contains('dark') ||
                    document.body.classList.contains('dark');

                // Re-initialize with correct theme
                mermaid.initialize({
                    startOnLoad: false,
                    theme: isDark ? 'dark' : 'default',
                    securityLevel: 'loose',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    logLevel: 'error'
                });

                // We use key={sanitized + themeKey} on the div, so it's always a fresh element with text content
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

        // Small timeout to allow DOM paint
        requestAnimationFrame(() => runMermaid());

    }, [sanitized, themeKey]); // Re-run when chart or theme changes

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
                        {chart} // Display raw chart to user
                    </pre>
                </div>
            </details>
        );
    }

    return (
        <div className="my-6 flex justify-center">
            {/* key forces React to destroy and recreate the div,
                restoring it to a plain text container before mermaid.run processes it. */}
            <div
                key={`${sanitized}-${themeKey}`}
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
