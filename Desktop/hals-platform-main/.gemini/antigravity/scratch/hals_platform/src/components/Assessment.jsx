import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { gamificationService } from '../services/gamification';

// Topic-specific question banks
const questionBank = {
    programming: [
        {
            text: 'What is the first step to writing a good program?',
            options: [
                { id: 'a', text: 'Understand and define the problem clearly' },
                { id: 'b', text: 'Start writing code immediately' },
                { id: 'c', text: 'Copy code from the internet' }
            ],
            correctId: 'a',
            explanation: 'Understanding the problem is essential before writing any code. Clear problem definition leads to better solutions.'
        },
        {
            text: 'Which practice helps you write maintainable code?',
            options: [
                { id: 'a', text: 'Writing very long functions' },
                { id: 'b', text: 'Using meaningful variable names and comments' },
                { id: 'c', text: 'Avoiding any whitespace' }
            ],
            correctId: 'b',
            explanation: 'Meaningful names and comments make code readable for yourself and others, which is crucial for maintenance.'
        },
        {
            text: 'What is debugging?',
            options: [
                { id: 'a', text: 'Adding new features to a program' },
                { id: 'b', text: 'Finding and fixing errors in code' },
                { id: 'c', text: 'Deleting code that is not needed' }
            ],
            correctId: 'b',
            explanation: 'Debugging is the systematic process of identifying, isolating, and resolving bugs or defects in software.'
        }
    ],
    web: [
        {
            text: 'What is the purpose of HTML in web development?',
            options: [
                { id: 'a', text: 'Styling the webpage' },
                { id: 'b', text: 'Structuring the content of a webpage' },
                { id: 'c', text: 'Adding interactivity' }
            ],
            correctId: 'b',
            explanation: 'HTML (HyperText Markup Language) defines the structure and content of a webpage using tags and elements.'
        },
        {
            text: 'What does CSS stand for?',
            options: [
                { id: 'a', text: 'Computer Style Sheets' },
                { id: 'b', text: 'Cascading Style Sheets' },
                { id: 'c', text: 'Creative Style System' }
            ],
            correctId: 'b',
            explanation: 'CSS stands for Cascading Style Sheets and is used to control the visual presentation of web pages.'
        },
        {
            text: 'What is responsive design?',
            options: [
                { id: 'a', text: 'A website that loads quickly' },
                { id: 'b', text: 'A website that adapts to different screen sizes' },
                { id: 'c', text: 'A website with fast server responses' }
            ],
            correctId: 'b',
            explanation: 'Responsive design ensures a website looks good and works well on all devices, from phones to desktops.'
        }
    ],
    react: [
        {
            text: 'What is a React component?',
            options: [
                { id: 'a', text: 'A CSS styling rule' },
                { id: 'b', text: 'A reusable piece of UI that can have its own logic and state' },
                { id: 'c', text: 'A database table' }
            ],
            correctId: 'b',
            explanation: 'Components are the building blocks of React apps — reusable, independent pieces of UI with their own state and logic.'
        },
        {
            text: 'What is the purpose of useState in React?',
            options: [
                { id: 'a', text: 'To fetch data from an API' },
                { id: 'b', text: 'To manage and update state within a component' },
                { id: 'c', text: 'To navigate between pages' }
            ],
            correctId: 'b',
            explanation: 'useState is a React Hook that lets you add and manage state variables in functional components.'
        },
        {
            text: 'What happens when state changes in React?',
            options: [
                { id: 'a', text: 'The entire page reloads' },
                { id: 'b', text: 'Only the affected component re-renders' },
                { id: 'c', text: 'Nothing happens' }
            ],
            correctId: 'b',
            explanation: 'React efficiently re-renders only the components whose state or props have changed, using a virtual DOM.'
        }
    ],
    finance: [
        {
            text: 'What is the most important first step in managing your finances?',
            options: [
                { id: 'a', text: 'Invest in stocks immediately' },
                { id: 'b', text: 'Create a budget and track your spending' },
                { id: 'c', text: 'Take out a loan' }
            ],
            correctId: 'b',
            explanation: 'A budget gives you visibility into your income and expenses, which is the foundation of all financial planning.'
        },
        {
            text: 'What is compound interest?',
            options: [
                { id: 'a', text: 'Interest only on the principal amount' },
                { id: 'b', text: 'Interest on both the principal and accumulated interest' },
                { id: 'c', text: 'A fixed fee charged by banks' }
            ],
            correctId: 'b',
            explanation: 'Compound interest grows your money exponentially because you earn interest on your interest over time.'
        },
        {
            text: 'How much should an emergency fund typically cover?',
            options: [
                { id: 'a', text: '1 week of expenses' },
                { id: 'b', text: '3-6 months of living expenses' },
                { id: 'c', text: '10 years of salary' }
            ],
            correctId: 'b',
            explanation: 'Financial experts recommend 3-6 months of expenses saved to cover unexpected events like job loss or emergencies.'
        }
    ],
    investing: [
        {
            text: 'What is diversification in investing?',
            options: [
                { id: 'a', text: 'Putting all your money in one stock' },
                { id: 'b', text: 'Spreading investments across different asset types to reduce risk' },
                { id: 'c', text: 'Only investing in real estate' }
            ],
            correctId: 'b',
            explanation: 'Diversification reduces risk by ensuring that poor performance in one area is offset by others.'
        },
        {
            text: 'What does "buy and hold" mean?',
            options: [
                { id: 'a', text: 'Buy stocks and sell them the next day' },
                { id: 'b', text: 'Purchase investments and keep them long-term regardless of short-term fluctuations' },
                { id: 'c', text: 'Only buy during market crashes' }
            ],
            correctId: 'b',
            explanation: 'Buy and hold is a passive strategy based on the principle that markets tend to grow over long periods.'
        },
        {
            text: 'What is risk tolerance?',
            options: [
                { id: 'a', text: 'How much money you have to invest' },
                { id: 'b', text: 'Your ability and willingness to withstand investment losses' },
                { id: 'c', text: 'The interest rate on your savings' }
            ],
            correctId: 'b',
            explanation: 'Risk tolerance helps determine the right investment mix — higher risk tolerance may lead to more aggressive portfolios.'
        }
    ],
    design: [
        {
            text: 'What is the most important principle in visual design?',
            options: [
                { id: 'a', text: 'Use as many colors as possible' },
                { id: 'b', text: 'Establish a clear visual hierarchy' },
                { id: 'c', text: 'Avoid all white space' }
            ],
            correctId: 'b',
            explanation: 'Visual hierarchy guides the viewer\'s eye to the most important elements first using size, color, and contrast.'
        },
        {
            text: 'What is the purpose of a wireframe?',
            options: [
                { id: 'a', text: 'To write the final code' },
                { id: 'b', text: 'To plan the layout and structure before detailed design' },
                { id: 'c', text: 'To test the website performance' }
            ],
            correctId: 'b',
            explanation: 'Wireframes let you quickly iterate on layout ideas without investing time in visual details.'
        },
        {
            text: 'What is accessibility in design?',
            options: [
                { id: 'a', text: 'Making designs look modern' },
                { id: 'b', text: 'Ensuring products are usable by people with disabilities' },
                { id: 'c', text: 'Making websites load faster' }
            ],
            correctId: 'b',
            explanation: 'Accessible design ensures everyone, including those with visual, auditory, or motor impairments, can use your product.'
        }
    ],
    personal: [
        {
            text: 'What is the most effective way to build a new habit?',
            options: [
                { id: 'a', text: 'Try to change everything at once' },
                { id: 'b', text: 'Start small and be consistent' },
                { id: 'c', text: 'Only do it when motivated' }
            ],
            correctId: 'b',
            explanation: 'Small, consistent actions build neural pathways over time, making the habit automatic. Motivation fades, systems don\'t.'
        },
        {
            text: 'What is the Eisenhower Matrix used for?',
            options: [
                { id: 'a', text: 'Financial planning' },
                { id: 'b', text: 'Prioritizing tasks by urgency and importance' },
                { id: 'c', text: 'Tracking calories' }
            ],
            correctId: 'b',
            explanation: 'The Eisenhower Matrix helps you decide what to do now, schedule, delegate, or eliminate based on urgency and importance.'
        },
        {
            text: 'What is mindfulness?',
            options: [
                { id: 'a', text: 'Thinking about the future' },
                { id: 'b', text: 'Being fully present and aware in the current moment' },
                { id: 'c', text: 'Multi-tasking efficiently' }
            ],
            correctId: 'b',
            explanation: 'Mindfulness is the practice of paying attention to the present moment without judgment, reducing stress and improving focus.'
        }
    ],
    language: [
        {
            text: 'What is the most effective way to learn a new language?',
            options: [
                { id: 'a', text: 'Memorize the entire dictionary' },
                { id: 'b', text: 'Practice speaking regularly, even with mistakes' },
                { id: 'c', text: 'Only study grammar rules' }
            ],
            correctId: 'b',
            explanation: 'Regular speaking practice builds fluency and confidence. Making mistakes is a natural and essential part of language learning.'
        },
        {
            text: 'What is the difference between active and passive vocabulary?',
            options: [
                { id: 'a', text: 'There is no difference' },
                { id: 'b', text: 'Active = words you use. Passive = words you understand but don\'t use.' },
                { id: 'c', text: 'Active = written. Passive = spoken.' }
            ],
            correctId: 'b',
            explanation: 'Active vocabulary are words you can recall and use. Passive vocabulary are words you recognize when you hear or read them.'
        },
        {
            text: 'Why is immersion effective for language learning?',
            options: [
                { id: 'a', text: 'It is not effective' },
                { id: 'b', text: 'It forces your brain to think in the new language constantly' },
                { id: 'c', text: 'It only helps with writing' }
            ],
            correctId: 'b',
            explanation: 'Immersion surrounds you with the language, forcing natural acquisition through constant exposure and practice.'
        }
    ],
    health: [
        {
            text: 'What is the foundation of physical fitness?',
            options: [
                { id: 'a', text: 'Taking supplements' },
                { id: 'b', text: 'Consistent exercise combined with proper nutrition and rest' },
                { id: 'c', text: 'Exercising as intensely as possible every day' }
            ],
            correctId: 'b',
            explanation: 'Fitness is built on three pillars: regular exercise, balanced nutrition, and adequate recovery time.'
        },
        {
            text: 'How many hours of sleep do most adults need?',
            options: [
                { id: 'a', text: '4-5 hours' },
                { id: 'b', text: '7-9 hours' },
                { id: 'c', text: '12+ hours' }
            ],
            correctId: 'b',
            explanation: 'Most adults need 7-9 hours of quality sleep for optimal physical and mental health.'
        },
        {
            text: 'What is the best approach to start exercising?',
            options: [
                { id: 'a', text: 'Jump into intense workouts immediately' },
                { id: 'b', text: 'Start with moderate intensity and gradually increase' },
                { id: 'c', text: 'Only exercise on weekends' }
            ],
            correctId: 'b',
            explanation: 'Gradual progression prevents injury and builds sustainable habits. The best exercise routine is one you can stick to.'
        }
    ]
};

// Map course topics to question categories
const topicCategoryMap = {
    'python': 'programming', 'programming': 'programming', 'code': 'programming', 'coding': 'programming',
    'full-stack': 'programming', 'node': 'programming', 'javascript': 'programming', 'mern': 'programming',
    'data science': 'programming', 'machine learning': 'programming', 'cloud': 'programming', 'aws': 'programming',
    'mobile': 'programming', 'react native': 'programming',
    'web': 'web', 'html': 'web', 'css': 'web', 'bootcamp': 'web',
    'react': 'react', 'frontend': 'react',
    'finance': 'finance', 'money': 'finance', 'budget': 'finance', 'personal finance': 'finance',
    'invest': 'investing', 'stock': 'investing', 'crypto': 'investing', 'blockchain': 'investing',
    'design': 'design', 'graphic': 'design', 'ui': 'design', 'ux': 'design', 'figma': 'design',
    'marketing': 'design', 'content': 'design', 'writing': 'design', 'copywriting': 'design',
    'productivity': 'personal', 'time': 'personal', 'speaking': 'personal', 'mindfulness': 'personal',
    'meditation': 'personal', 'career': 'personal', 'habit': 'personal',
    'spanish': 'language', 'english': 'language', 'grammar': 'language', 'language': 'language',
    'fitness': 'health', 'nutrition': 'health', 'health': 'health', 'exercise': 'health', 'diet': 'health'
};

function getQuestionForTopic(topic) {
    const topicLower = topic.toLowerCase();

    // Find matching category
    let category = 'personal'; // default fallback
    for (const [keyword, cat] of Object.entries(topicCategoryMap)) {
        if (topicLower.includes(keyword)) {
            category = cat;
            break;
        }
    }

    const questions = questionBank[category];
    // Pick a random question from the matching category
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
}

const Assessment = ({ topic, onClose, onComplete }) => {
    const [step, setStep] = useState('question');
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);

    // Select a question based on topic — memoized so it doesn't change on re-render
    const question = useMemo(() => getQuestionForTopic(topic), [topic]);

    const handleSubmit = () => {
        if (!selectedAnswer) return;

        const isCorrect = selectedAnswer === question.correctId;

        // Award XP for completing quiz
        const result = gamificationService.completeQuiz(25);

        setFeedback({
            isCorrect,
            text: isCorrect ? "Excellent! That's correct." : "Not quite. Let's review.",
            xpGained: 25,
            leveledUp: result.leveledUp,
            newBadges: result.newBadges
        });
        setStep('result');
    };

    const handleClose = () => {
        if (feedback && onComplete) {
            onComplete(feedback);
        }
        onClose();
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 }
        }
    };

    const optionVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.1 }
        })
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                }}
            >
                {step === 'question' && (
                    <>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Check: {topic}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">{question.text}</p>

                        <div className="space-y-3 mb-6">
                            {question.options.map((option, i) => (
                                <motion.button
                                    key={option.id}
                                    custom={i}
                                    variants={optionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedAnswer(option.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAnswer === option.id
                                        ? 'border-primary bg-gradient-to-r from-primary/10 to-indigo-500/10 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 bg-white/50 dark:bg-gray-700/50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswer === option.id ? 'border-primary bg-primary' : 'border-gray-300'
                                            }`}>
                                            {selectedAnswer === option.id && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-2 h-2 bg-white rounded-full"
                                                />
                                            )}
                                        </div>
                                        <span className="font-medium dark:text-white">{option.text}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors"
                            >
                                Skip
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={!selectedAnswer}
                                className="px-6 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Submit Answer
                            </motion.button>
                        </div>
                    </>
                )}

                {step === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${feedback.isCorrect
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                : 'bg-gradient-to-br from-red-400 to-rose-500'
                                }`}
                        >
                            {feedback.isCorrect ? (
                                <Check className="w-10 h-10 text-white" />
                            ) : (
                                <X className="w-10 h-10 text-white" />
                            )}
                        </motion.div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {feedback.text}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{question.explanation}</p>

                        <div className="bg-gradient-to-r from-primary/10 to-indigo-600/10 rounded-lg p-4 mb-4">
                            <p className="text-primary font-semibold">+{feedback.xpGained} XP Earned!</p>
                            {feedback.leveledUp && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">🎉 Level Up!</p>
                            )}
                            {feedback.newBadges && feedback.newBadges.length > 0 && (
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">🏆 New Badge Unlocked!</p>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClose}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                        >
                            Continue Learning
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Assessment;
