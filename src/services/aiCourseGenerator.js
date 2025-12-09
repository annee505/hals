import Groq from 'groq-sdk';
import { supabase } from './supabase-config';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

export const aiCourseGenerator = {
    generateCourse: async (userGoal, preferences = {}) => {
        try {
            if (!apiKey) throw new Error("Missing Groq API Key");

            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

            const prompt = `Create a comprehensive learning course on "${userGoal}".
User preferences: ${JSON.stringify(preferences)}

Generate a course with:
- Course title and description
- Difficulty level (Beginner, Intermediate, or Advanced)
- Estimated duration (e.g., "8 weeks")
- 4 modules with descriptive titles and descriptions
- 3-4 lessons per module
- Each lesson should have: title, detailed content (300-500 words), estimated duration (e.g., "15 min")

IMPORTANT: Respond ONLY with valid JSON matching this schema:
{
  "title": "Course Title",
  "description": "Course description",
  "difficulty": "Beginner",
  "duration": "8 weeks",
  "tags": ["tag1", "tag2"],
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Detailed lesson content (300-500 words)",
          "duration": "15 min"
        }
      ]
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
            const courseData = JSON.parse(responseText);

            // Save course to Supabase
            const { data: course, error: courseError } = await supabase
                .from('courses')
                .insert({
                    title: courseData.title,
                    description: courseData.description,
                    difficulty: courseData.difficulty,
                    duration: courseData.duration,
                    tags: courseData.tags || [],
                    rating: 4.8,
                    enrolled_count: 0,
                    image: 'coding'
                })
                .select()
                .single();

            if (courseError) throw courseError;

            // Save modules and lessons
            for (let i = 0; i < courseData.modules.length; i++) {
                const moduleData = courseData.modules[i];

                const { data: module, error: moduleError } = await supabase
                    .from('modules')
                    .insert({
                        course_id: course.id,
                        title: moduleData.title,
                        description: moduleData.description,
                        order_index: i
                    })
                    .select()
                    .single();

                if (moduleError) throw moduleError;

                // Save lessons for this module
                for (let j = 0; j < moduleData.lessons.length; j++) {
                    const lessonData = moduleData.lessons[j];

                    const { error: lessonError } = await supabase
                        .from('lessons')
                        .insert({
                            module_id: module.id,
                            title: lessonData.title,
                            content: lessonData.content,
                            duration: lessonData.duration,
                            order_index: j
                        });

                    if (lessonError) throw lessonError;
                }
            }

            return course;
        } catch (error) {
            console.error('Error generating course:', error);
            throw error;
        }
    }
};
