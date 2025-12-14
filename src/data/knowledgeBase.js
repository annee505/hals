// Knowledge Base for AI Mentor RAG
// Loads and searches knowledge files for relevant context

// Import all knowledge files at build time
const knowledgeFiles = import.meta.glob('./knowledge/*.txt', { as: 'raw', eager: true });

// Parse knowledge documents
const knowledgeBase = [];

for (const [path, content] of Object.entries(knowledgeFiles)) {
    const filename = path.split('/').pop();

    // Skip backup files
    if (filename.toLowerCase().includes('backup')) continue;

    // Parse YAML frontmatter
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    let metadata = {};
    let body = content;

    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        body = content.slice(frontmatterMatch[0].length).trim();

        // Simple YAML parsing
        frontmatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        });
    }

    knowledgeBase.push({
        filename,
        metadata,
        content: body,
        keywords: (metadata.keywords || '').toLowerCase().split(',').map(k => k.trim())
    });
}

/**
 * Search knowledge base for relevant documents
 * @param {string} query - User's message/question
 * @param {number} maxResults - Maximum documents to return
 * @returns {Array} - Matching documents with content
 */
export function searchKnowledge(query, maxResults = 3) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    // Score each document based on keyword matches
    const scored = knowledgeBase.map(doc => {
        let score = 0;

        // Check keywords
        doc.keywords.forEach(keyword => {
            if (queryLower.includes(keyword) || keyword.split(' ').some(k => queryWords.includes(k))) {
                score += 10;
            }
        });

        // Check topic
        const topic = (doc.metadata.topic || '').toLowerCase();
        if (queryLower.includes(topic) || queryWords.includes(topic)) {
            score += 5;
        }

        // Check document type matches intent
        const docType = (doc.metadata.document_type || '').toLowerCase();
        if (queryLower.includes('roadmap') && docType === 'roadmap') score += 8;
        if (queryLower.includes('learn') && docType === 'tutorial') score += 5;
        if (queryLower.includes('career') && docType === 'guide') score += 8;
        if (queryLower.includes('job') && docType === 'guide') score += 8;

        // Common topic matches
        if (queryLower.includes('python') && doc.content.toLowerCase().includes('python')) score += 3;
        if (queryLower.includes('machine learning') || queryLower.includes('ml')) {
            if (topic === 'machine_learning') score += 10;
        }
        if (queryLower.includes('web') && topic === 'web_development') score += 10;
        if (queryLower.includes('data') && doc.content.toLowerCase().includes('data')) score += 2;

        return { ...doc, score };
    });

    // Sort by score and return top matches
    return scored
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(doc => ({
            title: doc.filename.replace('.txt', ''),
            topic: doc.metadata.topic || 'general',
            skillLevel: doc.metadata.skill_level || 'all',
            content: doc.content.slice(0, 1500) // Limit content length for context
        }));
}

/**
 * Format knowledge results for AI context
 * @param {Array} results - Search results
 * @returns {string} - Formatted context string
 */
export function formatKnowledgeContext(results) {
    if (!results || results.length === 0) {
        return '';
    }

    return results.map(doc =>
        `### ${doc.title} (${doc.skillLevel})\n${doc.content}`
    ).join('\n\n---\n\n');
}

export { knowledgeBase };
