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
    const encodedTitle = encodeURIComponent(lessonTitle);
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
1. **Foundation** — Understanding basics gives you a solid start
2. **Practice** — Regular practice reinforces learning
3. **Application** — Real-world application cements knowledge

### 💻 Code Example
\`\`\`javascript
// Example for ${lessonTitle}
function example() {
    console.log("Learning: ${lessonTitle}");
    return "Mastering " + "${lessonTitle}";
}
example();
\`\`\`

### ✅ Key Takeaways
- ${lessonTitle} is essential for building a foundation
- Practice regularly to reinforce understanding
- Apply what you learn to real projects
- Revisit this lesson as needed

### 📺 Recommended Videos
- [${lessonTitle} — Full Tutorial](https://www.youtube.com/results?search_query=${encodedTitle}+full+tutorial)
- [${lessonTitle} — Explained Simply](https://www.youtube.com/results?search_query=${encodedTitle}+explained+for+beginners)

### 🔗 Curated Resources
- [${lessonTitle} — Wikipedia](https://en.wikipedia.org/wiki/${encodedTitle})
- [${lessonTitle} — Google Scholar](https://scholar.google.com/scholar?q=${encodedTitle})`;
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

// Learning style instruction mappings
function getStyleInstructions(style) {
    const instructions = {
        visual: `LEARNING STYLE: Visual
- Include diagrams described in text (ASCII art or markdown tables to illustrate concepts)
- Reference video tutorials and visual resources frequently
- Use analogies and visual metaphors to explain concepts
- Add "📺 Watch" sections with YouTube search links for key topics
- Structure content with clear visual hierarchy using headers, bullets, and bold text
- Include flowcharts or step-by-step visual breakdowns where applicable`,

        auditory: `LEARNING STYLE: Auditory
- Include "🎧 Listen" sections with podcast or audio resource recommendations
- Add discussion prompts and questions the learner can talk through
- Write in a conversational, narrative tone as if explaining to someone verbally
- Include "Explain it to a friend" exercises
- Suggest recording yourself explaining concepts as a study technique
- Add debate-style "Consider both sides" sections for complex topics`,

        reading: `LEARNING STYLE: Reading/Writing
- Provide detailed, in-depth written explanations (longer than usual)
- Include "📝 Notes" sections with key definitions and summaries
- Add written exercises like "Write a summary of..." or "Document how..."
- Use structured outlines and numbered lists extensively
- Include a glossary of key terms at the end
- Suggest journaling or note-taking exercises`,

        kinesthetic: `LEARNING STYLE: Kinesthetic (Hands-on)
- Include "🛠️ Try It" hands-on exercises after every major concept
- Add mini-projects and coding challenges throughout
- Use "build along" step-by-step instructions
- Include "Experiment" sections encouraging learners to modify and break things
- Focus on learning by doing rather than reading
- Add real-world application scenarios the learner can physically work through`
    };
    return instructions[style] || instructions.visual;
}

function getPaceAndDepthInstructions(pace, depth) {
    let instructions = '';

    // Pace instructions
    const paceMap = {
        intensive: 'PACE: Intensive — Pack lessons densely with content. Assume daily study sessions of 45-60 minutes. Move quickly between concepts.',
        balanced: 'PACE: Balanced — Structure for 3-4 study sessions per week, 30-40 minutes each. Include brief recaps at the start of each lesson.',
        relaxed: 'PACE: Relaxed — Keep lessons shorter and more digestible. Assume 1-2 sessions per week. Include more review and reinforcement.'
    };
    instructions += (paceMap[pace] || paceMap.balanced) + '\n';

    // Depth instructions
    const depthMap = {
        overview: 'DEPTH: Quick Overview — Focus on key takeaways and practical application. Skip deep theory. Keep explanations concise.',
        standard: 'DEPTH: Standard — Balance theory and practice. Explain the "why" behind concepts but keep it accessible.',
        deep: 'DEPTH: Deep Dive — Include thorough theoretical foundations, edge cases, history, and advanced nuances. Assume the learner wants mastery.'
    };
    instructions += depthMap[depth] || depthMap.standard;

    return instructions;
}

export const aiCourseGenerator = {
    generateCourse: async (userGoal, preferences = {}) => {
        const { learningStyle, pace, contentDepth } = preferences;
        const styleHint = learningStyle ? `\nThe learner prefers a ${learningStyle} learning style. Tailor module and lesson titles to emphasize ${learningStyle === 'visual' ? 'visual examples, demos, and diagrams' : learningStyle === 'auditory' ? 'discussions, explanations, and audio' : learningStyle === 'reading' ? 'reading, writing, and documentation' : 'hands-on projects and practical exercises'}.` : '';
        const paceHint = pace === 'intensive' ? '\nDesign for intensive daily study — make lessons dense and challenging.' : pace === 'relaxed' ? '\nDesign for a relaxed pace — keep lessons shorter and include more review.' : '';

        try {
            const outlinePrompt = `Create a comprehensive learning course on "${userGoal}".
Generate a course with 4 modules, 4 lessons each.${styleHint}${paceHint}
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

                    // Generate lesson content with learning style awareness
                    const styleBlock = getStyleInstructions(learningStyle);
                    const paceBlock = getPaceAndDepthInstructions(pace, contentDepth);

                    const contentPrompt = `Write a comprehensive 600+ word lesson for "${lesson.title}" in the course "${courseData.title}".

${styleBlock}

${paceBlock}

STRUCTURE YOUR CONTENT LIKE THIS:

## Introduction
Brief overview of what will be covered.

## Learning Objectives
- Bullet points of what learners will achieve

## Core Concepts
Detailed explanation with examples. Where it helps understanding, include a **markdown table** to show timelines, comparisons, or evolution of ideas. For example, a table with columns like | Era | Key Figures | Characteristics |. NEVER use ASCII art, box-drawing characters, or text-based diagrams — always use proper markdown tables instead. Use headers, bold, blockquotes, and bullet lists for structure.

## Code Example (if applicable)
\`\`\`javascript
// Working code example
\`\`\`

## Key Takeaways
- Summary bullets

## 📺 Recommended Videos
Recommend 2-3 SPECIFIC, well-known YouTube videos that are genuinely useful for learning "${lesson.title}".
For each video, provide:
- The EXACT video title as it appears on YouTube
- The channel name
- A brief note on why it's helpful (1 sentence)

Format each video as a link using this pattern:
[Video Title — Channel Name](https://www.youtube.com/results?search_query=EXACT+VIDEO+TITLE+CHANNEL+NAME)

EXAMPLE (do not use this, pick REAL videos for the topic):
[JavaScript Crash Course for Beginners — Traversy Media](https://www.youtube.com/results?search_query=JavaScript+Crash+Course+for+Beginners+Traversy+Media)

Pick videos from well-known educational channels relevant to this subject area. These should be REAL videos you are confident exist.

## 🔗 Curated Resources
Provide 3-4 resource links using ONLY these safe URL patterns that are guaranteed to work:

1. **Wikipedia**: [Topic Name — Wikipedia](https://en.wikipedia.org/wiki/TOPIC_WITH_UNDERSCORES)
2. **Google Scholar**: [Research on Topic — Google Scholar](https://scholar.google.com/scholar?q=URL+ENCODED+TOPIC)
3. **YouTube Search**: [Topic tutorials — YouTube](https://www.youtube.com/results?search_query=URL+ENCODED+TOPIC)

Then add 1-2 links ONLY from these domains using their ACTUAL known URL patterns:
- MDN: https://developer.mozilla.org/en-US/docs/...
- Wikipedia: https://en.wikipedia.org/wiki/...
- Khan Academy: https://www.khanacademy.org/...
- Britannica: https://www.britannica.com/topic/...

CRITICAL: Do NOT invent or guess URLs. If you are not 100% certain a URL exists, use a search query link instead (YouTube search, Google Scholar search). Never fabricate article URLs.

Use rich Markdown formatting throughout — headers, bold, tables, bullet lists, blockquotes.`;

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
