import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase-config';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();

// Groq models to try
const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant'
];

// Generate local course when all APIs fail — make titles topic-aware
function generateLocalCourse(userGoal) {
    const goal = userGoal.trim();
    return {
        title: `${goal}`,
        description: `A structured learning path to help you understand and master ${goal}. Covers foundations through advanced topics with curated resources and exercises.`,
        difficulty: "Beginner",
        duration: "6 weeks",
        tags: goal.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)),
        modules: [
            {
                title: `Foundations of ${goal}`,
                description: `Core concepts and historical background of ${goal}`,
                lessons: [
                    { title: `Introduction to ${goal}`, duration: "15 min" },
                    { title: `History and Origins of ${goal}`, duration: "20 min" },
                    { title: `Key Figures in ${goal}`, duration: "25 min" },
                    { title: `Fundamental Principles of ${goal}`, duration: "30 min" }
                ]
            },
            {
                title: `Core Topics in ${goal}`,
                description: `Deep exploration of major themes within ${goal}`,
                lessons: [
                    { title: `Major Movements and Developments in ${goal}`, duration: "25 min" },
                    { title: `Cultural and Social Impact of ${goal}`, duration: "30 min" },
                    { title: `Influential Works and Milestones in ${goal}`, duration: "25 min" },
                    { title: `Debates and Perspectives on ${goal}`, duration: "30 min" }
                ]
            },
            {
                title: `${goal} in Practice`,
                description: `Applied understanding and real-world connections`,
                lessons: [
                    { title: `${goal} in the Modern World`, duration: "30 min" },
                    { title: `Case Studies in ${goal}`, duration: "35 min" },
                    { title: `Comparative Analysis: ${goal} Across Regions`, duration: "30 min" },
                    { title: `Research Methods for ${goal}`, duration: "30 min" }
                ]
            },
            {
                title: `Advanced ${goal}`,
                description: `Deeper analysis and independent exploration`,
                lessons: [
                    { title: `Advanced Topics in ${goal}`, duration: "30 min" },
                    { title: `Critical Analysis of ${goal}`, duration: "35 min" },
                    { title: `Future Directions in ${goal}`, duration: "25 min" },
                    { title: `Capstone: Your ${goal} Journey`, duration: "40 min" }
                ]
            }
        ]
    };
}

// Generate lesson content locally — provide real structure with resource links
function generateLocalLessonContent(lessonTitle, moduleName, courseName) {
    const encodedTitle = encodeURIComponent(lessonTitle);
    const encodedCourse = encodeURIComponent(courseName);
    const wikiTitle = lessonTitle.replace(/\s+/g, '_');
    const wikiCourse = courseName.replace(/\s+/g, '_');
    return `## ${lessonTitle}

This lesson is part of **${moduleName}** in the course **${courseName}**.

---

### 🎯 Learning Objectives
- Explore the key aspects of **${lessonTitle}** and its significance within ${courseName}
- Understand the historical context, major developments, and influential figures related to this topic
- Build connections between this topic and the broader themes of the course

---

### 📖 Getting Started

To build a strong foundation for this topic, start with these authoritative sources:

| Resource | Description |
|----------|-------------|
| [${lessonTitle} — Wikipedia](https://en.wikipedia.org/wiki/${wikiTitle}) | Overview and historical context |
| [${courseName} — Wikipedia](https://en.wikipedia.org/wiki/${wikiCourse}) | Broader course context |
| [${lessonTitle} — Britannica](https://www.britannica.com/search?query=${encodedTitle}) | In-depth encyclopedia article |

---

### 📺 Video Resources

Watch these to deepen your understanding:

- [${lessonTitle} — Documentary](https://www.youtube.com/results?search_query=${encodedTitle}+documentary)
- [${lessonTitle} — Explained](https://www.youtube.com/results?search_query=${encodedTitle}+explained)
- [${courseName} — Full Course](https://www.youtube.com/results?search_query=${encodedCourse}+full+course)

---

### 🔍 Research & Further Reading

- [Academic papers on ${lessonTitle}](https://scholar.google.com/scholar?q=${encodedTitle})
- [${courseName} research](https://scholar.google.com/scholar?q=${encodedCourse})

---

### ✅ Study Activities

1. **Read** the Wikipedia article on ${lessonTitle} and note 3 key facts you learned
2. **Watch** at least one video from the recommended list above
3. **Reflect**: How does ${lessonTitle} connect to what you already know about ${courseName}?
4. **Research**: Find one additional source about this topic and summarize it in your notes

> 💡 *Use the Notes feature (📝 button in the header) to save your thoughts and key takeaways as you study.*`;
}

// Try to generate with Gemini
async function tryGemini(prompt) {
    if (!geminiApiKey) {
        console.warn('Gemini: no API key configured');
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('Gemini: success, got', text.length, 'chars');
        return text;
    } catch (error) {
        console.error('Gemini FAILED:', error.message, error);
        return null;
    }
}

// Try to generate with OpenRouter (free tier models)
const OPENROUTER_MODELS = [
    'meta-llama/llama-4-maverick:free',
    'google/gemma-3-27b-it:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'nvidia/llama-3.1-nemotron-nano-8b-v1:free'
];

export async function tryOpenRouter(prompt, jsonMode = false) {
    if (!openRouterApiKey) {
        console.warn('OpenRouter: no API key configured');
        return null;
    }

    for (const model of OPENROUTER_MODELS) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://hals-platform.vercel.app',
                    'X-Title': 'HALS Learning Platform'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    ...(jsonMode && { response_format: { type: 'json_object' } })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn(`OpenRouter ${model} failed: ${data.error?.message || response.statusText} (${response.status})`);
                continue;
            }

            const text = data.choices?.[0]?.message?.content;
            if (text) {
                console.log(`OpenRouter ${model}: success, got ${text.length} chars`);
                return text;
            }
        } catch (error) {
            console.error(`OpenRouter ${model} FAILED:`, error.message);
            continue;
        }
    }

    console.error('OpenRouter: ALL models failed');
    return null;
}

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Keep track of models that have hit rate limits in this session
const deadModels = new Set();

export async function tryGroq(prompt, jsonMode = false) {
    if (!groqApiKey) {
        console.warn('Groq: no API key configured');
        return null;
    }

    // Helper to make request with retries
    const makeGroqRequest = async (model, retries = 2) => {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    model: model,
                    response_format: jsonMode ? { type: "json_object" } : undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle Rate Limiting (429)
                if (response.status === 429) {
                    if (retries > 0) {
                        const waitTime = 2000;
                        console.warn(`Groq ${model} 429 Rate Limit. Waiting ${waitTime}ms... (${retries} retries left)`);
                        await delay(waitTime);
                        return makeGroqRequest(model, retries - 1);
                    } else {
                        // After retries exhausted, mark as dead for this session
                        console.error(`Groq ${model} Rate Limit Exceeded. Marking as dead for this session.`);
                        deadModels.add(model);
                    }
                }
                throw new Error(`${data.error?.message || response.statusText} (${response.status})`);
            }

            return data.choices[0]?.message?.content || null;

        } catch (error) {
            console.error(`Groq ${model} FAILED:`, error.message);
            throw error;
        }
    };

    for (const model of GROQ_MODELS) {
        if (deadModels.has(model)) {
            // console.warn(`Skipping dead model: ${model}`); // verbose
            continue;
        }

        try {
            const text = await makeGroqRequest(model);
            if (text) {
                console.log(`Groq ${model}: success`);
                return text;
            }
        } catch (error) {
            // Already logged
            continue; // Try next model
        }
    }

    console.error('Groq: ALL models failed');
    return null;
}

// Learning style instruction mappings
function getStyleInstructions(style) {
    const instructions = {
        visual: `LEARNING STYLE: Visual
- Include "Mermaid" diagrams (using \`\`\`mermaid code blocks) to illustrate concepts
- Reference video tutorials and visual resources frequently
- Use analogies and visual metaphors to explain concepts
- Add "📺 Watch" sections with YouTube search links for key topics
- Structure content with clear visual hierarchy using headers, bullets, and bold text
- Include markdown tables for comparisons`,

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
    generateCourse: async (userGoal, preferences = {}, onProgress = null) => {
        const report = (msg) => { if (onProgress) onProgress(msg); };
        const { learningStyle, pace, contentDepth } = preferences;
        const styleHint = learningStyle ? `\nThe learner prefers a ${learningStyle} learning style. Tailor module and lesson titles to emphasize ${learningStyle === 'visual' ? 'visual examples, demos, and diagrams' : learningStyle === 'auditory' ? 'discussions, explanations, and audio' : learningStyle === 'reading' ? 'reading, writing, and documentation' : 'hands-on projects and practical exercises'}.` : '';
        const paceHint = pace === 'intensive' ? '\nDesign for intensive daily study — make lessons dense and challenging.' : pace === 'relaxed' ? '\nDesign for a relaxed pace — keep lessons shorter and include more review.' : '';

        try {
            const outlinePrompt = `Create a comprehensive learning course on "${userGoal}".
Generate a course with 3 modules, 3 lessons each.${styleHint}${paceHint}
RESPOND ONLY WITH JSON:
{
  "title": "Course Title",
  "description": "Description",
  "difficulty": "Beginner",
  "duration": "6 weeks",
  "tags": ["tag1", "tag2"],
  "modules": [{"title": "Module", "description": "Desc", "lessons": [{"title": "Lesson", "duration": "15 min"}]}]
}`;

            // Try Groq first, then Gemini, then OpenRouter, then local
            let courseData = null;
            let responseText = await tryGroq(outlinePrompt, true);

            if (!responseText) {
                console.log('Groq failed, trying Gemini...');
                responseText = await tryGemini(outlinePrompt + "\nRespond ONLY with valid JSON, no markdown.");
            }

            if (!responseText) {
                console.log('Gemini failed, trying OpenRouter...');
                report('🔄 Trying backup AI provider...');
                responseText = await tryOpenRouter(outlinePrompt + "\nRespond ONLY with valid JSON, no markdown.", true);
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
                report('⚠️ AI unavailable — using structured template...');
                console.log('All AI failed, using local template...');
                courseData = generateLocalCourse(userGoal);
            } else {
                report('✅ Course outline generated by AI');
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

                    const contentPrompt = `Write a comprehensive, FACTUALLY RICH 600+ word lesson on "${lesson.title}" in the course "${courseData.title}".

CRITICAL RULES:
- Write REAL, SUBSTANTIVE content with actual facts, dates, names, and details about the topic.
- Do NOT write generic filler like "this topic is important" or "practice makes perfect".
- Every paragraph must contain SPECIFIC, factual information directly about "${lesson.title}".
- Only include a Code Example section if the course is about programming, software development, or a technical coding topic. If the course is about history, music, art, science, business, or any non-programming topic, do NOT include any code blocks at all.
- Use markdown tables where appropriate (timelines, comparisons, etc.). NEVER use ASCII art or box-drawing characters.
- For visual diagrams, use fenced Mermaid code blocks. CRITICAL Mermaid rules:
  - Always start with a diagram type on the FIRST line: graph TD, graph LR, flowchart TD, sequenceDiagram, classDiagram, etc.
  - Always quote node labels that contain spaces or special characters: A["Node Label Here"]
  - Use simple arrow syntax: A --> B or A -->|"label"| B
  - Do NOT use parentheses () in node IDs. Use square brackets [] for labels.
  - Keep diagrams SIMPLE: max 8-10 nodes.
  - Example format:
    ${'```'}mermaid
    graph TD
      A["Start Here"] --> B["Step Two"]
      B --> C["Step Three"]
      C --> D["Final Step"]
    ${'```'}

${styleBlock}

${paceBlock}

STRUCTURE YOUR CONTENT LIKE THIS:

## Introduction
A substantive overview with real context about the topic — mention key figures, time periods, or foundational ideas.

## Learning Objectives
- Specific, topic-relevant bullets about what learners will understand

## Core Concepts
Detailed, fact-rich explanation. Use real names, dates, events, examples. Include a **markdown table** if it helps illustrate timelines, comparisons, or categories. Use headers, bold, blockquotes, and bullet lists for structure.

## Practical Application
How this knowledge applies in real-world contexts — analysis exercises, discussion questions, or hands-on activities relevant to the subject.

## Key Takeaways
- Specific summary bullets that reference actual content covered

## 📺 Recommended Videos
Recommend 2-3 SPECIFIC, well-known YouTube videos that are genuinely useful for learning "${lesson.title}".
For each video, provide:
- The EXACT video title as it appears on YouTube
- The channel name
- A brief note on why it's helpful (1 sentence)

Format each video as a link using this pattern:
[Video Title — Channel Name](https://www.youtube.com/results?search_query=EXACT+VIDEO+TITLE+CHANNEL+NAME)

Pick videos from well-known educational channels relevant to this subject area.

## 🔗 Curated Resources
Provide 3-4 resource links using ONLY these safe URL patterns:

1. **Wikipedia**: [Topic Name — Wikipedia](https://en.wikipedia.org/wiki/TOPIC_WITH_UNDERSCORES)
2. **Google Scholar**: [Research on Topic — Google Scholar](https://scholar.google.com/scholar?q=URL+ENCODED+TOPIC)
3. **YouTube Search**: [Topic tutorials — YouTube](https://www.youtube.com/results?search_query=URL+ENCODED+TOPIC)

Then add 1-2 links ONLY from these domains using their ACTUAL known URL patterns:
- Wikipedia: https://en.wikipedia.org/wiki/...
- Khan Academy: https://www.khanacademy.org/...
- Britannica: https://www.britannica.com/topic/...

CRITICAL: Do NOT invent or guess URLs. Use search query links if unsure.

Use rich Markdown formatting throughout — headers, bold, tables, bullet lists, blockquotes.`;

                    report(`📖 Generating ${mod.title} — Lesson ${j + 1}/${mod.lessons.length}...`);

                    let content = await tryGroq(contentPrompt);
                    if (!content) {
                        content = await tryGemini(contentPrompt);
                    }
                    if (!content) {
                        content = await tryOpenRouter(contentPrompt);
                    }
                    if (!content) {
                        console.warn(`AI content generation failed for lesson "${lesson.title}" — using resource-based fallback`);
                        content = generateLocalLessonContent(lesson.title, mod.title, courseData.title);
                        report(`⚠️ AI failed for "${lesson.title}" — used fallback`);
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
