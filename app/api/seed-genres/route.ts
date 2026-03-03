import { NextResponse } from 'next/server';
import { Genre } from '@/lib/models/Genre';

export async function GET() {
    try {
        const genres = [
            {
                name: "Platformer",
                description: "2D side-scrolling platformer",
                prompt_context: "The game MUST be a 2D side-scrolling platformer. The player must be able to jump between platforms, avoid obstacles, and reach a goal. Include gravity, collision detection with platforms, and horizontal movement."
            },
            {
                name: "Puzzle Game",
                description: "Logic puzzle or matching game",
                prompt_context: "The game MUST be a grid-based puzzle or logic game. The player must manipulate pieces, match patterns, or solve spatial puzzles to progress."
            },
            {
                name: "Visual Novel",
                description: "Story-driven narrative game",
                prompt_context: "The game MUST be a text-heavy visual novel. The screen should display a character portrait or background, with a text box at the bottom. Provide multiple dialogue choices that branch the narrative."
            },
            {
                name: "Endless Runner",
                description: "Auto-scrolling survival game",
                prompt_context: "The game MUST be an endless runner. The environment should continually scroll, and the player character must jump, duck, or dodge incoming obstacles. the score should increase over time."
            },
            {
                name: "Turn-Based RPG",
                description: "Turn-based combat system",
                prompt_context: "The game MUST feature a turn-based combat system. The player selects actions from a menu (Attack, Magic, Heal) against an enemy. Calculate and display health points, damage numbers, and manage turn order."
            }
        ];

        for (const genre of genres) {
            const exists = await Genre.findOne({ where: { name: genre.name } });
            if (!exists) {
                await Genre.create(genre);
            }
        }

        return NextResponse.json({ success: true, message: 'Genres seeded' });
    } catch (error: any) {
        console.error("Genre Seeding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
