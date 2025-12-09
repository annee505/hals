import 'dotenv/config';

async function listModels() {
    console.log("Testing Gemini API Key...");
    if (!process.env.VITE_GEMINI_API_KEY) {
        console.error("No API Key found in env!");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.VITE_GEMINI_API_KEY}`;
        console.log(`Fetching from: ${url.replace(process.env.VITE_GEMINI_API_KEY, 'HIDDEN_KEY')}`);

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error("Error details:", errorText);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log("\n✅ API Key Works! Available Models:");
            let foundCompatible = false;
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                    foundCompatible = true;
                }
            });
            if (!foundCompatible) console.warn("No models found that supporting 'generateContent'.");
        } else {
            console.error("Error listing models:", data);
        }

    } catch (error) {
        console.error("Error testing API:", error.message);
    }
}

listModels();
