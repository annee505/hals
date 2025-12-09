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

// Fallback function when AI API hits rate limits
function generateLocalCourse(userGoal) {
    return {
        title: `Master ${userGoal}`,
        description: `A comprehensive course designed to help you master ${userGoal}. This structured learning path covers fundamentals to advanced topics, with practical exercises and real-world applications.`,
        difficulty: "Beginner",
        duration: "6 weeks",
        tags: [userGoal.split(' ')[0], "Learning", "Skills"],
        modules: [
            {
                title: "Getting Started",
                description: `Introduction to ${userGoal} fundamentals`,
                lessons: [
                    { title: `What is ${userGoal}?`, duration: "15 min" },
                    { title: "Setting Up Your Environment", duration: "20 min" },
                    { title: "Key Concepts Overview", duration: "25 min" },
                    { title: "Your First Project", duration: "30 min" }
                ]
            },
            {
                title: "Core Fundamentals",
                description: `Deep dive into ${userGoal} basics`,
                lessons: [
                    { title: "Understanding the Basics", duration: "25 min" },
                    { title: "Common Patterns", duration: "30 min" },
                    { title: "Best Practices", duration: "25 min" },
                    { title: "Practical Exercises", duration: "40 min" }
                ]
            },
            {
                title: "Intermediate Techniques",
                description: `Building on your ${userGoal} skills`,
                lessons: [
                    { title: "Advanced Concepts", duration: "30 min" },
                    { title: "Problem Solving", duration: "35 min" },
                    { title: "Real-World Applications", duration: "30 min" },
                    { title: "Case Study", duration: "45 min" }
                ]
            },
            {
                title: "Mastery & Projects",
                description: `Becoming proficient in ${userGoal}`,
                lessons: [
                    { title: "Final Project Planning", duration: "20 min" },
                    { title: "Building the Project", duration: "60 min" },
                    { title: "Review & Optimization", duration: "30 min" },
                    { title: "Next Steps & Resources", duration: "15 min" }
                ]
            }
        ]
    };
}

// Generate rich local lesson content
function generateLocalLessonContent(lessonTitle, moduleName, courseName) {
    return `## ${lessonTitle}

Welcome to this lesson on **${lessonTitle}**! This is part of the "${moduleName}" module in our "${courseName}" course.

### 📚 Introduction

In this lesson, you will learn the essential concepts and practical applications of ${lessonTitle}. Understanding these fundamentals is crucial for your journey to mastering this subject.

### 🎯 Learning Objectives

By the end of this lesson, you will be able to:
- Understand the core principles of ${lessonTitle}
- Apply these concepts in real-world scenarios
- Build confidence in your abilities

### 📖 Core Concepts

${lessonTitle} is a fundamental topic that forms the foundation for more advanced concepts. Let's break it down:

**Key Points:**
1. **Foundation** - Understanding the basics gives you a solid starting point
2. **Practice** - Regular practice reinforces your learning
3. **Application** - Real-world application helps cement your knowledge

### 💻 Code Example

\`\`\`javascript
// Example code for ${lessonTitle}
function demonstrate${lessonTitle.replace(/\s+/g, '')}() {
    console.log("Learning: ${lessonTitle}");
    
    // Step 1: Initialize
    const topic = "${lessonTitle}";
    
    // Step 2: Process
    const result = \`Mastering \${topic}!\`;
    
    // Step 3: Output
    return result;
}

// Run the example
demonstrate${lessonTitle.replace(/\s+/g, '')}();
\`\`\`

### 📺 Video Resource

📺 [Watch: ${lessonTitle} Tutorial](https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle + ' tutorial')})

### ✅ Key Takeaways

- ${lessonTitle} is essential for building a strong foundation
- Practice regularly to reinforce your understanding
- Apply what you learn to real projects
- Don't hesitate to revisit this lesson as needed
- Connect with the community for additional support

### 🔗 External Resources

- [MDN Web Docs](https://developer.mozilla.org)
- [FreeCodeCamp](https://www.freecodecamp.org)
- [W3Schools](https://www.w3schools.com)

### ❓ Self-Assessment

> **Question:** What are the three key principles of ${lessonTitle}?
> 
> **Answer:** Foundation, Practice, and Application!

---

*Continue to the next lesson to build on these concepts.*`;
}

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
            let useLocalFallback = false;

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
                    console.warn(`Model ${model} failed:`, modelError.message);
                    if (model === MODELS[MODELS.length - 1]) {
                        // All models failed - use local fallback
                        console.log('All AI models failed, using local course template...');
                        useLocalFallback = true;
                        courseData = generateLocalCourse(userGoal);
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
                    const contentPrompt = `Write COMPREHENSIVE, WORLD-CLASS lesson content for "${lessonInfo.title}"
from the module "${moduleData.title}" in the course "${courseData.title}".

CRITICAL REQUIREMENTS - MUST INCLUDE ALL OF THESE:
1. LENGTH: 800-1200 words minimum
2. FORMAT: Rich Markdown with proper hierarchy

MANDATORY SECTIONS:

## Introduction
2-3 paragraphs explaining what this lesson covers and why it matters.

## Core Concepts
Detailed explanations with:
- **Bold** key terms
- Bullet points for lists
- Numbered steps for processes

## Code Example
\`\`\`javascript
// Include a real, working code example
// relevant to this lesson's topic
function example() {
  // Show practical implementation
}
\`\`\`

## Visual Learning
Include a relevant image using markdown:
![Diagram explaining ${lessonInfo.title}](https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800)

## Video Resource
**Must include a real YouTube video link:**
📺 [Watch: ${lessonInfo.title} Tutorial](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Practical Exercise
A hands-on task the learner should complete.

## Key Takeaways
- 5 bullet points summarizing the lesson
- Make them actionable

## External Resources
- [Resource 1](https://developer.mozilla.org)
- [Resource 2](https://www.freecodecamp.org)
- [Resource 3](https://www.w3schools.com)

## Quiz Yourself
> **Question:** Ask a review question about the content
> **Answer:** Provide the answer

IMPORTANT: Return ONLY raw Markdown content. Make it visually rich and engaging!`;

                    let lessonContent;

                    // If using local fallback, skip AI content generation
                    if (useLocalFallback) {
                        lessonContent = generateLocalLessonContent(lessonInfo.title, moduleData.title, courseData.title);
                    } else {
                        try {
                            const contentCompletion = await groq.chat.completions.create({
                                messages: [{ role: "user", content: contentPrompt }],
                                model: modelUsed,
                                temperature: 0.5
                            });
                            lessonContent = contentCompletion.choices[0]?.message?.content || '';
                        } catch (contentError) {
                            console.warn('Lesson content generation failed, using local content');
                            lessonContent = generateLocalLessonContent(lessonInfo.title, moduleData.title, courseData.title);
                        }
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
