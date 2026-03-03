import fs from 'fs/promises';
import path from 'path';

export async function prepareLibraries(libraries: string[], apiKey: string): Promise<string> {
    if (!libraries || libraries.length === 0) return '';

    const libsDir = path.join(process.cwd(), 'public', 'games', 'lib');
    await fs.mkdir(libsDir, { recursive: true });

    let libraryContext = `\nYou have access to the following pre-built libraries. They will be included via <script> tags. DO NOT reinvent this functionality, use these global variables/classes directly:\n\n`;

    for (const libName of libraries) {
        // Only allow alphanumeric characters to prevent path traversal
        const safeName = libName.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!safeName) continue;

        const libPath = path.join(libsDir, `${safeName}.js`);
        let libContent = '';

        try {
            // Check if it exists
            libContent = await fs.readFile(libPath, 'utf-8');
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                console.error(`Error reading library ${safeName}:`, err);
                continue;
            }

            // Generate it!
            console.log(`Library ${safeName}.js not found, generating it...`);
            // Instruct Gemini to create the generic library
            const prompt = `You are an expert JavaScript developer.
Write a simple, reusable JS library for "${safeName}" to be used by simple 2D HTML5 canvas web games.
Expose it globally (e.g., \`window.${safeName} = ...\` or \`class ${safeName}\`).
Make it robust but concise (under 200 lines).
Output ONLY valid JavaScript code in a standard JS block, no explanations.`;

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.2 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

                    // Strip markdown js block
                    const jsMatch = generatedText.match(/\`\`\`(javascript|js)\s([\s\S]*?)\s*\`\`\`/);
                    if (jsMatch && jsMatch[2]) {
                        generatedText = jsMatch[2];
                    } else {
                        generatedText = generatedText.replace(/^\`\`\`(javascript|js)?/, '').replace(/\`\`\`$/, '');
                    }

                    libContent = generatedText.trim();
                    await fs.writeFile(libPath, libContent, 'utf-8');
                    console.log(`Saved generated library to ${libPath}`);
                } else {
                    console.error(`Failed to generate library ${safeName}. Status: ${response.status}`);
                    continue;
                }
            } catch (genErr) {
                console.error(`Error calling Gemini for library ${safeName}:`, genErr);
                continue;
            }
        }

        libraryContext += `### Library: ${safeName}.js (accessible as <script src="/games/lib/${safeName}.js"></script>)\n\`\`\`javascript\n${libContent}\n\`\`\`\n\n`;
    }

    if (libraryContext.length > 200) {
        return libraryContext;
    }
    return '';
}
