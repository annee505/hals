
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import 'dotenv/config';

// NOTE: This script is intended to be run via 'node scripts/seedPythonOnly.js'

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
    { title: 'Python Programming Fundamentals', tags: ['Programming', 'Python'] }
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
    }
}

async function seedAll() {
    console.log('Starting Python database seed...');
    for (const course of coursesToSeed) {
        await generateAndSeedCourse(course.title, course.tags);
    }
    console.log('Seeding complete!');
}

seedAll();
