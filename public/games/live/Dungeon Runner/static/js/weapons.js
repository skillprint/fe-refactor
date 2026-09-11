/**
 * Player weapons: pistol / shotgun (hitscan) and plasma (projectile).
 * Reads PARAMS.weaponDamage, fireRate and autoAim live; weaponType is applied by the game.
 */
import { WEAPONS, clamp } from './constants.js';
import { PARAMS } from './params.js';

export class Weapons {
  constructor(entities, audio) {
    this.entities = entities;
    this.audio = audio;
    this.current = 0;
    this.ammo = { 1: WEAPONS[1].ammo, 2: WEAPONS[2].ammo };
    this.cooldown = 0;
    this.recoil = 0;
    this.flash = 0;
    this.shots = 0;
    this.hits = 0;
    this.lastSwitchT = 0;
  }

  reset(weaponId = 0) {
    this.ammo = { 1: WEAPONS[1].ammo, 2: WEAPONS[2].ammo };
    this.cooldown = 0; this.recoil = 0; this.flash = 0; this.shots = 0; this.hits = 0;
    this.setWeapon(weaponId, true);
  }

  get def() { return WEAPONS[this.current]; }
  get accuracy() { return this.shots ? this.hits / this.shots : 0; }
  get currentAmmo() { return this.current === 0 ? Infinity : this.ammo[this.current]; }

  setWeapon(id, refill = false) {
    id = clamp(Math.round(id), 0, WEAPONS.length - 1);
    this.current = id;
    if (refill && id !== 0) this.ammo[id] = Math.max(this.ammo[id], WEAPONS[id].ammo);
    this.cooldown = Math.max(this.cooldown, 0.2);
  }

  cycle(dir) {
    let id = this.current;
    for (let i = 0; i < WEAPONS.length; i++) {
      id = (id + dir + WEAPONS.length) % WEAPONS.length;
      if (id === 0 || this.ammo[id] > 0) break;
    }
    this.setWeapon(id);
    this.lastSwitchT = performance.now();
  }

  addAmmo() {
    this.ammo[1] = Math.min(WEAPONS[1].ammo * 2, this.ammo[1] + 10);
    this.ammo[2] = Math.min(WEAPONS[2].ammo * 2, this.ammo[2] + 30);
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.recoil = Math.max(0, this.recoil - dt * 5);
    this.flash = Math.max(0, this.flash - dt * 12);
  }

  /**
   * Try to fire. origin/dir are camera position and forward vector (unit).
   * Returns { fired, hit } .
   */
  fire(origin, dir, playerZ) {
    if (this.cooldown > 0) return { fired: false };
    const w = this.def;
    if (this.current !== 0 && this.ammo[this.current] <= 0) {
      this.cycle(-1);
      return { fired: false };
    }
    this.cooldown = 1 / (w.rps * PARAMS.fireRate);
    this.recoil = w.id === 1 ? 1 : 0.5;
    this.flash = 1;
    this.shots += 1;
    if (this.current !== 0) this.ammo[this.current] -= 1;
    this.audio?.shoot(w.id);

    let aim = dir;
    if (PARAMS.autoAim) {
      const target = this.entities.nearestInCone(origin, dir, Math.cos(0.2), w.range);
      if (target) {
        const vx = target.x - origin.x, vy = target.size / 2 - origin.y, vz = target.z - origin.z;
        const len = Math.hypot(vx, vy, vz) || 1;
        aim = { x: vx / len, y: vy / len, z: vz / len };
      }
    }

    const dmg = w.damage * PARAMS.weaponDamage;
    let anyHit = false;

    if (w.projectile) {
      const d = jitter(aim, w.spread);
      const start = { x: origin.x + d.x * 0.6, y: origin.y - 0.25 + d.y * 0.6, z: origin.z + d.z * 0.6 };
      this.entities.spawnProjectile('player', start, d, 42, dmg, w.splash);
      return { fired: true, hit: false };
    }

    for (let i = 0; i < w.pellets; i++) {
      const d = w.spread ? jitter(aim, w.spread) : aim;
      const hit = this.entities.raycast(origin, d, w.range);
      if (!hit) continue;
      anyHit = true;
      if (hit.target.kind === 'enemy') this.entities.damageEnemy(hit.target, dmg);
      else this.entities.damageBarrel(hit.target, playerZ);
    }
    if (anyHit) this.hits += 1;
    return { fired: true, hit: anyHit };
  }
}

function jitter(dir, spread) {
  const x = dir.x + (Math.random() - 0.5) * 2 * spread;
  const y = dir.y + (Math.random() - 0.5) * 2 * spread;
  const z = dir.z + (Math.random() - 0.5) * 2 * spread;
  const len = Math.hypot(x, y, z) || 1;
  return { x: x / len, y: y / len, z: z / len };
}
