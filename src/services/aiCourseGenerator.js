import Groq from 'groq-sdk';
import { supabase } from './supabase-config';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

// Alternative free models in order of preference
const MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768',
    'llama3-70b-8192'
];

export const aiCourseGenerator = {
    generateCourse: async (userGoal, preferences = {}) => {
        try {
            if (!apiKey) throw new Error("Missing Groq API Key");

            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

            // Step 1: Generate course outline
            const outlinePrompt = `Create a world-class, comprehensive learning course on "${userGoal}".
User preferences: ${JSON.stringify(preferences)}

Generate a course structure with:
- Course title and description (detailed, engaging)
- Difficulty level (Beginner, Intermediate, or Advanced)
- Estimated duration (e.g., "8 weeks")
- Tags (relevant keywords)
- 4 modules with descriptive titles and descriptions
- 4 lessons per module (just titles and durations for now)

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
        { "title": "Lesson Title", "duration": "15 min" }
      ]
    }
  ]
}`;

            let courseData;
            let modelUsed = MODELS[0];

            // Try models in sequence if one fails
            for (const model of MODELS) {
                try {
                    const completion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: outlinePrompt }],
                        model: model,
                        temperature: 0.5,
                        response_format: { type: "json_object" }
                    });

                    const responseText = completion.choices[0]?.message?.content || "{}";
                    courseData = JSON.parse(responseText);
                    modelUsed = model;
                    break;
                } catch (modelError) {
                    console.warn(`Model ${model} failed, trying next...`, modelError.message);
                    if (model === MODELS[MODELS.length - 1]) {
                        throw modelError; // All models failed
                    }
                }
            }

            // Save course to Supabase first
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

            // Step 2: Generate RICH content for each lesson
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

                // Generate rich content for each lesson
                for (let j = 0; j < moduleData.lessons.length; j++) {
                    const lessonInfo = moduleData.lessons[j];

                    // Generate rich lesson content
                    const contentPrompt = `Write the FULL detailed content for the lesson "${lessonInfo.title}" 
which is part of the module "${moduleData.title}" in the course "${courseData.title}".

REQUIREMENTS:
- Content length: 500-800 words
- Format: RICH MARKDOWN
- Use ## Headers, **Bold**, bullet points, numbered lists
- Tone: Professional, engaging, educational

STRUCTURE:
## Introduction
Brief overview of what will be learned.

## Core Concepts
Main educational content with detailed explanations.

## Practical Example
A real-world example or code snippet.

## Key Takeaways
3-5 bullet points summarizing the lesson.

## Additional Resources
- Link to a relevant article or video

IMPORTANT: Return ONLY raw Markdown content, no JSON wrapper.`;

                    let lessonContent;
                    try {
                        const contentCompletion = await groq.chat.completions.create({
                            messages: [{ role: "user", content: contentPrompt }],
                            model: modelUsed,
                            temperature: 0.5
                        });
                        lessonContent = contentCompletion.choices[0]?.message?.content || '';
                    } catch (contentError) {
                        console.warn('Lesson content generation failed, using placeholder');
                        lessonContent = `## ${lessonInfo.title}

Welcome to this lesson on **${lessonInfo.title}**!

### What You'll Learn
In this lesson, you will explore the key concepts and practical applications related to ${lessonInfo.title}.

### Core Concepts
This lesson covers fundamental principles that will help you understand and apply ${lessonInfo.title} effectively.

### Key Takeaways
- Understanding the basics of ${lessonInfo.title}
- Practical applications you can use immediately
- Best practices and common patterns

### Next Steps
Continue to the next lesson to build on these concepts.`;
                    }

                    // Small delay to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 300));

                    const { error: lessonError } = await supabase
                        .from('lessons')
                        .insert({
                            module_id: module.id,
                            title: lessonInfo.title,
                            content: lessonContent,
                            duration: lessonInfo.duration,
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
