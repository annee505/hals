const NOTES_KEY = 'hals_lesson_notes';

function getAllNotes() {
    try {
        const saved = localStorage.getItem(NOTES_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
}

function saveAllNotes(notes) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function makeKey(userId, courseId, lessonId) {
    return `${userId}_${courseId}_${lessonId}`;
}

export const notesService = {
    // Get all notes for a specific lesson
    getNotesForLesson: (userId, courseId, lessonId) => {
        const all = getAllNotes();
        const key = makeKey(userId, courseId, lessonId);
        return all[key] || [];
    },

    // Get all notes for a course (across all lessons)
    getNotesForCourse: (userId, courseId) => {
        const all = getAllNotes();
        const prefix = `${userId}_${courseId}_`;
        const courseNotes = [];

        Object.keys(all).forEach(key => {
            if (key.startsWith(prefix)) {
                const lessonId = key.replace(prefix, '');
                all[key].forEach(note => {
                    courseNotes.push({ ...note, lessonId });
                });
            }
        });

        return courseNotes.sort((a, b) => b.updatedAt - a.updatedAt);
    },

    // Get total note count for a course
    getNoteCountForCourse: (userId, courseId) => {
        return notesService.getNotesForCourse(userId, courseId).length;
    },

    // Add a new note
    addNote: (userId, courseId, lessonId, text, highlightedText = '') => {
        const all = getAllNotes();
        const key = makeKey(userId, courseId, lessonId);
        if (!all[key]) all[key] = [];

        const note = {
            id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            text,
            highlightedText,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            color: 'yellow' // default color
        };

        all[key].push(note);
        saveAllNotes(all);
        return note;
    },

    // Update a note
    updateNote: (userId, courseId, lessonId, noteId, updates) => {
        const all = getAllNotes();
        const key = makeKey(userId, courseId, lessonId);
        if (!all[key]) return null;

        const idx = all[key].findIndex(n => n.id === noteId);
        if (idx === -1) return null;

        all[key][idx] = { ...all[key][idx], ...updates, updatedAt: Date.now() };
        saveAllNotes(all);
        return all[key][idx];
    },

    // Delete a note
    deleteNote: (userId, courseId, lessonId, noteId) => {
        const all = getAllNotes();
        const key = makeKey(userId, courseId, lessonId);
        if (!all[key]) return;

        all[key] = all[key].filter(n => n.id !== noteId);
        if (all[key].length === 0) delete all[key];
        saveAllNotes(all);
    },

    // Change note color
    setNoteColor: (userId, courseId, lessonId, noteId, color) => {
        return notesService.updateNote(userId, courseId, lessonId, noteId, { color });
    }
};
