export interface GeneratedGame {
    id: string; // UUID from database
    user_id: string;
    target_mode: 'mood' | 'skill';
    target_value: string;
    optional_prompt: string | null;
    file_url: string; // The URL to access the game (e.g., /games/generated/...)
    created_at: Date;
}
