import Deck from '../cards/Deck';
import Hand from '../hands/Hand';
import Result from '../popups/Result';

export default class Controller {
    constructor(scene) {
        this.scene = scene;
        this.scene.events.once('shutdown', this.destroy, this);

        this.rules = this.scene.cache.json.get('config');

        this.credits = this.rules.credits;
        this.maxbet = this.rules.maxbet;

        this.currentBet = 0;
        this.deck = [];
        this.hands = {};

        this.scene.events.on('add_bet', this.onAddBet, this);
        this.scene.events.on('clear_bet', this.onClearBet, this);
        this.scene.events.on('start_game', this.deal, this);
        this.scene.events.on('hit', this.onHit, this);
        this.scene.events.on('stop', this.onStop, this);

        this.scene.events.emit('set_maxbet', this.maxbet);

        // this.deal();
    }

    startRound() {
        this.currentBet = 0;
        this.scene.events.emit('show_betting_controls');
        this.scene.events.emit('enable_betting');
        this.scene.events.emit('update_credits', this.credits);
        this.scene.events.emit('update_bet', this.currentBet);
        this.scene.events.emit('clear_stack');
    }

    onAddBet(chip) {
        if (this.currentBet + chip.value > this.maxbet) {
            chip.showError();
        } else if (this.credits < chip.value) {
            chip.showError();
        } else {
            this.scene.game.audio.play('sound', 'chip');
            this.credits -= chip.value;
            this.currentBet += chip.value;
            this.scene.events.emit('update_credits', this.credits);
            this.scene.events.emit('update_bet', this.currentBet);
            this.scene.events.emit('add_chip', chip.value);
        }
    }

    async deal() {
        this.scene.events.emit('disable_betting');
        this.scene.events.emit('show_gameplay_controls');

        await this.scene.game.utils.wait(500);

        this.deck = new Deck();
        this.hands.player = new Hand(this.scene, 720);
        this.hands.dealer = new Hand(this.scene, 220);

        // draw player cards
        this.hands.player.addCard(this.deck.draw());
        await this.hands.player.shiftCards();
        this.hands.player.addCard(this.deck.draw());
        await this.hands.player.shiftCards();

        await this.scene.game.utils.wait(500);

        // draw dealer cards
        this.hands.dealer.addCard(this.deck.draw());
        await this.hands.dealer.shiftCards();
        this.hands.dealer.addCard(this.deck.draw());
        await this.hands.dealer.shiftCards();

        // compare deal
        let outcome = this.compareDeal(this.hands.player, this.hands.dealer);
        if (outcome === 'win') return this.onWin();
        if (outcome === 'draw') return this.onDraw();
        if (outcome === 'lose') return this.onLose();

        // console.log('continue');
        this.scene.events.emit('enable_gameplay_controls');
    }

    compareDeal(player, dealer) {
        if ((player.sum === 21 || player.sum === 22) && (dealer.sum === 21 || dealer.sum === 22)) {
            // both has 21, it's a tie
            return 'draw';
        } else if (dealer.sum >= 21 && player.sum < 21) {
            // dealer wins with 21
            return 'lose';
        } else if (dealer.sum < 21 && player.sum >= 21) {
            // player wins with 21
            return 'win';
        } else {
            return null;
        }
    }

    async onHit() {
        this.scene.events.emit('disable_gameplay_controls');

        this.hands.player.addCard(this.deck.draw());
        await this.hands.player.shiftCards();

        if (this.hands.player.bust) return this.onLose();
        if (this.hands.player.sum === 21) return this.onStop();
        if (this.hands.player.cards.length === 5) return this.onStop();

        await this.scene.game.utils.wait(500);

        this.scene.events.emit('enable_gameplay_controls');
    }

    async onStop() {
        this.scene.events.emit('disable_gameplay_controls');

        await this.scene.game.utils.wait(500);

        while (true) {
            if (this.hands.dealer.sum > 21) return this.onWin();
            if (this.hands.dealer.sum >= 17) return this.showdown();
            if (this.hands.dealer.cards.length === 5) return this.onshowdown();

            this.hands.dealer.addCard(this.deck.draw());
            await this.hands.dealer.shiftCards();

            await this.scene.game.utils.wait(500);
        }
    }

    showdown() {
        if (this.hands.player.sum > this.hands.dealer.sum) return this.onWin();
        if (this.hands.player.sum === this.hands.dealer.sum) return this.onDraw();
        if (this.hands.player.sum < this.hands.dealer.sum) return this.onLose();
    }

    async onWin() {
        await this.scene.game.utils.wait(1000);
        this.scene.game.audio.play('sound', 'win');

        let result = new Result(this.scene, 'win');
        await result.show();
        result.destroy();

        await this.clearHands();
        this.credits += this.currentBet * 2;

        this.startRound();
    }

    async onDraw() {
        await this.scene.game.utils.wait(1000);
        this.scene.game.audio.play('sound', 'win');

        let result = new Result(this.scene, 'draw');
        await result.show();
        result.destroy();

        await this.clearHands();
        this.credits += this.currentBet;

        this.startRound();
    }

    async onLose() {
        await this.scene.game.utils.wait(1000);

        let result = new Result(this.scene, 'lose');
        await result.show();
        result.destroy();

        await this.clearHands();

        this.startRound();
    }

    async clearHands() {
        await this.hands.player.clear();
        await this.hands.dealer.clear();

        this.hands.player.destroy();
        this.hands.dealer.destroy();
    }

    onClearBet() {
        this.credits += this.currentBet;
        this.currentBet = 0;
        this.scene.events.emit('update_credits', this.credits);
        this.scene.events.emit('update_bet', this.currentBet);
    }

    destroy() {
        this.scene.events.off('add_bet', this.onAddBet, this);
        this.scene.events.off('clear_bet', this.onClearBet, this);
        this.scene.events.off('start_game', this.deal, this);
        this.scene.events.off('hit', this.onHit, this);
        this.scene.events.off('stop', this.onStop, this);
    }
}
