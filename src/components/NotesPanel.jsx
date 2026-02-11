import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, X, Pencil, Check } from 'lucide-react';
import { notesService } from '../services/notesService';

const NOTE_COLORS = [
    { name: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', accent: 'bg-yellow-400' },
    { name: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', accent: 'bg-blue-400' },
    { name: 'green', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', accent: 'bg-green-400' },
    { name: 'pink', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800', accent: 'bg-pink-400' },
    { name: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', accent: 'bg-purple-400' },
];

const NotesPanel = ({ userId, courseId, lessonId, isOpen, onClose, lessonTitle }) => {
    const [notes, setNotes] = useState([]);
    const [newNoteText, setNewNoteText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        if (isOpen && userId && courseId && lessonId) {
            setNotes(notesService.getNotesForLesson(userId, courseId, lessonId));
        }
    }, [isOpen, userId, courseId, lessonId]);

    const handleAddNote = () => {
        if (!newNoteText.trim()) return;
        const note = notesService.addNote(userId, courseId, lessonId, newNoteText.trim());
        setNotes(prev => [...prev, note]);
        setNewNoteText('');
    };

    const handleDelete = (noteId) => {
        notesService.deleteNote(userId, courseId, lessonId, noteId);
        setNotes(prev => prev.filter(n => n.id !== noteId));
    };

    const handleStartEdit = (note) => {
        setEditingId(note.id);
        setEditText(note.text);
    };

    const handleSaveEdit = (noteId) => {
        if (!editText.trim()) return;
        notesService.updateNote(userId, courseId, lessonId, noteId, { text: editText.trim() });
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, text: editText.trim() } : n));
        setEditingId(null);
    };

    const handleColorChange = (noteId, color) => {
        notesService.setNoteColor(userId, courseId, lessonId, noteId, color);
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, color } : n));
    };

    const getColorClasses = (colorName) => {
        return NOTE_COLORS.find(c => c.name === colorName) || NOTE_COLORS[0];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notes</h3>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {notes.length}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Lesson context */}
            {lessonTitle && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Notes for: <span className="font-medium text-gray-700 dark:text-gray-300">{lessonTitle}</span>
                    </p>
                </div>
            )}

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notes.length === 0 ? (
                    <div className="text-center py-8">
                        <StickyNote className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add your first note below!</p>
                    </div>
                ) : (
                    notes.map(note => {
                        const colors = getColorClasses(note.color);
                        return (
                            <div
                                key={note.id}
                                className={`${colors.bg} ${colors.border} border rounded-xl p-3 group transition-all`}
                            >
                                {/* Color dots */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex gap-1">
                                        {NOTE_COLORS.map(c => (
                                            <button
                                                key={c.name}
                                                onClick={() => handleColorChange(note.id, c.name)}
                                                className={`w-3 h-3 rounded-full ${c.accent} ${note.color === c.name ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-50 hover:opacity-100'} transition-all`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleStartEdit(note)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Note content */}
                                {editingId === note.id ? (
                                    <div className="flex gap-2">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="flex-1 text-sm bg-white/50 dark:bg-gray-700/50 rounded-lg p-2 border-0 focus:ring-1 focus:ring-primary resize-none dark:text-white"
                                            rows={3}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveEdit(note.id)}
                                            className="self-end text-primary hover:text-indigo-700 p-1"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.text}</p>
                                )}

                                {/* Timestamp */}
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                                    {new Date(note.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Note Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                    <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Write a note..."
                        className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent resize-none dark:text-white dark:placeholder-gray-400"
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleAddNote();
                            }
                        }}
                    />
                    <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="self-end px-3 py-2 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center">
                    Ctrl+Enter to save
                </p>
            </div>
        </div>
    );
};

export default NotesPanel;
