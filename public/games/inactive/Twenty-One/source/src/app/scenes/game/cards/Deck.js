import { shuffle } from 'lodash';

export default class Deck {
    constructor() {
        let suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        let ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let values = [6, 7, 8, 9, 10, 2, 3, 4, 11];

        this.cards = [];

        suits.forEach((suit) => {
            ranks.forEach((rank, index) => {
                this.cards.push({
                    suit,
                    rank,
                    value: values[index],
                });
            });
        });

        this.cards = shuffle(this.cards);
    }

    draw() {
        return this.cards.pop();
    }
}
