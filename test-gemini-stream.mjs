import fs from 'fs';

async function testGeminiStream() {
    const apiKey = process.env.GEMINI_API_KEY;
    const requestBody = {
        contents: [{ role: "user", parts: [{ text: "Write exactly 3 lines of Javascript code." }] }]
    };

    let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:streamGenerateContent?alt=sse&key=${apiKey}`;

    console.log("Fetching stream with headers...");
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestBody),
    });

    console.log("Status:", res.status);
    let bytes = 0;

    if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                bytes += value.length;
                process.stdout.write(decoder.decode(value, { stream: true }));
            }
        }
    }
    console.log("\\n--- DONE --- Total bytes:", bytes);
}

testGeminiStream();
