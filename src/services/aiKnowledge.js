const KNOWLEDGE_BASE_KEY = 'hals_knowledgebase';

export const aiKnowledgeService = {
    /**
     * Upload a file and extract its content for RAG
     */
    uploadFile: (userId, file, courseId = null, content = '') => {
        const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        const allFiles = saved ? JSON.parse(saved) : {};

        if (!allFiles[userId]) {
            allFiles[userId] = [];
        }

        const fileData = {
            id: `file-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            courseId,
            content: content, // Store the actual file content
            uploadDate: new Date().toISOString(),
            processed: true // Content already extracted
        };

        allFiles[userId].push(fileData);
        localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(allFiles));

        return fileData;
    },

    /**
     * Read file content as text
     */
    readFileContent: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(error);
            };

            // Read as text for supported formats
            if (file.type === 'application/pdf') {
                // For PDFs, we'd need a library like pdf.js
                // For now, just store the filename as a reference
                resolve(`[PDF Document: ${file.name}]`);
            } else {
                // Read text files directly
                reader.readAsText(file);
            }
        });
    },

    /**
     * Search user's uploaded files for relevant content (RAG)
     */
    searchUserFiles: (userId, query, maxResults = 3) => {
        const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        const allFiles = saved ? JSON.parse(saved) : {};
        const userFiles = allFiles[userId] || [];

        if (userFiles.length === 0) return [];

        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

        // Score each file based on content matches
        const scored = userFiles
            .filter(file => file.content && file.processed)
            .map(file => {
                let score = 0;
                const contentLower = (file.content || '').toLowerCase();
                const nameLower = (file.name || '').toLowerCase();

                // Check query words in content
                queryWords.forEach(word => {
                    if (contentLower.includes(word)) {
                        score += 5;
                    }
                    if (nameLower.includes(word)) {
                        score += 3;
                    }
                });

                // Boost files from the same course context
                if (file.courseId) {
                    score += 2;
                }

                return { ...file, score };
            });

        // Return top matches
        return scored
            .filter(file => file.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(file => ({
                title: file.name,
                content: file.content.slice(0, 2000), // Limit content for context
                uploadDate: file.uploadDate,
                score: file.score
            }));
    },

    /**
     * Format user file results for AI context
     */
    formatUserFilesContext: (results) => {
        if (!results || results.length === 0) {
            return '';
        }

        return results.map(file =>
            `### From your uploaded file: ${file.title}\n${file.content}`
        ).join('\n\n---\n\n');
    },

    markFileProcessed: (userId, fileId) => {
        const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        const allFiles = saved ? JSON.parse(saved) : {};

        if (allFiles[userId]) {
            const file = allFiles[userId].find(f => f.id === fileId);
            if (file) {
                file.processed = true;
                localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(allFiles));
            }
        }
    },

    getUserFiles: (userId) => {
        const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        const allFiles = saved ? JSON.parse(saved) : {};
        return allFiles[userId] || [];
    },

    deleteFile: (userId, fileId) => {
        const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        const allFiles = saved ? JSON.parse(saved) : {};

        if (allFiles[userId]) {
            allFiles[userId] = allFiles[userId].filter(f => f.id !== fileId);
            localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(allFiles));
        }
    },

    /**
     * Clear all user files
     */
    clearUserFiles: (userId) => {
        const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        const allFiles = saved ? JSON.parse(saved) : {};
        allFiles[userId] = [];
        localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(allFiles));
    }
};

