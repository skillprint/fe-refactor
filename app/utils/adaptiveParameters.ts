// Maps internal game parameter names to user-friendly "marketing" language for display.

export const getAdaptiveParametersForGame = (slug: string): string[] => {
    switch (slug) {
        case 'box-tower':
            return ['Box Speed', 'Accuracy Leniency'];
        case 'hextris':
            return ['Falling Speed', 'Combo Duration'];
        case '0hh1':
            return ['Board Complexity', 'Hint Availability'];
        case '2048':
            return ['Starting Tile Density'];
        case 'brick-out':
            return ['Ball Speed', 'Power-Up Frequency', 'Multiball Limit'];
        case 'change-word':
            return ['Time Per Word', 'Time Pressure Ramp', 'Hints Per Stage'];
        case 'fruit-sorting':
            return ['Clock Duration'];
        case 'gems-of-hanoi':
            return ['Maximum Complexity Tier'];
        case 'gummy-blocks':
            return ['Largest Piece Size', 'Tray Refill Pace'];
        case 'katana-fruits':
            return ['Fruit Spawn Frequency', 'Object Trajectory Speed'];
        case 'mahjong-deluxe':
            return ['Bonus Time Awarded', 'Hint Score Penalty'];
        case 'match-doodle':
            return ['Card Pairs', 'Pile Density', 'Card Tilt'];
        case 'photo-hunt':
            return ['Clock Duration', 'Miss Allowances'];
        case 'snake-attack':
            return ['Snake Speed', 'Rotation Sensitivity'];
        case 'space-adventure-pinball':
            return ['Available Balls', 'Flipper Strength'];
        case 'sumagi':
            return ['Clock Duration', 'Level Progression Rate'];
        case 'sweet-memory':
            return ['Card Pairs Per Level', 'Clock Duration'];
        case 'ultimate-sudoku':
            return ['Starting Given Clues'];
        case 'whack-em-all':
            return ['Mole Spawn Intervals', 'Clock Duration'];
        default:
            return []; // No known parameters or stub shims used
    }
};
