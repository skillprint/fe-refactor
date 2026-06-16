import { NextResponse } from 'next/server';

const MODULES = [
  { type: 'hero', name: 'Hero Section', desc: 'Prominent banner introducing Skillprint with action buttons' },
  { type: 'progressBanner', name: 'Progress Banner', desc: 'Summary of mood progress and active goals' },
  { type: 'playbookWidget', name: 'Playbook Widget', desc: 'Displays playbooks/exercises to practice specific skills' },
  { type: 'skillprintGraph', name: 'Skillprint Graph', desc: 'Interactive network visual of user skills and moods' },
  { type: 'gameSlider', name: 'New Games Slider', desc: 'Interactive horizontal scroll slider for featured/recommended games' },
  { type: 'explorer', name: 'Mood/Skill Explorer', desc: 'Clickable navigation cards to browse games by category' },
  { type: 'profileStats', name: 'Profile Stats Row', desc: 'Three-column analytic card showing play metrics (Sessions, Time, Avg Flow Score)' },
  { type: 'skillBreakdown', name: 'Skill Breakdown', desc: 'Progress bars comparing top cognitive skills and percentage values' },
  { 
    type: 'dynamicChart', 
    name: 'Dynamic Chart', 
    desc: 'Plots specific logs over time. MUST configure properties like props.jumperId' 
  }
];

const VALID_JUMPER_IDS = [
  'home_footprint_mood',
  'home_footprint_cognition',
  'home_footprint_personality',
  'daily_breakdown',
  'focus_trend_weekly',
  'focus_vs_relax',
  'grit_progression',
  'creative_flow',
  'empathy_collab',
  'top_cognitive_weekly',
  'memory_vs_cohort',
  'pattern_matching_consistency',
  'task_switching_planning',
  'long_range_attention',
  'session_duration_monthly',
  'telemetry_activity',
  'game_popularity',
  'active_favorites_growth',
  'flow_score_confidence',
  'survey_completion',
  'processing_quality'
];

export async function POST(req: Request) {
    try {
        const { message, history = [], currentConfig = {} } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
        }

        const systemPrompt = `You are the Skillprint AI Layout & Interface Builder Assistant.
Your task is to analyze the user's latest message in the context of the chat history and the current layout design, and return a JSON response containing updates to the layout design and a conversational reply.

The layout consists of a name, a list of blocks, and an aesthetic theme.

IMPORTANT - Response Format:
You MUST return ONLY a valid, parseable JSON object with the following structure, and nothing else (no markdown wrapping, no text before or after).

JSON Structure:
{
  "reply": "Friendly conversational markdown response to the user. Max 2-3 sentences. Explain what layout changes, blocks, and styling/theme customization you recommended.",
  "updatedConfig": {
    "name": "Short descriptive layout name (e.g. 'Gamer Analytics Hub')",
    "blocks": [
      {
        "type": "one of the valid block types",
        "props": { ...optional properties for the block... }
      }
    ],
    "theme": {
      "primaryColor": "Hex color code for primary accents/buttons (e.g., '#543DEB')",
      "secondaryColor": "Hex color code for secondary accents/badges (e.g., '#05DF91')",
      "backgroundColor": "Hex color code for layout background (e.g., '#f5f5f7')",
      "foregroundColor": "Hex color code for main text (e.g., '#1d1d1f')",
      "cardColor": "Hex color code for card backgrounds (e.g., '#ffffff')",
      "cardForegroundColor": "Hex color code for card text (e.g., '#1d1d1f')",
      "borderColor": "Hex color code for borders (e.g., '#d2d2d7')",
      "borderRadius": "Roundedness size (one of: '0px', '0.25rem', '0.5rem', '1rem', '1.5rem')",
      "fontFamily": "Font family name (one of: 'Outfit', 'Inter', 'Mono')"
    }
  },
  "triggerSave": true/false (Set to true ONLY if the user is explicitly requesting to save, finalize, build, apply, or finish the layout. E.g. 'save layout', 'apply this', 'looks good, build it').
}

Valid Block Types and Descriptions:
${MODULES.map(m => `- Type: "${m.type}" (${m.name}) - ${m.desc}`).join('\n')}

Note on "dynamicChart" Blocks:
If you place a "dynamicChart" block, you should configure its props with a valid "jumperId".
Valid jumperIds for dynamicChart:
${VALID_JUMPER_IDS.map(j => `  - "${j}"`).join('\n')}

Guidelines for Aesthetic Theme Design:
When generating or modifying the "theme" object:
1. Ensure all colors are harmonious. Primary/secondary colors should contrast well with background and card colors, and foreground colors must be legible.
2. If dark mode is requested (e.g. "dark theme", "midnight", "neon"), background should be dark (e.g. '#09090b', '#030712'), cards dark grey (e.g. '#18181b', '#1f2937'), and text light (e.g. '#fafafa', '#f3f4f6').
3. If a specific theme is mentioned (e.g. "cyberpunk", "warm green", "sleek", "modern"):
   - "cyberpunk/hacker": background='#030712', card='#111827', primary='#818cf8', secondary='#05DF91', fontFamily='Mono', borderRadius='0px'
   - "warm green/organic": background='#f0fdf4', card='#ffffff', primary='#166534', secondary='#86efac', fontFamily='Outfit', borderRadius='1rem'
   - "calm blue/sleek": background='#f8fafc', card='#ffffff', primary='#2563eb', secondary='#38bdf8', fontFamily='Inter', borderRadius='0.5rem'
4. Retain and modify themes iteratively if the user requests changes (e.g., "change the primary color to red").

Current Layout Configuration (use this as the base to refine or extend if appropriate, or replace it if the user wants a completely new layout):
${JSON.stringify(currentConfig, null, 2)}
`;

        // Format history for Gemini contents
        const contents = history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        }));

        // Append latest user message
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
                temperature: 0.3,
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
        console.error("Chat Layout API error:", error);
        return NextResponse.json({ error: error.message || "An error occurred during chat processing" }, { status: 500 });
    }
}
