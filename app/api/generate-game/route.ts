import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { User } from '@/lib/models/User';
import { GeneratedGame } from '@/lib/models/GeneratedGame';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        const { targetMode, targetValue, optionalPrompt } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;
        const cookieStore = await cookies();
        let userId = cookieStore.get('user_id')?.value || 'anonymous';
        const authHeader = req.headers.get('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'skillprint-fallback-secret-key-123');
                if (decoded && decoded.id) {
                    userId = decoded.id;
                }
            } catch (err) {
                console.warn('Invalid or expired JWT provided', err);
            }
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
        }

        const promptContextPath = path.join(process.cwd(), 'app', 'api', 'generate-game', 'game-prompt-context.md');
        let promptContext = '';
        try {
            promptContext = await fs.readFile(promptContextPath, 'utf-8');
        } catch (err) {
            console.warn('Could not read game-prompt-context.md', err);
        }

        let moodContext = '';
        if (targetMode === 'mood' && targetValue) {
            const safeMoodName = targetValue.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const moodContextPath = path.join(process.cwd(), 'app', 'api', 'generate-game', `${safeMoodName}-game-context.md`);
            try {
                moodContext = await fs.readFile(moodContextPath, 'utf-8');
            } catch (err) {
                // Not all moods will have a specific context file, so just ignore it if missing
                console.log(`No specific context found for mood: ${targetValue} at ${moodContextPath}`);
            }
        }

        const systemPrompt = `You are an expert web game developer. Your task is to generate a fully playable, interactive, and visually appealing web game in a single HTML file (using embedded CSS and JavaScript).
The game MUST target the requested ${targetMode}: ${targetValue}.
${optionalPrompt ? `Additional instructions provided by user: ${optionalPrompt}` : ''}
IMPORTANT CRITERIA:
1. CODE COMPLETENESS: You MUST write actual, working game logic (update loops, collision detection, win/loss states, score tracking). DO NOT output placeholders or "Hello World" stubs.
2. ASSETS: You DO NOT have access to external image or sound files. Therefore, you MUST generate rich inline game assets. Use CSS shapes, inline SVG data URIs, or emojis to create detailed characters, enemies, environments, and items.
3. VISUALS: Ensure the game is visually stunning with a modern UI. Include a Start Screen, a Game Loop canvas or DOM area, and a Game Over screen. Use smooth CSS animations and nice color palettes.
4. FORMAT: Return ONLY the raw HTML code block within \`\`\`html ... \`\`\` markers. Print your response efficiently and without extra conversational text.

${promptContext}

${moodContext}`;

        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
            }
        };

        let modelName = 'gemini-3.1-pro-preview';
        let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

        const fetchHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        };

        let response = await fetch(apiUrl, {
            method: 'POST',
            headers: fetchHeaders,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok && response.status === 404) {
            // fallback to 1.5 pro if 3.1 pro is not available on this API endpoint yet
            modelName = 'gemini-1.5-pro';
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: fetchHeaders,
                body: JSON.stringify(requestBody),
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: `Gemini API Error: ${response.statusText}`, details: errorText }, { status: response.status });
        }

        if (!response.body) {
            return NextResponse.json({ error: 'No response body from Gemini' }, { status: 500 });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let fullOutputText = "";

        const readableStream = new ReadableStream({
            async start(controller) {
                const reader = response.body!.getReader();
                let buffer = "";

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        let parts = buffer.split(/\r?\n\r?\n/);
                        buffer = parts.pop() || "";

                        for (const part of parts) {
                            if (part.trim() === '') continue;
                            const lines = part.split(/\r?\n/);
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const dataStr = line.substring(6).trim();
                                    // Check if it's not empty or a [DONE] equivalent
                                    if (dataStr === '[DONE]') continue;
                                    if (!dataStr) continue;

                                    try {
                                        const data = JSON.parse(dataStr);
                                        const parts = data.candidates?.[0]?.content?.parts || [];
                                        let textPart = "";
                                        for (const p of parts) {
                                            if (p.text) textPart += p.text;
                                        }
                                        if (textPart) {
                                            fullOutputText += textPart;
                                            controller.enqueue(encoder.encode(textPart));
                                        }
                                    } catch (e) {
                                        console.error('Error parsing SSE data:', e instanceof Error ? e.message : String(e));
                                    }
                                }
                            }
                        }
                    }

                    // Process remaining buffer
                    const lines = buffer.split(/\r?\n/);
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.substring(6).trim();
                            if (dataStr && dataStr !== '[DONE]') {
                                try {
                                    const data = JSON.parse(dataStr);
                                    const parts = data.candidates?.[0]?.content?.parts || [];
                                    let textPart = "";
                                    for (const p of parts) {
                                        if (p.text) textPart += p.text;
                                    }
                                    if (textPart) {
                                        fullOutputText += textPart;
                                        controller.enqueue(encoder.encode(textPart));
                                    }
                                } catch (e) { }
                            }
                        }
                    }

                    // At the end, extract and save the generated HTML
                    let finalHtmlContent = fullOutputText;
                    const match = fullOutputText.match(/\`\`\`html\s*([\s\S]*?)\s*\`\`\`/);
                    if (match && match[1]) {
                        finalHtmlContent = match[1];
                    } else {
                        // Fallback if no markdown blocks
                        const matchHtml = fullOutputText.match(new RegExp("<!DOCTYPE html>[\\\\s\\\\S]*<\\\\/html>", "i"));
                        if (matchHtml) {
                            finalHtmlContent = matchHtml[0];
                        }
                    }

                    const fileId = crypto.randomUUID();
                    const fileName = `${targetMode}-${targetValue.replace(/\\s+/g, '-')}-${fileId}.html`.toLowerCase();
                    const gamesDir = path.join(process.cwd(), 'public', 'games', 'generated');
                    const fileUrlStr = `/games/generated/${fileName}`;

                    await fs.mkdir(gamesDir, { recursive: true });
                    await fs.writeFile(path.join(gamesDir, fileName), finalHtmlContent, 'utf-8');

                    // Save the generated game to the database via Sequelize ORM
                    if (userId && userId !== 'anonymous') {
                        try {
                            // First optionally create the User placeholder if not seeded
                            await User.findOrCreate({
                                where: { id: userId },
                                defaults: {
                                    first_name: 'Anonymous Creator',
                                    profile_image: null,
                                }
                            });

                            await GeneratedGame.create({
                                user_id: userId,
                                target_mode: targetMode,
                                target_value: targetValue,
                                optional_prompt: optionalPrompt || null,
                                file_url: fileUrlStr
                            });
                        } catch (dbError) {
                            console.error("Failed to save game to database ORM:", dbError);
                        }
                    }

                    // Send a final message to the client indicating the file is ready
                    const finalMarker = `\\n\\n___FILE_READY___:${fileUrlStr}`;
                    controller.enqueue(encoder.encode(finalMarker));

                } catch (error) {
                    console.error("Stream reading error:", error);
                    controller.enqueue(encoder.encode(`\\n\\n___ERROR___:An error occurred during generation.`));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: any) {
        console.error("Generate API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
