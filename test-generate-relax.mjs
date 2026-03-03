async function testGenerate() {
    const res = await fetch('http://localhost:3000/api/generate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            targetMode: "mood",
            targetValue: "Relax",
            optionalPrompt: "A simple text game"
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
