import { NextResponse } from 'next/server';

const MODELS: Record<string, string[]> = {
  'Session': ['duration', 'score', 'telemetry_events'],
  'Game': ['priority', 'suggested_duration', 'total_players'],
  'SkillPrintProfile': ['total_sessions', 'total_time_played', 'avg_flow_score', 'flow_confidence'],
  'GameChunkAnalysis': ['processing_attempts', 'flow_llm_score', 'skill_llm_score'],
  'Survey': ['score', 'completion_time'],
  'Favorite': ['total_favorites', 'active_favorites'],
  'MoodData': ['relax', 'grit', 'focus', 'collaborate', 'empathy', 'creativity', 'joy', 'curiosity', 'awe'],
  'CognitionData': ['pattern_matching', 'attention', 'memory', 'planning', 'task_switching', 'math', 'deduction', 'visualization', 'verbal', 'timing', 'perceptual_speed', 'knowledge', 'action', 'spatial'],
  'PersonalityData': ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability']
};

const CHARTS = ['Bar', 'Line', 'Area', 'BarLine', 'Pie', 'Scatter', 'RangeBand', 'Radar', 'DailyBreakdown'];

export async function POST(req: Request) {
    try {
        const { message, history = [], currentConfig = {} } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
        }

        const systemPrompt = `You are the Skillprint AI Data Visualization Assistant, helping a user configure a Quick Jumper graph type.
Your task is to analyze the user's latest message in the context of the chat history and the current Quick Jumper configuration, and return a JSON response containing updates to the Quick Jumper configuration and a conversational reply.

IMPORTANT - Response Format:
You MUST return ONLY a valid, parseable JSON object with the following structure, and nothing else (no markdown wrapping, no text before or after).

JSON Structure:
{
  "reply": "Friendly conversational markdown response to the user. Max 2-3 sentences. Explain what settings you updated or answer their questions. Highlight the fields, modelName, and chart selection.",
  "updatedConfig": {
    "label": "Short, clear label for the jumper (e.g., 'Mood: Focus vs Relax')",
    "modelName": "One of the valid model names",
    "fields": ["List of valid field names from the chosen model"],
    "daysOffset": 7, // integer number of days to show data for (e.g. 7, 30, 90, 180, 365)
    "chart": "One of the valid chart types",
    "compPeriods": 0, // number of previous periods to compare (0, 1, 2, 3)
    "compCohort": false // boolean to compare with cohort (all users)
  },
  "triggerSave": true/false (Set to true ONLY if the user is explicitly requesting to save, build, create, or finish the jumper. E.g., 'save it', 'create the jumper', 'add this jumper', 'looks good, save').
}

Valid Models and their corresponding Fields:
${Object.entries(MODELS).map(([m, f]) => `- Model: "${m}"\n  Fields: ${f.map(val => `"${val}"`).join(', ')}`).join('\n')}

Valid Chart Types:
${CHARTS.map(c => `"${c}"`).join(', ')}

Current Quick Jumper Configuration (use this as the base):
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
            const match = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
            if (match && match[1]) {
                parsedResult = JSON.parse(match[1].trim());
            } else {
                throw e;
            }
        }

        return NextResponse.json(parsedResult);
    } catch (error: any) {
        console.error("Chat Jumper API error:", error);
        return NextResponse.json({ error: error.message || "An error occurred during chat processing" }, { status: 500 });
    }
}
