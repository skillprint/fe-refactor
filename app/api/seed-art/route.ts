import { NextResponse } from 'next/server';
import { ArtStyle } from '@/lib/models/ArtStyle';

export async function GET() {
    try {
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

        const results = [];
        for (const style of styles) {
            const [record, created] = await ArtStyle.findOrCreate({
                where: { name: style.name },
                defaults: style
            });
            results.push({ name: style.name, created, id: record.id });
        }

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
