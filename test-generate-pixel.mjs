async function testGenerate() {
    console.log("Generating game with Pixel Art style...");
    const res = await fetch('http://localhost:3000/api/generate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            targetMode: "skill",
            targetValue: "Reflexes",
            optionalPrompt: "A simple arcade game",
            artStyleId: "981953db-94bc-403e-96dd-acebcb02db1e" // Pixel Art UUID
        })
    });

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
    console.log("\n\nDone reading stream.");
}

testGenerate().catch(console.error);
