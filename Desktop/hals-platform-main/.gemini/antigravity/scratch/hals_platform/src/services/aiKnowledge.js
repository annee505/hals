const KNOWLEDGE_BASE_KEY = 'hals_knowledgebase';

export const aiKnowledgeService = {
    uploadFile: (userId, file, courseId = null) => {
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
            uploadDate: new Date().toISOString(),
            processed: false // Mock AI processing status
        };

        allFiles[userId].push(fileData);
        localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(allFiles));

        // Simulate AI processing
        setTimeout(() => {
            aiKnowledgeService.markFileProcessed(userId, fileData.id);
        }, 2000);

        return fileData;
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
    }
};
