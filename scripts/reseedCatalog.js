/**
 * reseedCatalog.js
 * 
 * Deletes all catalog (non-user-created) courses from Supabase and re-seeds
 * 24 fresh courses with AI-generated content and computed durations.
 *
 * Usage:
 *   node scripts/reseedCatalog.js
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const groqApiKey = process.env.VITE_GROQ_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !groqApiKey) {
    console.error('Missing environment variables. Ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GROQ_API_KEY are set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Duration helpers ──────────────────────────────────────────────────────────

function parseDurationToMinutes(str) {
    if (!str || typeof str !== 'string') return 0;
    const s = str.toLowerCase().trim();
    let total = 0;
    const hrMatch = s.match(/(\d+\.?\d*)\s*(?:hr|hrs|hour|hours)/);
    const minMatch = s.match(/(\d+\.?\d*)\s*(?:min|mins|minute|minutes)/);
    if (hrMatch) total += parseFloat(hrMatch[1]) * 60;
    if (minMatch) total += parseFloat(minMatch[1]);
    return Math.round(total);
}

function formatTotalDuration(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return 'Self-paced';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `~${mins} min`;
    if (mins === 0) return `~${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `~${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`;
}

// ─── Groq request helper ───────────────────────────────────────────────────────

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

async function groqRequest(prompt, jsonMode = false, retries = 3) {
    for (const model of GROQ_MODELS) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: prompt }],
                        model,
                        temperature: 0.5,
                        response_format: jsonMode ? { type: 'json_object' } : undefined
                    })
                });

                const data = await response.json();

                if (response.status === 429) {
                    const wait = 3000 * (attempt + 1);
                    console.warn(`  [Groq ${model}] Rate limit. Waiting ${wait}ms...`);
                    await new Promise(r => setTimeout(r, wait));
                    continue;
                }

                if (!response.ok) {
                    console.warn(`  [Groq ${model}] Error ${response.status}: ${data.error?.message}`);
                    break; // try next model
                }

                const text = data.choices?.[0]?.message?.content;
                if (text) return text;
            } catch (err) {
                console.warn(`  [Groq ${model}] Request failed: ${err.message}`);
            }
        }
    }
    return null;
}

// ─── Catalog definition ────────────────────────────────────────────────────────

const CATALOG = [
    { title: 'Python Programming Fundamentals', tags: ['Programming', 'Python'], image: 'coding', difficulty: 'Beginner' },
    { title: 'Web Development Bootcamp', tags: ['Web Dev', 'HTML', 'CSS', 'JavaScript'], image: 'web', difficulty: 'Beginner' },
    { title: 'Personal Finance Mastery', tags: ['Finance', 'Budgeting'], image: 'finance', difficulty: 'Beginner' },
    { title: 'Data Science with Python', tags: ['Data Science', 'Python', 'ML'], image: 'coding', difficulty: 'Intermediate' },
    { title: 'Machine Learning Basics', tags: ['AI', 'ML', 'Python'], image: 'coding', difficulty: 'Intermediate' },
    { title: 'React & Modern Frontend', tags: ['React', 'Frontend', 'JavaScript'], image: 'web', difficulty: 'Intermediate' },
    { title: 'Full-Stack JavaScript', tags: ['Full-Stack', 'MERN', 'Node.js'], image: 'web', difficulty: 'Intermediate' },
    { title: 'Digital Marketing 101', tags: ['Marketing', 'Business'], image: 'coding', difficulty: 'Beginner' },
    { title: 'UX/UI Design Fundamentals', tags: ['Design', 'UX', 'UI'], image: 'web', difficulty: 'Beginner' },
    { title: 'Cybersecurity Essentials', tags: ['Security', 'Cybersecurity'], image: 'coding', difficulty: 'Intermediate' },
    { title: 'Cloud Computing with AWS', tags: ['Cloud', 'AWS'], image: 'coding', difficulty: 'Intermediate' },
    { title: 'Mobile App Development', tags: ['Mobile', 'App Dev'], image: 'coding', difficulty: 'Intermediate' },
    { title: 'Blockchain & Web3 Fundamentals', tags: ['Blockchain', 'Crypto'], image: 'coding', difficulty: 'Beginner' },
    { title: 'Game Development with Unity', tags: ['Game Dev', 'Unity', 'C#'], image: 'coding', difficulty: 'Intermediate' },
    { title: 'Project Management Professional', tags: ['Business', 'Management'], image: 'finance', difficulty: 'Intermediate' },
    { title: 'Public Speaking Mastery', tags: ['Soft Skills', 'Communication'], image: 'coding', difficulty: 'Beginner' },
    { title: 'Creative Writing Workshop', tags: ['Arts', 'Writing'], image: 'coding', difficulty: 'Beginner' },
    { title: 'Photography Masterclass', tags: ['Arts', 'Photography'], image: 'coding', difficulty: 'Beginner' },
    { title: 'Graphic Design for Beginners', tags: ['Design', 'Graphic Design'], image: 'web', difficulty: 'Beginner' },
    { title: 'Video Editing with Premiere Pro', tags: ['Media', 'Video Editing'], image: 'web', difficulty: 'Beginner' },
    { title: 'SEO & Content Marketing', tags: ['Marketing', 'SEO'], image: 'coding', difficulty: 'Beginner' },
    { title: 'Social Media Strategy', tags: ['Marketing', 'Social Media'], image: 'coding', difficulty: 'Beginner' },
    { title: 'Entrepreneurship 101', tags: ['Business', 'Startup'], image: 'finance', difficulty: 'Beginner' },
    { title: 'Investing for Beginners', tags: ['Finance', 'Investing'], image: 'finance', difficulty: 'Beginner' }
];

// ─── Local fallback course structure ──────────────────────────────────────────

function localCourseStructure(title, difficulty) {
    return {
        title,
        description: `A comprehensive, structured course on ${title}. Progress from fundamentals to advanced topics with curated resources and hands-on exercises.`,
        difficulty,
        modules: [
            {
                title: `Foundations of ${title}`,
                description: `Core concepts and essential background`,
                lessons: [
                    { title: `Introduction to ${title}`, duration: '20 min' },
                    { title: `Key History and Context`, duration: '25 min' },
                    { title: `Core Principles and Frameworks`, duration: '30 min' },
                    { title: `Essential Tools and Setup`, duration: '20 min' }
                ]
            },
            {
                title: `Core Skills in ${title}`,
                description: `Deep dive into fundamental techniques`,
                lessons: [
                    { title: `Building Core Competency`, duration: '35 min' },
                    { title: `Common Patterns and Best Practices`, duration: '30 min' },
                    { title: `Real-World Application`, duration: '40 min' },
                    { title: `Troubleshooting and Problem Solving`, duration: '25 min' }
                ]
            },
            {
                title: `Advanced ${title}`,
                description: `Advanced techniques and capstone project`,
                lessons: [
                    { title: `Advanced Topics Overview`, duration: '30 min' },
                    { title: `Industry Case Studies`, duration: '35 min' },
                    { title: `Future Trends and Directions`, duration: '25 min' },
                    { title: `Capstone Project`, duration: '45 min' }
                ]
            }
        ]
    };
}

// ─── Generate lesson content ───────────────────────────────────────────────────

function localLessonContent(lessonTitle, moduleTitle, courseTitle) {
    return `## ${lessonTitle}

*Part of **${moduleTitle}** in the course **${courseTitle}**.*

---

### 🎯 Learning Objectives
- Understand the key aspects of **${lessonTitle}** and its role in ${courseTitle}
- Connect this topic to broader themes and real-world applications
- Build a foundation for more advanced study

---

### 📖 Core Concepts

${lessonTitle} is a foundational topic within ${courseTitle}. In this lesson, you will explore the essential ideas, techniques, and perspectives that make this subject meaningful.

Use the resources below to guide your learning. Take notes as you go and focus on understanding the "why" behind each concept.

---

### 🔗 Curated Resources

| Resource | Description |
|----------|-------------|
| [${lessonTitle} — Wikipedia](https://en.wikipedia.org/wiki/${lessonTitle.replace(/\s+/g, '_')}) | Overview and context |
| [Research on ${lessonTitle} — Google Scholar](https://scholar.google.com/scholar?q=${encodeURIComponent(lessonTitle)}) | Academic sources |
| [${courseTitle} — Britannica](https://www.britannica.com/search?query=${encodeURIComponent(courseTitle)}) | In-depth reference |

---

### ✅ Study Activities

1. **Read** the Wikipedia article on ${lessonTitle} and note 3 key facts
2. **Reflect**: How does ${lessonTitle} connect to overall themes of ${courseTitle}?
3. **Research**: Find one additional source and summarize it in your notes

> 💡 *Use the Notes feature (📝 button in the header) to save your key takeaways.*`;
}

async function generateLessonContent(lessonTitle, moduleTitle, courseTitle) {
    const prompt = `Write a substantive 500-700 word lesson on "${lessonTitle}" in the course "${courseTitle}" (module: "${moduleTitle}").

RULES:
- Include REAL facts, dates, names, and details about the topic
- Only include code blocks if the course is a programming/technical coding course
- Use rich Markdown: ## headers, **bold**, tables, bullet lists
- Structure: ## Introduction, ## Core Concepts, ## Practical Application, ## Key Takeaways

## 📺 Recommended Videos
List 2 real YouTube videos SPECIFICALLY about "${lessonTitle}".
Use ACTUAL video URLs https://www.youtube.com/watch?v=VIDEO_ID — not search queries.
Only list a video if you are confident the video ID exists.
Format: [Video Title — Channel](https://www.youtube.com/watch?v=VIDEO_ID)
If unsure of a video ID, omit it rather than fabricate.

## 🔗 Curated Resources
3 links using ONLY safe patterns:
- Wikipedia: https://en.wikipedia.org/wiki/Topic_Name
- Google Scholar: https://scholar.google.com/scholar?q=URL+encoded+query
- Britannica: https://www.britannica.com/search?query=URL+encoded+query

NEVER invent URLs. Return only Markdown text.`;

    const result = await groqRequest(prompt, false);
    return result || localLessonContent(lessonTitle, moduleTitle, courseTitle);
}

// ─── Main seeding logic ────────────────────────────────────────────────────────

async function seedCourse(courseDef) {
    const { title, tags, image, difficulty } = courseDef;
    console.log(`\n📚 Seeding: ${title}`);

    // Generate outline
    const outlinePrompt = `Create a learning course outline for "${title}".

CRITICAL: Do NOT use "Week 1", "Week 2" etc. as module titles. Use descriptive topic-based titles.

Generate 3 modules with 4 lessons each. For each lesson, estimate a realistic study time (e.g. "20 min", "35 min").

RESPOND ONLY WITH VALID JSON:
{
  "title": "${title}",
  "description": "...",
  "modules": [
    {
      "title": "Descriptive Module Title (NOT Week X)",
      "description": "...",
      "lessons": [
        { "title": "...", "duration": "25 min" }
      ]
    }
  ]
}`;

    let courseData;
    const outlineText = await groqRequest(outlinePrompt, true);

    if (outlineText) {
        try {
            let cleaned = outlineText.trim();
            if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '');
            courseData = JSON.parse(cleaned);
        } catch (e) {
            console.warn(`  ⚠ Failed to parse outline JSON for ${title}, using local fallback`);
        }
    }

    if (!courseData) {
        console.log(`  ⚠ Using local fallback structure for ${title}`);
        courseData = localCourseStructure(title, difficulty);
    }

    // Insert course record
    const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
            title: courseData.title || title,
            description: courseData.description,
            difficulty: difficulty,
            duration: 'Self-paced', // Will be updated after lessons are saved
            tags: tags,
            image: image,
            rating: parseFloat((4.3 + Math.random() * 0.6).toFixed(1)),
            enrolled_count: Math.floor(Math.random() * 800) + 50
        })
        .select()
        .single();

    if (courseError) {
        console.error(`  ✗ Failed to insert course: ${courseError.message}`);
        return;
    }

    console.log(`  ✓ Course inserted: ${course.id}`);

    let totalMinutes = 0;

    // Insert modules and lessons
    for (let i = 0; i < courseData.modules.length; i++) {
        const mod = courseData.modules[i];

        const { data: moduleData, error: modError } = await supabase
            .from('modules')
            .insert({
                course_id: course.id,
                title: mod.title,
                description: mod.description,
                order_index: i
            })
            .select()
            .single();

        if (modError) {
            console.error(`  ✗ Failed to insert module: ${modError.message}`);
            continue;
        }

        for (let j = 0; j < mod.lessons.length; j++) {
            const lesson = mod.lessons[j];
            console.log(`    📝 Lesson ${j + 1}/${mod.lessons.length}: ${lesson.title}`);

            const content = await generateLessonContent(lesson.title, mod.title, courseData.title || title);

            // Sum duration
            totalMinutes += parseDurationToMinutes(lesson.duration);

            const { error: lessonError } = await supabase
                .from('lessons')
                .insert({
                    module_id: moduleData.id,
                    title: lesson.title,
                    content: content,
                    duration: lesson.duration,
                    order_index: j
                });

            if (lessonError) {
                console.warn(`    ⚠ Failed to insert lesson: ${lessonError.message}`);
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 300));
        }
    }

    // Update course with computed duration
    const computedDuration = formatTotalDuration(totalMinutes);
    await supabase
        .from('courses')
        .update({ duration: computedDuration })
        .eq('id', course.id);

    console.log(`  ✓ Done. Total duration: ${computedDuration} (${totalMinutes} min)`);
}

async function main() {
    console.log('🗑️  Step 1: Deleting all catalog (non-user-created) courses...');

    // Delete all courses where created_by_user_id is null (seeded/catalog courses)
    const { data: toDelete, error: fetchError } = await supabase
        .from('courses')
        .select('id, title')
        .is('created_by_user_id', null);

    if (fetchError) {
        console.error('Failed to fetch courses:', fetchError.message);
        process.exit(1);
    }

    console.log(`  Found ${toDelete.length} catalog courses to delete`);

    if (toDelete.length > 0) {
        const ids = toDelete.map(c => c.id);
        const { error: deleteError } = await supabase
            .from('courses')
            .delete()
            .in('id', ids);

        if (deleteError) {
            console.error('Failed to delete courses:', deleteError.message);
            process.exit(1);
        }
        console.log(`  ✓ Deleted ${ids.length} catalog courses (enrollments cascade-deleted)`);
    }

    console.log(`\n🌱 Step 2: Seeding ${CATALOG.length} fresh courses...`);

    for (const courseDef of CATALOG) {
        await seedCourse(courseDef);
        // Brief pause between courses
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n✅ Catalog reseed complete!');

    // Verify
    const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Database now has ${count} total courses.`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
