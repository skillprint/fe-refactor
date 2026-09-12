/**
 * Player state: lanes, jump, slide, health, speed ramp.
 */
import { LANE_X, PLAYER_MAX_HEALTH, clamp, lerp } from './constants.js';
import { PARAMS } from './params.js';

const GRAVITY = 24;
const JUMP_V = 7.6;
const SLIDE_TIME = 0.75;

export class Player {
  constructor() { this.reset(); }

  reset() {
    this.lane = 1;
    this.x = 0;
    this.z = 0;
    this.y = 0;
    this.vy = 0;
    this.sliding = false;
    this.slideT = 0;
    this.health = PLAYER_MAX_HEALTH;
    this.invuln = 0;
    this.stagger = 0;
    this.runTime = 0;
    this.distance = 0;
    this.hitsTaken = 0;
    this.lastDamageT = -10;
    this.bobPhase = 0;
    this.dead = false;
    this.deathCause = '';
  }

  get grounded() { return this.y <= 0.0001 && this.vy <= 0; }

  get speed() {
    const ramp = 1 + PARAMS.speedRampRate * (this.runTime / 60);
    const stag = this.stagger > 0 ? 0.45 : 1;
    return PARAMS.playerSpeed * ramp * stag;
  }

  moveLane(dir) {
    this.lane = clamp(this.lane + dir, 0, 2);
  }

  jump() {
    if (this.dead) return false;
    if (this.sliding) { this.sliding = false; this.slideT = 0; }
    if (!this.grounded) return false;
    this.vy = JUMP_V;
    return true;
  }

  slide() {
    if (this.dead) return false;
    if (!this.grounded) { this.vy = Math.min(this.vy, -12); }
    this.sliding = true;
    this.slideT = SLIDE_TIME;
    return true;
  }

  /** Returns true when the hit landed (not invulnerable). */
  takeDamage(amount, cause) {
    if (this.dead || this.invuln > 0) return false;
    const dmg = amount * PARAMS.damageTaken;
    this.health = Math.max(0, this.health - dmg);
    this.hitsTaken += 1;
    this.invuln = 1.0;
    this.stagger = 0.6;
    this.lastDamageT = this.runTime;
    if (this.health <= 0) { this.dead = true; this.deathCause = cause; }
    return true;
  }

  heal(amount) {
    this.health = Math.min(PLAYER_MAX_HEALTH, this.health + amount);
  }

  update(dt) {
    if (this.dead) return;
    this.runTime += dt;
    const sp = this.speed;
    this.z -= sp * dt;
    this.distance = -this.z;

    this.x = lerp(this.x, LANE_X[this.lane], Math.min(1, dt * 9));

    if (!this.grounded || this.vy > 0) {
      this.vy -= GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) { this.y = 0; this.vy = 0; }
    }

    if (this.sliding) {
      this.slideT -= dt;
      if (this.slideT <= 0) this.sliding = false;
    }

    this.invuln = Math.max(0, this.invuln - dt);
    this.stagger = Math.max(0, this.stagger - dt);

    if (PARAMS.healthRegen > 0 && this.runTime - this.lastDamageT > 3) {
      this.heal(PARAMS.healthRegen * dt);
    }

    this.bobPhase += dt * sp * 1.1 * (this.grounded ? 1 : 0.2);
  }
}
