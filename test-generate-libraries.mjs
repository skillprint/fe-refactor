async function testGenerate() {
    console.log("Generating game with physics and sound libraries...");
    const res = await fetch('http://localhost:3000/api/generate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            targetMode: 'mood',
            targetValue: 'focus',
            libraries: ['physics', 'sound']
        })
    });

    if (!res.ok) {
        console.error("HTTP error", res.status, await res.text());
        return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    console.log("Stream opened. Waiting for chunks...\n");

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
            const chunk = decoder.decode(value, { stream: true });
            if (chunk.includes('___TOKEN_USAGE___:')) {
                console.log("\n[SUCCESS] Emitted Token Usage Metadata:");
                const match = chunk.match(/\n___TOKEN_USAGE___:({.*?})\n/);
                if (match) {
                    console.log(JSON.parse(match[1]));
                } else {
                    console.log("Could not extract JSON from match:", chunk);
                }
            } else if (chunk.includes('___FILE_READY___:')) {
                console.log("\n[SUCCESS] File Ready Marker Event Received.");
            } else {
                process.stdout.write("."); // show progress
            }
        }
    }
}

testGenerate().catch(console.error);
