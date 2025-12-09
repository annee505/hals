import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import 'dotenv/config';

// NOTE: This script is intended to be run via 'node scripts/seedCourseContent.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const groqApiKey = process.env.VITE_GROQ_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !groqApiKey) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const groq = new Groq({ apiKey: groqApiKey });

const coursesToSeed = [
    { title: 'Python Programming Fundamentals', tags: ['Programming', 'Python'] },
    { title: 'Web Development Bootcamp', tags: ['Web Dev', 'HTML', 'CSS', 'JavaScript'] },
    { title: 'Personal Finance Mastery', tags: ['Finance', 'Budgeting'] },
    { title: 'Data Science with Python', tags: ['Data Science', 'Python', 'ML'] },
    { title: 'Machine Learning Basics', tags: ['AI', 'ML', 'Python'] },
    { title: 'React & Modern Frontend', tags: ['React', 'Frontend', 'JavaScript'] },
    { title: 'Full-Stack JavaScript', tags: ['Full-Stack', 'MERN', 'Node.js'] },
    { title: 'Digital Marketing 101', tags: ['Marketing', 'Business'] },
    { title: 'UX/UI Design Fundamentals', tags: ['Design', 'UX', 'UI'] },
    { title: 'Cybersecurity Essentials', tags: ['Security', 'Cybersecurity'] },
    { title: 'Cloud Computing with AWS', tags: ['Cloud', 'AWS'] },
    { title: 'Mobile App Development', tags: ['Mobile', 'App Dev'] },
    { title: 'Blockchain & Crypto', tags: ['Blockchain', 'Crypto'] },
    { title: 'Game Development with Unity', tags: ['Game Dev', 'Unity', 'C#'] },
    { title: 'Project Management Professional', tags: ['Business', 'Management'] },
    { title: 'Public Speaking Mastery', tags: ['Soft Skills', 'Communication'] },
    { title: 'Creative Writing Workshop', tags: ['Arts', 'Writing'] },
    { title: 'Photography Masterclass', tags: ['Arts', 'Photography'] },
    { title: 'Graphic Design for Beginners', tags: ['Design', 'Graphic Design'] },
    { title: 'Video Editing with Premiere Pro', tags: ['Media', 'Video Editing'] },
    { title: 'SEO & Content Marketing', tags: ['Marketing', 'SEO'] },
    { title: 'Social Media Strategy', tags: ['Marketing', 'Social Media'] },
    { title: 'Entrepreneurship 101', tags: ['Business', 'Startup'] },
    { title: 'Investing for Beginners', tags: ['Finance', 'Investing'] }
];

async function generateAndSeedCourse(courseTitle, tags) {
    console.log(`Generating content for: ${courseTitle}...`);

    try {
        // STEP 1: Generate Outline
        console.log(`Phase 1: Generating Outline for ${courseTitle}...`);
        const outlinePrompt = `Create a comprehensive, "World Class" learning course outline on "${courseTitle}".

        Generate a course structure with:
        - Course title and description
        - Difficulty level (Beginner/Intermediate/Advanced)
        - Estimated duration (e.g., "6 weeks")
        - 4 modules with descriptive titles and descriptions
        - 3-5 lessons per module (Just titles and durations)

        IMPORTANT: Respond ONLY with valid JSON matching this schema:
        {
          "title": "${courseTitle}",
          "description": "...",
          "difficulty": "...",
          "duration": "...",
          "modules": [
            {
              "title": "...",
              "description": "...",
              "lessons": [
                { "title": "...", "duration": "..." }
              ]
            }
          ]
        }`;

        const outlineCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: outlinePrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const outlineJson = outlineCompletion.choices[0]?.message?.content || "{}";
        const courseData = JSON.parse(outlineJson);

        // Insert Course & Modules
        let courseId;
        const { data: existingCourse } = await supabase
            .from('courses')
            .select('id')
            .eq('title', courseData.title)
            .single();

        if (existingCourse) {
            courseId = existingCourse.id;
            console.log(`Updating existing course structure: ${courseData.title}`);
        } else {
            const { data: newCourse, error } = await supabase
                .from('courses')
                .insert({
                    title: courseData.title,
                    description: courseData.description,
                    difficulty: courseData.difficulty,
                    duration: courseData.duration,
                    tags: tags,
                    image: 'coding'
                })
                .select()
                .single();

            if (error) throw error;
            courseId = newCourse.id;
        }

        // Clean up old modules/lessons to rebuild
        await supabase.from('modules').delete().eq('course_id', courseId);

        // STEP 2: Generate Content per Lesson
        for (let i = 0; i < courseData.modules.length; i++) {
            const mod = courseData.modules[i];
            const { data: moduleData, error: modError } = await supabase
                .from('modules')
                .insert({
                    course_id: courseId,
                    title: mod.title,
                    description: mod.description,
                    order_index: i
                })
                .select()
                .single();

            if (modError) throw modError;

            for (let j = 0; j < mod.lessons.length; j++) {
                const lesson = mod.lessons[j];
                console.log(`   Phase 2: Generating rich content for Lesson "${lesson.title}"...`);

                const contentPrompt = `Write the FULL TEXT content for the lesson "${lesson.title}" which is part of the module "${mod.title}" in the course "${courseTitle}".

                CRITICAL CONTENT REQUIREMENTS:
                - Content length: 600-1000 words. High depth.
                - Format: RICH MARKDOWN.
                - Use ## Headers, **Bold**, Lists.
                - Tone: Professional, engaging, and educational.
                - Structure:
                  1. Introduction
                  2. Core Deep Dive (Main content)
                  3. Real World Application / Example Code
                  4. Key Takeaways
                  5. Video Resource: Must include exactly ONE YouTube video link in format "Video Resource: [Watch on YouTube](URL)". Logic: Find a relevant youtube video URL for this topic.
                  6. External Resources: 2-3 links.

                IMPORTANT: Return ONLY the raw Markdown content string. Do not wrap in JSON. Just the markdown text.`;

                // Note: Not using JSON mode here to allow free-form markdown, but we can wrap it if needed. 
                // Actually, let's just ask for text.

                try {
                    const contentCompletion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: contentPrompt }],
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.5
                    });

                    const richContent = contentCompletion.choices[0]?.message?.content || "Content generation failed.";

                    await supabase
                        .from('lessons')
                        .insert({
                            module_id: moduleData.id,
                            title: lesson.title,
                            content: richContent,
                            duration: lesson.duration,
                            order_index: j
                        });

                    // Short delay to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (err) {
                    console.error(`Failed to generate lesson content for ${lesson.title}`, err);
                    // Fallback to basic
                    await supabase.from('lessons').insert({
                        module_id: moduleData.id,
                        title: lesson.title,
                        content: `## ${lesson.title}\n\nContent generation temporarily unavailable. Please refresh later.`,
                        duration: lesson.duration,
                        order_index: j
                    });
                }
            }
        }
        console.log(`Successfully seeded WORLD CLASS course: ${courseTitle}`);

    } catch (error) {
        console.error(`Error generating content for ${courseTitle}:`, error.message);
        console.log(`Using fallback mock content for ${courseTitle}...`);

        const courseData = {
            title: courseTitle,
            description: `A comprehensive course to master ${courseTitle}. Learn the fundamentals and advanced concepts in this structured learning path.`,
            difficulty: "Beginner",
            duration: "6 weeks",
            tags: tags,
            modules: [
                {
                    title: "Module 1: Introduction",
                    description: "Getting started with the basics.",
                    lessons: [
                        {
                            title: "Welcome to the Course",
                            content: `## Welcome to the Course
                            
We are thrilled to have you here! In this introductory lesson, we will cover the **goals and structure** of this course.

### What You Will Learn
* Comprehensive understanding of the core principles.
* Practical skills you can apply immediately.
* Best practices used by industry professionals.

**Key Takeaways:**
* This course is designed for all skill levels.
* You will build a real-world project by the end.

Video Resource: [Watch Introduction on YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)`,
                            duration: "10 min"
                        },
                        {
                            title: "Setting Up Your Environment",
                            content: `## Setting Up Your Environment

Success starts with the right tools. Let's get your workspace ready.

### Required Tools
1. **Code Editor**: We recommend VS Code.
2. **Terminal**: Any standard terminal will work.
3. **Node.js**: Ensure you have the latest LTS version.

> **Pro Tip:** Keep your environment clean and organized to boost productivity.

Video Resource: [Setup Guide](https://www.youtube.com/watch?v=fNj-Y_g6j2g)`,
                            duration: "20 min"
                        },
                        {
                            title: "Key Concepts",
                            content: `## Key Concepts Overview

Before diving deep, let's define the terminology.

### Core Terminology
* **Frontend**: What the user sees.
* **Backend**: The logic behind the scenes.
* **API**: How they talk to each other.

**Real World Application:**
Imagine a restaurant. The menu is the **Frontend**, the kitchen is the **Backend**, and the waiter is the **API**.

Video Resource: [Concepts Explained](https://www.youtube.com/watch?v=pTbSfCT48f0)`,
                            duration: "30 min"
                        }
                    ]
                },
                {
                    title: "Module 2: Core Fundamentals",
                    description: "Deep dive into the core topics.",
                    lessons: [
                        {
                            title: "Fundamental Topic 1",
                            content: `## Core Fundamentals: Part 1

This is where the magic happens. We will explore the building blocks of the technology.

### The Three Pillars
1. **Structure**: How things are organized.
2. **Style**: How things look.
3. **Logic**: How things work.

\`\`\`javascript
// Example Code
function learn(topic) {
  console.log("Mastering " + topic);
}
\`\`\`

Video Resource: [Deep Dive Video](https://www.youtube.com/watch?v=example)`,
                            duration: "45 min"
                        },
                        {
                            title: "Fundamental Topic 2",
                            content: `## Core Fundamentals: Part 2

Building on the previous lesson, we now look at **advanced interactions**.

### Why this matters
* **Performance**: Efficient code runs faster.
* **Scalability**: Good structure grows with you.

**Key Takeaways:**
* Always plan before you build.
* Test early and often.

Video Resource: [Advanced Concepts](https://www.youtube.com/watch?v=example)`,
                            duration: "45 min"
                        },
                        {
                            title: "Practical Exercises",
                            content: `## Hands-On Practice

Theory is great, but practice is better. Let's build something small.

### Challenge: Build a Counter
Create a simple counter that increments when you click a button.

**Steps:**
1. Create user interface.
2. Write the logic function.
3. Connect the two.

> "The only way to learn to code is to code."

Video Resource: [Code Along](https://www.youtube.com/watch?v=example)`,
                            duration: "60 min"
                        }
                    ]
                },
                {
                    title: "Module 3: Advanced Techniques",
                    description: "Moving to more advanced subjects.",
                    lessons: [
                        {
                            title: "Advanced Concept A",
                            content: `## Mastering Edge Cases

Professional developers know how to handle the unexpected.

### Common Pitfalls
* **Race Conditions**: When things happen out of order.
* **Memory Leaks**: Forgetting to clean up.

We will learn patterns to avoid these.

Video Resource: [Expert Tips](https://www.youtube.com/watch?v=example)`,
                            duration: "50 min"
                        },
                        {
                            title: "Optimization Strategies",
                            content: `## Speed & Performance

Nobody likes a slow app.

### Optimization Checklist
* [ ] Minify your code.
* [ ] Optimize images.
* [ ] Use lazy loading.

**Real World Application:**
Amazon found that every 100ms of latency cost them 1% in sales. Speed matters!

Video Resource: [Performance Guide](https://www.youtube.com/watch?v=example)`,
                            duration: "40 min"
                        }
                    ]
                },
                {
                    title: "Module 4: Final Project",
                    description: "Applying what you've learned.",
                    lessons: [
                        {
                            title: "Project Planning",
                            content: `## Planning Your Masterpiece

Don't write code yet! First, we plan.

### The Blueprint
1. **User Stories**: Who is this for?
2. **Wireframes**: What does it look like?
3. **Tech Stack**: What tools will we use?

Video Resource: [Project Planning 101](https://www.youtube.com/watch?v=example)`,
                            duration: "30 min"
                        },
                        {
                            title: "Building the Project",
                            content: `## Build Phase

Time to put it all together.

**Milestones:**
* **Hour 1**: Setup and Basic Layout.
* **Hour 2**: Core Functionality.
* **Hour 3**: Styling and Polish.

You have all the skills needed to complete this. Good luck!

Video Resource: [Live Build](https://www.youtube.com/watch?v=example)`,
                            duration: "120 min"
                        },
                        {
                            title: "Course Conclusion",
                            content: `## Congratulations! 🎓

You have completed the course!

### What's Next?
* **Build Portfolio**: Show off your project.
* **Network**: Join communities.
* **Keep Learning**: Technology never stops changing.

**Certificate**:
To get your certificate, go back to the course page and click "Download Certificate".

Video Resource: [Final Words](https://www.youtube.com/watch?v=example)`,
                            duration: "15 min"
                        }
                    ]
                }
            ]
        };

        try {
            // Insert into Supabase (Fallback)
            // 1. Check if course exists or create new
            let courseId;
            const { data: existingCourse } = await supabase
                .from('courses')
                .select('id')
                .eq('title', courseData.title)
                .single();

            if (existingCourse) {
                courseId = existingCourse.id;
                console.log(`Updating existing course (fallback): ${courseData.title}`);
            } else {
                const { data: newCourse, error } = await supabase
                    .from('courses')
                    .insert({
                        title: courseData.title,
                        description: courseData.description,
                        difficulty: courseData.difficulty,
                        duration: courseData.duration,
                        tags: courseData.tags,
                        image: 'coding' // Default image
                    })
                    .select()
                    .single();

                if (error) throw error;
                courseId = newCourse.id;
            }

            // 2. Create Modules and Lessons
            // First, delete existing modules to avoid duplicates if re-running
            await supabase.from('modules').delete().eq('course_id', courseId);

            for (let i = 0; i < courseData.modules.length; i++) {
                const mod = courseData.modules[i];
                const { data: moduleData, error: modError } = await supabase
                    .from('modules')
                    .insert({
                        course_id: courseId,
                        title: mod.title,
                        description: mod.description,
                        order_index: i
                    })
                    .select()
                    .single();

                if (modError) throw modError;

                for (let j = 0; j < mod.lessons.length; j++) {
                    const lesson = mod.lessons[j];
                    await supabase
                        .from('lessons')
                        .insert({
                            module_id: moduleData.id,
                            title: lesson.title,
                            content: lesson.content,
                            duration: lesson.duration,
                            order_index: j
                        });
                }
            }
            console.log(`Successfully seeded (fallback): ${courseTitle}`);
        } catch (dbError) {
            console.error(`Error saving fallback for ${courseTitle}:`, dbError);
        }
    }
}

async function seedAll() {
    console.log('Starting database seed...');
    for (const course of coursesToSeed) {
        await generateAndSeedCourse(course.title, course.tags);
        // Add a small delay to avoid hitting rate limits too hard
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('Seeding complete!');
}

seedAll();
