export interface Badge {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    icon: string;
    color: string; // Tailwind gradient classes, e.g. "from-purple-500 to-pink-500"
    date?: string; // Date earned if earned
    gameTitle: string;
    gameImage: string;
    earned: boolean;
    category: 'cognitive' | 'focus' | 'social' | 'milestone';
    progressCurrent?: number;
    progressTarget?: number;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    badgeId: string;
    xpReward?: number;
}
