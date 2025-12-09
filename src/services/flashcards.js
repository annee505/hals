const FLASHCARD_KEY = 'hals_flashcards';

export const flashcardDecks = {
    'course-1': {
        title: 'Python Programming Flashcards',
        cards: [
            { id: 'card-1', front: 'What is a variable in Python?', back: 'A variable is a named storage location that holds a value which can be changed during program execution.' },
            { id: 'card-2', front: 'What are the main data types in Python?', back: 'int (integer), float (decimal), str (string), bool (boolean), list, tuple, dict (dictionary), set' },
            { id: 'card-3', front: 'What is a function?', back: 'A reusable block of code that performs a specific task, defined using the def keyword.' },
            { id: 'card-4', front: 'Explain the difference between a list and a tuple.', back: 'Lists are mutable (can be changed) and use square brackets []. Tuples are immutable (cannot be changed) and use parentheses ().' },
            { id: 'card-5', front: 'What is OOP?', back: 'Object-Oriented Programming is a programming paradigm based on objects and classes, featuring encapsulation, inheritance, and polymorphism.' },
            { id: 'card-6', front: 'How do you handle exceptions in Python?', back: 'Using try-except blocks. Code that might raise an exception goes in try, and error handling goes in except.' },
            { id: 'card-7', front: 'What is a module?', back: 'A file containing Python code (functions, classes, variables) that can be imported and used in other Python programs.' },
            { id: 'card-8', front: 'Explain list comprehension.', back: 'A concise way to create lists using a single line: [expression for item in iterable if condition]' }
        ]
    },
    'course-7': {
        title: 'Personal Finance Flashcards',
        cards: [
            { id: 'card-1', front: 'What is the 50/30/20 budget rule?', back: '50% of income for needs, 30% for wants, 20% for savings and debt repayment.' },
            { id: 'card-2', front: 'What is an emergency fund?', back: '3-6 months of living expenses saved for unexpected situations like job loss or medical emergencies.' },
            { id: 'card-3', front: 'Define compound interest.', back: 'Interest calculated on the initial principal plus accumulated interest from previous periods.' },
            { id: 'card-4', front: 'What is a budget?', back: 'A financial plan that tracks income and expenses to help manage money effectively.' },
            { id: 'card-5', front: 'Good debt vs bad debt?', back: 'Good debt: investments that increase value (education, home). Bad debt: depreciating assets or high-interest consumer debt.' },
            { id: 'card-6', front: 'What is net worth?', back: 'Total assets minus total liabilities (what you own minus what you owe).' }
        ]
    }
};

export const flashcardService = {
    getDeck: (courseId) => {
        if (flashcardDecks[courseId]) {
            return flashcardDecks[courseId];
        }

        // Generic fallback deck
        return {
            title: 'Course Concepts',
            cards: [
                { id: 'gen-1', front: 'What is the main goal of this topic?', back: 'To understand the core principles and apply them effectively.' },
                { id: 'gen-2', front: 'Why is this important?', back: 'It provides a foundation for advanced skills and real-world problem solving.' },
                { id: 'gen-3', front: 'Key Terminology', back: 'Review the glossary terms introduced in Module 1.' },
                { id: 'gen-4', front: 'Practical Application', back: 'Think of a real-world scenario where you would use this concept.' }
            ]
        };
    },

    getProgress: (userId, courseId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        return allProgress[`${userId}-${courseId}`] || { masteredCards: [], studyingCards: [] };
    },

    markCardMastered: (userId, courseId, cardId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        const key = `${userId}-${courseId}`;

        if (!allProgress[key]) {
            allProgress[key] = { masteredCards: [], studyingCards: [] };
        }

        if (!allProgress[key].masteredCards.includes(cardId)) {
            allProgress[key].masteredCards.push(cardId);
            // Remove from studying if present
            allProgress[key].studyingCards = allProgress[key].studyingCards.filter(id => id !== cardId);
        }

        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(allProgress));
        return allProgress[key];
    },

    markCardStudying: (userId, courseId, cardId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        const key = `${userId}-${courseId}`;

        if (!allProgress[key]) {
            allProgress[key] = { masteredCards: [], studyingCards: [] };
        }

        if (!allProgress[key].studyingCards.includes(cardId) && !allProgress[key].masteredCards.includes(cardId)) {
            allProgress[key].studyingCards.push(cardId);
        }

        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(allProgress));
        return allProgress[key];
    }
};
