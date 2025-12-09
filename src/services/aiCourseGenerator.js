import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase-config';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Groq models to try
const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768',
    'llama3-70b-8192'
];

// Generate local course when all APIs fail
function generateLocalCourse(userGoal) {
    return {
        title: `Master ${userGoal}`,
        description: `A comprehensive course designed to help you master ${userGoal}. This structured learning path covers fundamentals to advanced topics.`,
        difficulty: "Beginner",
        duration: "6 weeks",
        tags: [userGoal.split(' ')[0], "Learning", "Skills"],
        modules: [
            {
                title: "Getting Started",
                description: `Introduction to ${userGoal}`,
                lessons: [
                    { title: `What is ${userGoal}?`, duration: "15 min" },
                    { title: "Setting Up", duration: "20 min" },
                    { title: "Key Concepts", duration: "25 min" },
                    { title: "First Project", duration: "30 min" }
                ]
            },
            {
                title: "Core Fundamentals",
                description: `Deep dive into ${userGoal}`,
                lessons: [
                    { title: "Understanding Basics", duration: "25 min" },
                    { title: "Common Patterns", duration: "30 min" },
                    { title: "Best Practices", duration: "25 min" },
                    { title: "Exercises", duration: "40 min" }
                ]
            },
            {
                title: "Intermediate",
                description: `Building ${userGoal} skills`,
                lessons: [
                    { title: "Advanced Concepts", duration: "30 min" },
                    { title: "Problem Solving", duration: "35 min" },
                    { title: "Real Applications", duration: "30 min" },
                    { title: "Case Study", duration: "45 min" }
                ]
            },
            {
                title: "Mastery",
                description: `Becoming proficient`,
                lessons: [
                    { title: "Project Planning", duration: "20 min" },
                    { title: "Building Project", duration: "60 min" },
                    { title: "Optimization", duration: "30 min" },
                    { title: "Next Steps", duration: "15 min" }
                ]
            }
        ]
    };
}

// Generate rich lesson content locally
function generateLocalLessonContent(lessonTitle, moduleName, courseName) {
    return `## ${lessonTitle}

Welcome to **${lessonTitle}**! Part of "${moduleName}" in "${courseName}".

### 📚 Introduction
This lesson covers essential concepts and practical applications of ${lessonTitle}.

### 🎯 Learning Objectives
- Understand core principles of ${lessonTitle}
- Apply concepts in real-world scenarios
- Build confidence in your abilities

### 📖 Core Concepts
**Key Points:**
1. **Foundation** - Understanding basics gives you a solid start
2. **Practice** - Regular practice reinforces learning
3. **Application** - Real-world application cements knowledge

### 💻 Code Example
\`\`\`javascript
// Example for ${lessonTitle}
function example() {
    console.log("Learning: ${lessonTitle}");
    return "Mastering " + "${lessonTitle}";
}
example();
\`\`\`

### 📺 Video Resource
📺 [Watch Tutorial](https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle)})

### ✅ Key Takeaways
- ${lessonTitle} is essential for building a foundation
- Practice regularly to reinforce understanding
- Apply what you learn to real projects
- Revisit this lesson as needed
- Connect with the community

### 🔗 External Resources
- [MDN Web Docs](https://developer.mozilla.org)
- [FreeCodeCamp](https://www.freecodecamp.org)
- [W3Schools](https://www.w3schools.com)

### ❓ Self-Assessment
> **Question:** What are the three key principles?
> **Answer:** Foundation, Practice, and Application!`;
}

// Try to generate with Gemini
async function tryGemini(prompt) {
    if (!geminiApiKey) return null;

    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.warn('Gemini failed:', error.message);
        return null;
    }
}

// Try to generate with Groq
async function tryGroq(prompt, jsonMode = false) {
    if (!groqApiKey) return null;

    const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });

    for (const model of GROQ_MODELS) {
        try {
            const options = {
                messages: [{ role: "user", content: prompt }],
                model: model,
                temperature: 0.5
            };
            if (jsonMode) {
                options.response_format = { type: "json_object" };
            }
            const completion = await groq.chat.completions.create(options);
            return completion.choices[0]?.message?.content;
        } catch (error) {
            console.warn(`Groq ${model} failed:`, error.message);
        }
    }
    return null;
}

export const aiCourseGenerator = {
    generateCourse: async (userGoal, preferences = {}) => {
        try {
            const outlinePrompt = `Create a comprehensive learning course on "${userGoal}".
Generate a course with 4 modules, 4 lessons each.
RESPOND ONLY WITH JSON:
{
  "title": "Course Title",
  "description": "Description",
  "difficulty": "Beginner",
  "duration": "6 weeks",
  "tags": ["tag1", "tag2"],
  "modules": [{"title": "Module", "description": "Desc", "lessons": [{"title": "Lesson", "duration": "15 min"}]}]
}`;

            // Try Groq first, then Gemini, then local
            let courseData = null;
            let responseText = await tryGroq(outlinePrompt, true);

            if (!responseText) {
                console.log('Groq failed, trying Gemini...');
                responseText = await tryGemini(outlinePrompt + "\nRespond ONLY with valid JSON, no markdown.");
            }

            if (responseText) {
                try {
                    // Clean markdown code blocks if present
                    let cleaned = responseText.trim();
                    if (cleaned.startsWith('```')) {
                        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '');
                    }
                    courseData = JSON.parse(cleaned);
                } catch (e) {
                    console.warn('Failed to parse AI response:', e);
                }
            }

            if (!courseData) {
                console.log('All AI failed, using local template...');
                courseData = generateLocalCourse(userGoal);
            }

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
                const mod = courseData.modules[i];

                const { data: moduleData, error: moduleError } = await supabase
                    .from('modules')
                    .insert({
                        course_id: course.id,
                        title: mod.title,
                        description: mod.description,
                        order_index: i
                    })
                    .select()
                    .single();

                if (moduleError) throw moduleError;

                for (let j = 0; j < mod.lessons.length; j++) {
                    const lesson = mod.lessons[j];

                    // Generate lesson content
                    const contentPrompt = `Write 600+ words lesson content for "${lesson.title}" in course "${courseData.title}".
Include: Introduction, Core Concepts, Code Example, Video link, Key Takeaways, External Resources.
Use rich Markdown formatting.`;

                    let content = await tryGroq(contentPrompt);
                    if (!content) {
                        content = await tryGemini(contentPrompt);
                    }
                    if (!content) {
                        content = generateLocalLessonContent(lesson.title, mod.title, courseData.title);
                    }

                    await supabase
                        .from('lessons')
                        .insert({
                            module_id: moduleData.id,
                            title: lesson.title,
                            content: content,
                            duration: lesson.duration,
                            order_index: j
                        });

                    // Small delay
                    await new Promise(r => setTimeout(r, 200));
                }
            }

            return course;
        } catch (error) {
            console.error('Course generation error:', error);
            throw error;
        }
    }
};
