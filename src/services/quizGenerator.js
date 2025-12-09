import Groq from 'groq-sdk';
import { supabase } from './supabase-config';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

export const quizGenerator = {
    generateQuiz: async (courseId, moduleId, lessonContents) => {
        try {
            if (!apiKey) throw new Error("Missing Groq API Key");

            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

            // Combine lesson contents for context
            const combinedContent = Array.isArray(lessonContents)
                ? lessonContents.join('\n\n')
                : lessonContents;

            const prompt = `Based on this learning content:
${combinedContent.substring(0, 6000)}... (truncated)

Generate 5 multiple-choice quiz questions to test understanding.

IMPORTANT: Respond ONLY with valid JSON matching this schema:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Explanation why this is correct."
    }
  ]
}`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                response_format: { type: "json_object" }
            });

            const responseText = completion.choices[0]?.message?.content || "{}";
            const quizData = JSON.parse(responseText);

            // Create quiz in Supabase
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .insert({
                    course_id: courseId,
                    module_id: moduleId,
                    title: `Module Quiz`,
                    description: `Test your knowledge on this module`,
                    order_index: 0
                })
                .select()
                .single();

            if (quizError) throw quizError;

            // Save quiz questions
            for (let i = 0; i < quizData.questions.length; i++) {
                const q = quizData.questions[i];

                const { error: questionError } = await supabase
                    .from('quiz_questions')
                    .insert({
                        quiz_id: quiz.id,
                        question: q.question,
                        options: q.options,
                        correct_answer: q.correctAnswer,
                        explanation: q.explanation,
                        order_index: i
                    });

                if (questionError) throw questionError;
            }

            return quiz;
        } catch (error) {
            console.error('Error generating quiz:', error);
            throw error;
        }
    },

    getQuiz: async (quizId) => {
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

        if (quizError) throw quizError;

        const { data: questions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quizId)
            .order('order_index');

        if (questionsError) throw questionsError;

        return { ...quiz, questions };
    },

    submitQuizAttempt: async (userId, quizId, answers) => {
        // Get correct answers
        const { data: questions } = await supabase
            .from('quiz_questions')
            .select('id, correct_answer')
            .eq('quiz_id', quizId);

        // Calculate score
        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score++;
            }
        });

        // Save attempt
        const { data: attempt, error } = await supabase
            .from('quiz_attempts')
            .insert({
                user_id: userId,
                quiz_id: quizId,
                score: score,
                total_questions: questions.length,
                answers: answers
            })
            .select()
            .single();

        if (error) throw error;

        return { ...attempt, percentage: Math.round((score / questions.length) * 100) };
    }
};
