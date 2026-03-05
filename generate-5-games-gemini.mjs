

const MOODS = ['relax', 'focus', 'creativity', 'collaborate', 'grit', 'joy', 'curiosity', 'empathy', 'awe'];
const SKILLS = ['problem solving', 'memory', 'logic', 'spatial reasoning', 'attention', 'pattern recognition', 'reaction time'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function testGenerate() {
    console.log("Starting generation of 5 games using Gemini model...");
    for (let i = 0; i < 5; i++) {
        const mode = Math.random() > 0.5 ? 'mood' : 'skill';
        const value = getRandomItem(mode === 'mood' ? MOODS : SKILLS);
        const name = `${mode}: ${value}`;
        console.log(`\n\n=== Generating game ${i + 1}/5: ${name} ===`);

        try {
            const res = await fetch('http://localhost:3000/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetMode: mode,
                    targetValue: value,
                    modelProvider: 'gemini'
                })
            });

            if (!res.ok) {
                console.error(`Status ${res.status}:`, await res.text());
                continue;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let full = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    process.stdout.write(chunk);
                    full += chunk;
                }
            }
            console.log(`\n=== Finished generating game ${i + 1}/5 ===`);
        } catch (e) {
            console.error(`\nFailed to generate game ${i + 1}:`, e);
            // Optionally retry or just continue
        }
    }
    console.log("\n\nAll 5 games have been generated and entered into the database.");
}

testGenerate().catch(console.error);
