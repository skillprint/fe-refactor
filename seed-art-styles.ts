import { ArtStyle } from './lib/models/ArtStyle';

async function seedArtStyles() {
    console.log("Seeding art styles...");

    const styles = [
        {
            name: "Pixel Art",
            description: "Blocky, retro, 8-bit/16-bit aesthetics",
            prompt_context: "The game MUST use a Pixel Art visual style. Utilize blocky, pixelated rendering (e.g. disable image smoothing if using Canvas), flat and limited retro color palettes (similar to 8-bit or 16-bit games), block shadows, and thick outlines. Use monospace or pixel-style fonts like Courier or a web font that captures the retro arcade feel."
        },
        {
            name: "Neon Synthwave",
            description: "Dark backgrounds, glowing neon pinks, purples, cyans",
            prompt_context: "The game MUST use a Neon Synthwave visual style. The background should be very dark (near black or deep purple). Use brightly glowing neon colors for game elements: hot pinks, electric cyans, and bright purples. Incorporate glowing outlines (using CSS box-shadow or Canvas shadowBlur), grid-like floor patterns, and a generally futuristic, 1980s retro-futuristic aesthetic."
        },
        {
            name: "Minimalist Vector",
            description: "Clean lines, flat, vibrant pastel or primary colors, geometric shapes",
            prompt_context: "The game MUST use a Minimalist Vector visual style. Focus on clean, sharp geometric shapes without outlines or with very thin, subtle strokes. Use a bright, vibrant, and flat color palette (either pastels or stark primary colors). The UI should be extremely clean, using modern sans-serif fonts (like Inter or Roboto) and ample whitespace. Avoid gradients or complex textures."
        }
    ];

    for (const style of styles) {
        const [record, created] = await ArtStyle.findOrCreate({
            where: { name: style.name },
            defaults: style
        });

        if (created) {
            console.log(`Created style: ${style.name}`);
        } else {
            console.log(`Style already exists: ${style.name}`);
        }
    }

    console.log("Seeding complete.");
    process.exit(0);
}

seedArtStyles().catch(err => {
    console.error("Failed to seed:", err);
    process.exit(1);
});
