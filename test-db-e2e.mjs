

async function verify() {
    console.log("1. Generating game for test-user-123...");
    const genRes = await fetch('http://localhost:3000/api/generate-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Cookie': 'user_id=test-user-123'
        },
        body: JSON.stringify({
            targetMode: 'skill',
            targetValue: 'logic',
            optionalPrompt: 'a quick logic puzzle'
        })
    });

    // Read the stream to get the final file URL
    let fileUrl = '';
    for await (const chunk of genRes.body) {
        const text = chunk.toString();
        if (text.includes('___FILE_READY___:')) {
            fileUrl = text.split('___FILE_READY___:')[1].trim();
        }
    }
    console.log("Generated File URL:", fileUrl);

    console.log("\\n2. Checking /api/my-games...");
    const gamesRes = await fetch('http://localhost:3000/api/my-games', {
        headers: {
            'Cookie': 'user_id=test-user-123'
        }
    });

    const data = await gamesRes.json();
    console.log("My Games API Response:", JSON.stringify(data, null, 2));

    if (data.games && data.games.some(g => g.file_url === fileUrl)) {
        console.log("✅ SUCCESS: The generated game is listed in the DB!");
    } else {
        console.log("❌ FAILED: The generated game was not found in the DB listing.");
    }
}

verify().catch(console.error);
