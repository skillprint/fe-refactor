/**
 * Obstacles, enemies, pickups, projectiles and particles, plus the Spawner that
 * populates a corridor segment from the live PARAMS when it is recycled.
 *
 * Coordinates: the player runs toward -Z. "dist" of a thing ahead = playerZ - thing.z.
 */
/* global THREE */
import { LANE_X, HALF_WIDTH, SEG_LEN, OBSTACLE, ENEMY, PICKUP, DAMAGE, rand, randInt, pick, clamp, lerp } from './constants.js';
import { PARAMS } from './params.js';

const ENEMY_RADIUS = 0.75;
const BARREL_RADIUS = 0.6;

export class Entities {
  constructor(scene, mats, sprites) {
    this.scene = scene;
    this.mats = mats;
    this.sprites = sprites;
    this.obstacles = [];
    this.enemies = [];
    this.pickups = [];
    this.projectiles = [];
    this.particles = [];
    this.pools = { obstacle: {}, enemy: {}, pickup: {}, projectile: [], particle: [] };
    this.geo = {
      barrel: new THREE.CylinderGeometry(0.45, 0.42, 1.2, 10),
      band: new THREE.CylinderGeometry(0.47, 0.47, 0.12, 10),
      beam: new THREE.BoxGeometry(HALF_WIDTH * 2, 0.45, 0.4),
      beamPost: new THREE.BoxGeometry(0.3, 1.2, 0.3),
      pit: new THREE.PlaneGeometry(2.0, 3.2),
      pitRim: new THREE.PlaneGeometry(2.3, 3.5),
      gateBar: new THREE.BoxGeometry(2.1, 3.0, 0.25),
      blade: new THREE.BoxGeometry(2.2, 0.28, 0.14),
      bladeHub: new THREE.CylinderGeometry(0.2, 0.2, 0.25, 8),
      bolt: new THREE.SphereGeometry(0.16, 8, 6),
      arrow: new THREE.BoxGeometry(0.08, 0.08, 0.7),
      gib: new THREE.BoxGeometry(0.14, 0.14, 0.14),
      warnRing: new THREE.RingGeometry(0.5, 0.7, 16),
    };
    this.pitMat = new THREE.MeshBasicMaterial({ color: 0x050205 });
    this.pitRimMat = new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.85 });
    this.events = null; // set by game: { onPlayerHit(amount, cause), onKill(enemy), onPickup(kind), onTelegraph(entity), onExplosion(pos) }
    this.time = 0;
  }

  // ── pooling ───────────────────────────────────────────────────────────────
  _acquire(kind, type, factory) {
    const pool = this.pools[kind];
    const list = Array.isArray(pool) ? pool : (pool[type] || (pool[type] = []));
    let e = list.pop();
    if (!e) {
      e = factory();
      this.scene.add(e.obj);
    }
    e.obj.visible = true;
    e.active = true;
    return e;
  }

  _release(kind, e) {
    e.active = false;
    e.obj.visible = false;
    const pool = this.pools[kind];
    if (Array.isArray(pool)) pool.push(e); else (pool[e.type] || (pool[e.type] = [])).push(e);
  }

  clear() {
    for (const e of this.obstacles) this._release('obstacle', e);
    for (const e of this.enemies) this._release('enemy', e);
    for (const e of this.pickups) this._release('pickup', e);
    for (const e of this.projectiles) this._release('projectile', e);
    for (const e of this.particles) this._release('particle', e);
    this.obstacles = []; this.enemies = []; this.pickups = []; this.projectiles = []; this.particles = [];
  }

  // ── factories ─────────────────────────────────────────────────────────────
  _makeObstacle(type) {
    const g = this.geo, m = this.mats;
    const obj = new THREE.Group();
    const e = { kind: 'obstacle', type, obj, lane: 1, z: 0, active: true, warned: false, hit: false, hp: 1, openLane: 1, phase: 0, parts: {} };
    if (type === OBSTACLE.BARREL) {
      const body = new THREE.Mesh(g.barrel, m.barrel); body.position.y = 0.6;
      const b1 = new THREE.Mesh(g.band, m.barrelBand); b1.position.y = 0.3;
      const b2 = new THREE.Mesh(g.band, m.barrelBand); b2.position.y = 0.95;
      obj.add(body, b1, b2);
    } else if (type === OBSTACLE.BEAM) {
      const beam = new THREE.Mesh(g.beam, m.beam); beam.position.y = 1.35;
      obj.add(beam);
      for (const s of [-1, 1]) {
        const p = new THREE.Mesh(g.beamPost, m.beam); p.position.set(s * (HALF_WIDTH - 0.2), 0.6, 0); obj.add(p);
      }
    } else if (type === OBSTACLE.PIT) {
      const rim = new THREE.Mesh(g.pitRim, this.pitRimMat); rim.rotation.x = -Math.PI / 2; rim.position.y = 0.015;
      const hole = new THREE.Mesh(g.pit, this.pitMat); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.02;
      obj.add(rim, hole);
    } else if (type === OBSTACLE.GATE) {
      e.parts.bars = [];
      for (let i = 0; i < 3; i++) {
        const bar = new THREE.Mesh(g.gateBar, m.gate); bar.position.set(LANE_X[i], 1.5, 0);
        obj.add(bar); e.parts.bars.push(bar);
      }
    } else if (type === OBSTACLE.BLADE) {
      const blade = new THREE.Mesh(g.blade, m.blade); blade.position.y = 1.2;
      const hub = new THREE.Mesh(g.bladeHub, m.gate); hub.rotation.x = Math.PI / 2; hub.position.y = 1.2;
      obj.add(blade, hub); e.parts.blade = blade;
    }
    const ring = new THREE.Mesh(g.warnRing, m.warn); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.visible = false;
    obj.add(ring); e.parts.ring = ring;
    return e;
  }

  _makeEnemy(type) {
    const mats = this.sprites[type];
    const sprite = new THREE.Sprite(mats[0].clone());
    const size = type === ENEMY.IMP ? 1.8 : 2.0;
    sprite.scale.set(size, size, 1);
    const obj = new THREE.Group();
    obj.add(sprite);
    const ring = new THREE.Mesh(this.geo.warnRing, this.mats.warn); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.visible = false;
    obj.add(ring);
    return { kind: 'enemy', type, obj, sprite, ring, size, lane: 1, x: 0, z: 0, hp: 2, active: true, warned: false, dying: 0, animT: 0, frame: 0, fireT: 1, flashT: 0, tracked: false, seed: Math.random() };
  }

  _makePickup(type) {
    const sprite = new THREE.Sprite(this.sprites[type].clone());
    sprite.scale.set(0.7, 0.7, 1);
    const obj = new THREE.Group();
    obj.add(sprite);
    return { kind: 'pickup', type, obj, sprite, lane: 1, z: 0, active: true, bob: Math.random() * 6 };
  }

  _makeProjectile() {
    const obj = new THREE.Group();
    const bolt = new THREE.Mesh(this.geo.bolt, this.mats.plasma);
    const arrow = new THREE.Mesh(this.geo.arrow, this.mats.arrow);
    obj.add(bolt, arrow);
    return { kind: 'projectile', obj, bolt, arrow, owner: 'player', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, dmg: 1, splash: 0, active: true };
  }

  _makeParticle() {
    const obj = new THREE.Mesh(this.geo.gib, this.mats.gib);
    return { kind: 'particle', obj, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, active: true };
  }

  // ── spawning ──────────────────────────────────────────────────────────────
  spawnObstacle(type, lane, z) {
    const e = this._acquire('obstacle', type, () => this._makeObstacle(type));
    e.lane = lane; e.z = z; e.warned = false; e.hit = false; e.hp = 1; e.phase = Math.random() * 6;
    e.obj.visible = true;
    const x = type === OBSTACLE.BEAM || type === OBSTACLE.GATE || type === OBSTACLE.BLADE ? 0 : LANE_X[lane];
    e.obj.position.set(x, 0, z);
    e.parts.ring.visible = false;
    e.parts.ring.position.x = type === OBSTACLE.BEAM || type === OBSTACLE.GATE ? 0 : 0;
    if (type === OBSTACLE.GATE) {
      e.openLane = lane;
      e.parts.bars.forEach((b, i) => { b.visible = i !== lane; });
    }
    this.obstacles.push(e);
    return e;
  }

  spawnEnemy(type, lane, z) {
    const e = this._acquire('enemy', type, () => this._makeEnemy(type));
    e.lane = lane; e.x = LANE_X[lane]; e.z = z;
    e.hp = type === ENEMY.IMP ? PARAMS.enemyHealth : Math.max(1, Math.round(PARAMS.enemyHealth * 0.75));
    e.warned = false; e.dying = 0; e.animT = 0; e.frame = 0; e.flashT = 0; e.tracked = false;
    e.fireT = rand(0.6, 1.4);
    e.obj.visible = true;
    e.obj.position.set(e.x, 0, z);
    e.sprite.position.y = e.size / 2;
    e.sprite.scale.set(e.size, e.size, 1);
    e.sprite.material.opacity = 1;
    e.sprite.material.color.set(0xffffff);
    e.ring.visible = false;
    this.enemies.push(e);
    return e;
  }

  spawnPickup(type, lane, z) {
    const e = this._acquire('pickup', type, () => this._makePickup(type));
    e.lane = lane; e.z = z;
    e.obj.position.set(LANE_X[lane], 0, z);
    this.pickups.push(e);
    return e;
  }

  spawnProjectile(owner, pos, dir, speed, dmg, splash = 0) {
    const e = this._acquire('projectile', null, () => this._makeProjectile());
    e.owner = owner; e.x = pos.x; e.y = pos.y; e.z = pos.z;
    e.vx = dir.x * speed; e.vy = dir.y * speed; e.vz = dir.z * speed;
    e.life = 3; e.dmg = dmg; e.splash = splash;
    e.bolt.visible = owner === 'player';
    e.arrow.visible = owner !== 'player';
    e.obj.position.set(e.x, e.y, e.z);
    e.obj.lookAt(e.x + dir.x, e.y + dir.y, e.z + dir.z);
    this.projectiles.push(e);
    return e;
  }

  burst(pos, count, color, speed = 4) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length > 90) break;
      const e = this._acquire('particle', null, () => this._makeParticle());
      e.obj.material = color;
      e.x = pos.x; e.y = pos.y; e.z = pos.z;
      e.vx = rand(-1, 1) * speed; e.vy = rand(0.5, 1.5) * speed; e.vz = rand(-1, 1) * speed;
      e.life = rand(0.4, 0.9);
      e.obj.position.set(e.x, e.y, e.z);
      this.particles.push(e);
    }
  }

  // ── queries ───────────────────────────────────────────────────────────────
  /** Closest enemy or barrel along a ray. Returns { target, t } or null. */
  raycast(origin, dir, range) {
    let best = null, bestT = range;
    const test = (cx, cy, cz, radius, target) => {
      const vx = cx - origin.x, vy = cy - origin.y, vz = cz - origin.z;
      const t = vx * dir.x + vy * dir.y + vz * dir.z;
      if (t < 0.3 || t > bestT) return;
      const px = vx - dir.x * t, py = vy - dir.y * t, pz = vz - dir.z * t;
      if (px * px + py * py + pz * pz <= radius * radius) { best = target; bestT = t; }
    };
    for (const e of this.enemies) {
      if (!e.active || !e.warned || e.dying) continue;
      test(e.x, e.size / 2, e.z, ENEMY_RADIUS, e);
    }
    for (const e of this.obstacles) {
      if (!e.active || !e.warned || e.type !== OBSTACLE.BARREL) continue;
      test(e.obj.position.x, 0.6, e.z, BARREL_RADIUS, e);
    }
    return best ? { target: best, t: bestT } : null;
  }

  /** Nearest live enemy inside a cone around dir (for autoAim / crosshair). */
  nearestInCone(origin, dir, cosLimit, range) {
    let best = null, bestT = range;
    for (const e of this.enemies) {
      if (!e.active || !e.warned || e.dying) continue;
      const vx = e.x - origin.x, vy = e.size / 2 - origin.y, vz = e.z - origin.z;
      const len = Math.hypot(vx, vy, vz);
      if (len < 0.5 || len > bestT) continue;
      const cos = (vx * dir.x + vy * dir.y + vz * dir.z) / len;
      if (cos >= cosLimit) { best = e; bestT = len; }
    }
    return best;
  }

  // ── damage ────────────────────────────────────────────────────────────────
  damageEnemy(e, amount, hitPos) {
    if (!e.active || e.dying) return false;
    e.hp -= amount;
    e.flashT = 0.08;
    this.burst({ x: e.x, y: e.size / 2, z: e.z }, 3, this.mats.gib, 3);
    if (e.hp <= 0) {
      e.dying = 0.001;
      this.burst({ x: e.x, y: e.size / 2, z: e.z }, 10, this.mats.gib, 5);
      this.events?.onKill?.(e);
      return true;
    }
    this.events?.onEnemyHit?.(e);
    return false;
  }

  damageBarrel(e, playerZ) {
    if (!e.active || e.hit) return;
    e.hit = true;
    const pos = { x: e.obj.position.x, y: 0.6, z: e.z };
    this.burst(pos, 14, this.mats.spark, 6);
    this.burst(pos, 6, this.mats.barrelBand, 4);
    this.events?.onExplosion?.(pos);
    // splash on nearby enemies
    for (const en of this.enemies) {
      if (!en.active || en.dying) continue;
      if (Math.hypot(en.x - pos.x, en.z - pos.z) < 2.6) this.damageEnemy(en, 3);
    }
    // splash on player if very close
    if (playerZ !== undefined && Math.abs(playerZ - e.z) < 1.6 && this._playerLaneX !== undefined && Math.abs(this._playerLaneX - pos.x) < 1.6) {
      this.events?.onPlayerHit?.(DAMAGE.BARREL_EXPLODE, 'barrel explosion');
    }
    this._removeObstacle(e);
  }

  _removeObstacle(e) {
    const i = this.obstacles.indexOf(e);
    if (i >= 0) this.obstacles.splice(i, 1);
    this._release('obstacle', e);
  }

  // ── update ────────────────────────────────────────────────────────────────
  /**
   * @param {number} dt
   * @param {object} p player: { x, z, y (jump height), sliding, lane, invulnerable }
   * @param {object} aim { origin, dir } for crosshair highlighting (unused here)
   */
  update(dt, p) {
    this.time += dt;
    this._playerLaneX = p.x;
    const telegraphDist = Math.max(4, PARAMS.playerSpeed * PARAMS.hazardTelegraphTime);
    const speedMul = PARAMS.enemySpeed;

    // obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const e = this.obstacles[i];
      const dist = p.z - e.z;
      if (dist < -3) { this.obstacles.splice(i, 1); this._release('obstacle', e); continue; }
      if (!e.warned && dist <= telegraphDist) {
        e.warned = true;
        this.events?.onTelegraph?.(e);
      }
      e.parts.ring.visible = e.warned && dist > 1;
      e.parts.ring.scale.setScalar(1 + 0.25 * Math.sin(this.time * 12));
      if (e.type === OBSTACLE.BLADE) {
        e.phase += dt * 2.2 * speedMul;
        const x = Math.sin(e.phase) * 2.2;
        e.parts.blade.position.x = x;
        e.parts.blade.rotation.z += dt * 14;
        e.parts.ring.position.x = x;
      }
      // collision window
      if (Math.abs(dist) < 0.7 && !e.hit) {
        let hit = false, cause = e.type, dmg = 0;
        const dx = Math.abs(p.x - LANE_X[e.lane]);
        switch (e.type) {
          case OBSTACLE.BARREL: hit = dx < 1.0 && p.y < 1.05; dmg = DAMAGE.BARREL_HIT; break;
          case OBSTACLE.BEAM: hit = !p.sliding; dmg = DAMAGE.BEAM; cause = 'low beam'; break;
          case OBSTACLE.PIT: hit = dx < 0.95 && p.y < 0.35; dmg = DAMAGE.PIT; cause = 'pit'; break;
          case OBSTACLE.GATE: hit = Math.abs(p.x - LANE_X[e.openLane]) > 1.1; dmg = DAMAGE.GATE; cause = 'gate'; break;
          case OBSTACLE.BLADE: hit = Math.abs(p.x - e.parts.blade.position.x) < 1.1 && !p.sliding && p.y < 0.9; dmg = DAMAGE.BLADE; cause = 'blade'; break;
        }
        if (hit) {
          e.hit = true;
          this.events?.onPlayerHit?.(dmg, cause, e);
          if (e.type === OBSTACLE.BARREL) {
            this.burst({ x: e.obj.position.x, y: 0.6, z: e.z }, 8, this.mats.barrel, 4);
            this._removeObstacle(e);
          }
        }
      }
    }

    // enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dist = p.z - e.z;
      if (e.dying) {
        e.dying += dt;
        const k = clamp(e.dying / 0.4, 0, 1);
        e.sprite.scale.set(e.size * (1 - 0.3 * k), e.size * (1 - k), 1);
        e.sprite.position.y = (e.size / 2) * (1 - k) + 0.05;
        e.sprite.material.opacity = 1 - k;
        e.ring.visible = false;
        if (k >= 1) { this.enemies.splice(i, 1); this._release('enemy', e); }
        continue;
      }
      if (dist < -4) { this.enemies.splice(i, 1); this._release('enemy', e); continue; }
      if (!e.warned && dist <= telegraphDist) {
        e.warned = true;
        this.burst({ x: e.x, y: e.size / 2, z: e.z }, 8, this.mats.spark, 3);
        this.events?.onTelegraph?.(e);
      }

      e.animT += dt;
      const frame = Math.floor(e.animT * 4) % 2;
      if (frame !== e.frame) { e.frame = frame; e.sprite.material.map = this.sprites[e.type][frame].map; e.sprite.material.needsUpdate = true; }
      if (e.flashT > 0) { e.flashT -= dt; e.sprite.material.color.set(e.flashT > 0 ? 0xff6060 : 0xffffff); }
      e.ring.scale.setScalar(1 + 0.25 * Math.sin(this.time * 12 + e.seed));

      if (e.type === ENEMY.IMP) {
        if (e.warned) e.z += dt * 3.2 * speedMul; // charges once telegraphed
        if (!e.tracked && dist < 16 && PARAMS.enemyAggression > 0.45 && Math.random() < PARAMS.enemyAggression * 0.9) {
          e.tracked = true; e.lane = p.lane;
        }
        e.x = lerp(e.x, LANE_X[e.lane], Math.min(1, dt * 3));
        e.obj.position.set(e.x, 0, e.z);
        if (dist < 1.5 && dist > -0.5 && Math.abs(p.x - e.x) < 1.1) {
          this.events?.onPlayerHit?.(DAMAGE.IMP_LUNGE, 'imp', e);
          e.dying = 0.001; // it clawed you and is gone
        }
      } else {
        // archer
        e.obj.position.set(e.x, 0, e.z);
        if (e.warned && dist > 3 && dist < 40 && PARAMS.enemyAggression > 0.02) {
          e.fireT -= dt;
          if (e.fireT <= 0) {
            e.fireT = clamp(2.6 - 2.0 * PARAMS.enemyAggression, 0.55, 3) + rand(-0.15, 0.15);
            const tx = p.x, tz = p.z + 1.5;
            const dx = tx - e.x, dz = tz - e.z;
            const len = Math.hypot(dx, dz) || 1;
            const speed = 11 + 7 * speedMul;
            this.spawnProjectile('enemy', { x: e.x, y: 1.3, z: e.z }, { x: dx / len, y: 0, z: dz / len }, speed, DAMAGE.ARROW);
            e.frame = 1; e.animT = 0.2;
            this.events?.onEnemyFire?.(e);
          }
        }
      }
      e.ring.visible = e.warned && dist > 1;
    }

    // pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const e = this.pickups[i];
      const dist = p.z - e.z;
      if (dist < -2) { this.pickups.splice(i, 1); this._release('pickup', e); continue; }
      e.bob += dt * 3;
      e.sprite.position.y = 0.9 + Math.sin(e.bob) * 0.12;
      if (Math.abs(dist) < 0.9 && Math.abs(p.x - LANE_X[e.lane]) < 1.0 && p.y < 1.3) {
        this.events?.onPickup?.(e.type, e);
        this.burst({ x: LANE_X[e.lane], y: 0.9, z: e.z }, 6, this.mats.spark, 2.5);
        this.pickups.splice(i, 1); this._release('pickup', e);
      }
    }

    // projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const e = this.projectiles[i];
      e.life -= dt;
      const step = dt;
      const nx = e.x + e.vx * step, ny = e.y + e.vy * step, nz = e.z + e.vz * step;
      let dead = e.life <= 0 || ny < 0 || ny > 4.2 || Math.abs(nx) > HALF_WIDTH;
      if (e.owner === 'player') {
        // sweep test against enemies and barrels
        const dx = nx - e.x, dy = ny - e.y, dz = nz - e.z;
        const len = Math.hypot(dx, dy, dz) || 1;
        const hit = this.raycast({ x: e.x, y: e.y, z: e.z }, { x: dx / len, y: dy / len, z: dz / len }, len + 0.3);
        if (hit) {
          const t = hit.target;
          if (t.kind === 'enemy') {
            this.damageEnemy(t, e.dmg);
            if (e.splash > 0) {
              for (const en of this.enemies) {
                if (en !== t && en.active && !en.dying && Math.hypot(en.x - t.x, en.z - t.z) < e.splash) this.damageEnemy(en, e.dmg * 0.5);
              }
            }
          } else {
            this.damageBarrel(t, p.z);
          }
          this.burst({ x: nx, y: ny, z: nz }, 5, this.mats.plasma, 3);
          dead = true;
        }
        if (nz < p.z - 70) dead = true;
      } else {
        // enemy arrow vs player
        if (Math.abs(nz - p.z) < 0.8 && Math.abs(nx - p.x) < 0.75 && !p.sliding && p.y < 1.1) {
          this.events?.onPlayerHit?.(e.dmg, 'arrow', e);
          dead = true;
        }
        if (nz > p.z + 3) dead = true;
      }
      if (dead) { this.projectiles.splice(i, 1); this._release('projectile', e); continue; }
      e.x = nx; e.y = ny; e.z = nz;
      e.obj.position.set(nx, ny, nz);
      if (e.owner === 'player') e.obj.rotation.y += dt * 20;
    }

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const e = this.particles[i];
      e.life -= dt;
      if (e.life <= 0) { this.particles.splice(i, 1); this._release('particle', e); continue; }
      e.vy -= 14 * dt;
      e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt;
      if (e.y < 0.07) { e.y = 0.07; e.vy *= -0.3; e.vx *= 0.6; e.vz *= 0.6; }
      e.obj.position.set(e.x, e.y, e.z);
      e.obj.rotation.x += dt * 6; e.obj.rotation.z += dt * 4;
    }
  }

  /** Hazards that are telegraphed and still ahead, for HUD markers. */
  warnings(playerZ) {
    const out = [];
    for (const e of this.obstacles) {
      if (!e.active || !e.warned || e.hit) continue;
      const dist = playerZ - e.z;
      if (dist < 0.5) continue;
      const x = e.type === OBSTACLE.BLADE ? e.parts.blade.position.x : e.type === OBSTACLE.GATE ? LANE_X[e.openLane] : e.obj.position.x;
      out.push({ type: e.type, x, z: e.z, dist });
    }
    for (const e of this.enemies) {
      if (!e.active || !e.warned || e.dying) continue;
      const dist = playerZ - e.z;
      if (dist < 0.5) continue;
      out.push({ type: e.type, x: e.x, z: e.z, dist, y: e.size });
    }
    return out;
  }

  /** Simple danger metric 0–1 for audio/HUD. */
  danger(playerZ) {
    let d = 0;
    for (const e of this.enemies) {
      if (!e.active || !e.warned || e.dying) continue;
      const dist = playerZ - e.z;
      if (dist > 0 && dist < 30) d += (30 - dist) / 30;
    }
    return clamp(d / 3, 0, 1);
  }
}

// ── Spawner ─────────────────────────────────────────────────────────────────

export class Spawner {
  constructor(entities) {
    this.entities = entities;
    this.enemyCarry = 0;
    this.pickupCarry = 0;
    this.graceZ = -SEG_LEN * 1.5; // nothing spawns closer than this at the start of a run
    this.playerHealthRef = () => 100;
  }

  reset() {
    this.enemyCarry = 0;
    this.pickupCarry = 0;
  }

  /** Populate a freshly recycled segment using the live parameters. */
  populate(seg) {
    if (seg.frontZ > this.graceZ) return;
    const slots = [];
    for (let z = seg.frontZ - 2.4; z > seg.backZ + 1.5; z -= 2.4) slots.push(z);
    // shuffle
    for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }

    // obstacles
    const maxObs = 4;
    const nObs = Math.min(maxObs, Math.floor(PARAMS.obstacleDensity * maxObs + Math.random()));
    const types = [OBSTACLE.BARREL];
    const v = PARAMS.obstacleVariety;
    if (v >= 1) types.push(OBSTACLE.BEAM);
    if (v >= 2) types.push(OBSTACLE.PIT, OBSTACLE.GATE, OBSTACLE.BARREL);
    if (v >= 3) types.push(OBSTACLE.BLADE);
    let lastBeamZ = Infinity;
    for (let i = 0; i < nObs && slots.length; i++) {
      const z = slots.pop();
      let type = pick(types);
      // avoid two full-width hazards too close together (impossible to react)
      if ((type === OBSTACLE.BEAM || type === OBSTACLE.GATE || type === OBSTACLE.BLADE) && Math.abs(lastBeamZ - z) < 6) type = OBSTACLE.BARREL;
      if (type === OBSTACLE.BEAM || type === OBSTACLE.GATE || type === OBSTACLE.BLADE) lastBeamZ = z;
      this.entities.spawnObstacle(type, randInt(0, 2), z);
    }

    // enemies
    this.enemyCarry += PARAMS.enemySpawnRate * (SEG_LEN / 100);
    let nEn = Math.floor(this.enemyCarry);
    this.enemyCarry -= nEn;
    while (nEn-- > 0 && slots.length) {
      const z = slots.pop();
      const type = Math.random() < 0.35 && PARAMS.enemyAggression > 0.05 ? ENEMY.ARCHER : ENEMY.IMP;
      this.entities.spawnEnemy(type, randInt(0, 2), z);
    }

    // pickups
    this.pickupCarry += PARAMS.pickupFrequency * 2;
    let nPk = Math.floor(this.pickupCarry);
    this.pickupCarry -= nPk;
    while (nPk-- > 0 && slots.length) {
      const z = slots.pop();
      const hp = this.playerHealthRef();
      const r = Math.random();
      let kind = PICKUP.GOLD;
      if (hp < 60 && r < 0.5) kind = PICKUP.HEALTH;
      else if (r < 0.3) kind = PICKUP.AMMO;
      else if (r < 0.45) kind = PICKUP.HEALTH;
      this.entities.spawnPickup(kind, randInt(0, 2), z);
    }
  }
}
