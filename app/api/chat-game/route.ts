import { NextResponse } from 'next/server';
import { ArtStyle } from '@/lib/models/ArtStyle';
import { Genre } from '@/lib/models/Genre';

const MOODS = [
    'relax', 'focus', 'creativity', 'collaborate', 'grit', 'joy', 'curiosity', 'empathy', 'awe'
];
const SKILLS = [
    'problem solving', 'memory', 'logic', 'spatial reasoning', 'attention', 'pattern recognition', 'reaction time'
];

export async function POST(req: Request) {
    try {
        const { message, history = [], currentConfig = {} } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
        }

        // Fetch art styles and genres for context
        let artStyles: any[] = [];
        let genres: any[] = [];
        try {
            artStyles = await ArtStyle.findAll({ attributes: ['id', 'name', 'description'] });
            genres = await Genre.findAll({ attributes: ['id', 'name', 'description'] });
        } catch (dbErr) {
            console.error("DB error fetching styles/genres for chat context:", dbErr);
        }

        const artStyleListStr = artStyles.map(s => `- ID: "${s.id}", Name: "${s.name}", Description: "${s.description}"`).join('\n');
        const genreListStr = genres.map(g => `- ID: "${g.id}", Name: "${g.name}", Description: "${g.description}"`).join('\n');

        const systemPrompt = `You are the Skillprint AI Game Design Assistant, helping a user design a web game.
Your task is to analyze the user's latest message in the context of the chat history and the current game configurations, and return a JSON response containing updates to the game configuration and a conversational reply.

IMPORTANT - Response Format:
You MUST return ONLY a valid, parseable JSON object with the following structure, and nothing else (no markdown wrapping, no text before or after).
JSON Structure:
{
  "reply": "Friendly conversational markdown response to the user. Max 2-3 sentences. Explain what settings you updated or answer their questions. Keep it light, encouraging, and game-design focused. Refer to file names or symbol names with markdown links if applicable.",
  "updatedConfig": {
    "targetMode": "mood" or "skill" (if changed, otherwise omit or keep current),
    "targetValue": one of the valid values (if changed, otherwise omit or keep current),
    "artStyleId": matched art style ID from list or "" (to clear) or omit,
    "genreId": matched genre ID from list or "" (to clear) or omit,
    "parameters": [
      { "name": "paramName", "value": "paramValue" }
    ] (if user requested updating, adding, or removing parameters, provide the full list of parameters. Otherwise omit or keep current),
    "optionalPrompt": "Short summary of the user's design concept/instructions. Append or update based on user input."
  },
  "triggerGeneration": true/false (Set to true ONLY if the user is explicitly requesting to build, generate, update, compile, run the game, or apply modifications. E.g., 'let's build it', 'generate the game', 'make the changes', 'add a score counter'. If they are just brainstorming or asking questions, set to false).
}

Valid target modes and values:
- Modes: "mood", "skill"
- Valid Moods: ${MOODS.map(m => `"${m}"`).join(', ')}
- Valid Skills: ${SKILLS.map(s => `"${s}"`).join(', ')}

Available Art Styles to map:
${artStyleListStr || 'None available'}

Available Genres to map:
${genreListStr || 'None available'}

Current Game Configuration (use this as the base):
${JSON.stringify(currentConfig, null, 2)}
`;

        // Format history for Gemini contents
        const contents = history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        }));

        // Append the latest user message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const requestBody = {
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
                temperature: 0.2, // Low temperature for high JSON structure accuracy
                responseMimeType: "application/json"
            }
        };

        const geminiModelName = process.env.GAME_GENERATIVE_MODEL || 'gemini-3-flash-preview';
        let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${apiKey}`;

        let response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok && response.status === 404) {
            const fallbackModel = process.env.GAME_GENERATIVE_MODEL_FALLBACK || 'gemini-1.5-pro';
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`;
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("Empty response from Gemini API");
        }

        // Parse JSON
        let parsedResult;
        try {
            parsedResult = JSON.parse(responseText.trim());
        } catch (e) {
            // Attempt to extract JSON if markdown code blocks were generated
            const match = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
            if (match && match[1]) {
                parsedResult = JSON.parse(match[1].trim());
            } else {
                throw e;
            }
        }

        return NextResponse.json(parsedResult);
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: error.message || "An error occurred during chat processing" }, { status: 500 });
    }
}
