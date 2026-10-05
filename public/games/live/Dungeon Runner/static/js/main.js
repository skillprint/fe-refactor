/**
 * Dungeon Runner — entry point / game state machine.
 */
/* global THREE */
import { EYE_HEIGHT, SLIDE_HEIGHT, SCORE, PICKUP, ENEMY, WEAPONS, clamp, lerp } from './constants.js';
import { PARAMS, onParamChange, resetParams, setParam, getParamDef } from './params.js';
import { initSkillprint, getTargetFromUrl } from './skillprint.js';
import { makeMaterials, makeSpriteMaterials } from './textures.js';
import { World } from './world.js';
import { Entities, Spawner } from './entities.js';
import { Weapons } from './weapons.js';
import { Player } from './player.js';
import { Hud } from './hud.js';
import { GameAudio } from './audio.js';

const YAW_LIMIT = THREE.MathUtils.degToRad(35);
const PITCH_LIMIT = THREE.MathUtils.degToRad(15);

class Game {
  constructor() {
    this.state = 'menu';
    this.time = 0;
    this.lastFrame = performance.now();
    this.fps = 0; this._fpsAcc = 0; this._fpsN = 0;
    this.score = 0; this.kills = 0; this.gold = 0; this.combo = 0; this.comboT = 0;
    this.shake = 0;
    this.pausedByParent = false;

    this.$ = (id) => document.getElementById(id);
    this.glCanvas = this.$('gl');
    this.hudCanvas = this.$('hud');

    // three.js
    this.renderer = new THREE.WebGLRenderer({ canvas: this.glCanvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05030a);
    this.scene.fog = new THREE.FogExp2(0x05030a, PARAMS.fogDensity);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
    this.camera.rotation.order = 'YXZ';
    this.ambient = new THREE.AmbientLight(0x554433, 0.5);
    this.hemi = new THREE.HemisphereLight(0x3a2a40, 0x1a0c08, 0.35);
    this.scene.add(this.ambient, this.hemi);
    this.gunLight = new THREE.PointLight(0xffc070, 0, 10, 1.5);
    this.scene.add(this.gunLight);

    this.mats = makeMaterials();
    this.sprites = makeSpriteMaterials();
    this.world = new World(this.scene, this.mats);
    this.entities = new Entities(this.scene, this.mats, this.sprites);
    this.spawner = new Spawner(this.entities);
    this.audio = new GameAudio();
    this.weapons = new Weapons(this.entities, this.audio);
    this.player = new Player();
    this.hud = new Hud(this.hudCanvas);
    this.spawner.playerHealthRef = () => this.player.health;

    this.aim = { nx: 0, ny: 0, x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.firing = false;
    this.fireQueued = false;
    this.keys = new Set();
    this.telegraphSoundT = 0;
    this._tmpDir = new THREE.Vector3();

    this.target = getTargetFromUrl();

    this.entities.events = {
      onPlayerHit: (amount, cause) => this.onPlayerHit(amount, cause),
      onKill: (e) => this.onKill(e),
      onEnemyHit: () => this.audio.hit(),
      onPickup: (kind) => this.onPickup(kind),
      onTelegraph: (e) => this.onTelegraph(e),
      onExplosion: (pos) => { this.audio.explosion(); this.shake = Math.max(this.shake, 0.8); },
      onEnemyFire: () => {},
    };

    this.skillprint = initSkillprint({
      onAdjust: (name, value, res, source) => this.onAdjust(name, value, source),
      onPause: () => { if (this.state === 'playing') { this.pausedByParent = true; this.pause(); } },
      // Resume whenever paused: a click on the portal chrome blurs the iframe (self-pause)
      // before the portal's own GAME_PAUSE/GAME_RESUME arrive.
      onResume: () => { if (this.state === 'paused') this.resume(); },
    });

    onParamChange(({ name, value }) => this.applyParam(name, value));

    this.world.build();
    this.applyAllParams();
    this.bindUi();
    this.bindInput();
    this.updateCamera(0);
    requestAnimationFrame((t) => this.loop(t));
  }

  // ── params ────────────────────────────────────────────────────────────
  applyAllParams() {
    this.scene.fog.density = PARAMS.fogDensity;
    this.ambient.intensity = 0.25 + 0.55 * PARAMS.lightLevel;
    this.hemi.intensity = 0.2 + 0.3 * PARAMS.lightLevel;
    this.weapons.setWeapon(PARAMS.weaponType, true);
  }

  applyParam(name, value) {
    switch (name) {
      case 'fogDensity': this.scene.fog.density = value; break;
      case 'lightLevel':
        this.ambient.intensity = 0.25 + 0.55 * value;
        this.hemi.intensity = 0.2 + 0.3 * value;
        break;
      case 'weaponType': this.weapons.setWeapon(value, true); break;
      default: break;
    }
  }

  onAdjust(name, value, source) {
    const def = getParamDef(name);
    const label = def ? def.name.replace(/([A-Z])/g, ' $1').toLowerCase() : name;
    const shown = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : String(value);
    this.hud.toast(`${source === 'backend' ? 'SKILLPRINT' : 'PRESET'}  ${label} → ${shown}`, source === 'backend' ? '#7ef0b0' : '#8ad0ff');
  }

  // ── ui ────────────────────────────────────────────────────────────────
  bindUi() {
    const t = this.target.mood || this.target.skill;
    if (t) {
      this.$('target').classList.remove('hidden');
      this.$('target-value').textContent = t;
    }
    const isTouch = ('ontouchstart' in window) && !window.matchMedia('(pointer:fine)').matches;
    if (isTouch) this.$('desktop-note').classList.remove('hidden');
    this.$('start').addEventListener('click', () => this.startRun());
    this.$('retry').addEventListener('click', () => this.startRun());
    this.$('resume').addEventListener('click', () => this.resume());
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('blur', () => { if (this.state === 'playing') this.pause(); });
  }

  showOverlay(id) {
    for (const o of ['menu', 'pause', 'gameover']) this.$(o).classList.toggle('hidden', o !== id);
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.hud.resize();
  }

  // ── input ─────────────────────────────────────────────────────────────
  bindInput() {
    const el = this.$('game');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      this.aim.x = e.clientX - r.left; this.aim.y = e.clientY - r.top;
      this.aim.nx = clamp((this.aim.x / r.width) * 2 - 1, -1, 1);
      this.aim.ny = clamp((this.aim.y / r.height) * 2 - 1, -1, 1);
    });
    el.addEventListener('mousedown', (e) => { if (e.button === 0 && this.state === 'playing') { this.firing = true; this.fireQueued = true; e.preventDefault(); } });
    window.addEventListener('mouseup', (e) => { if (e.button === 0) this.firing = false; });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('wheel', (e) => { if (this.state === 'playing') { this.weapons.cycle(e.deltaY > 0 ? 1 : -1); e.preventDefault(); } }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'tab') { this.hud.debug = !this.hud.debug; e.preventDefault(); return; }
      if (k === 'escape' || k === 'p') {
        if (this.state === 'playing') this.pause(); else if (this.state === 'paused') this.resume();
        return;
      }
      if (this.state === 'menu' && (k === 'enter' || k === ' ')) { this.startRun(); return; }
      if (this.state === 'dead' && (k === 'enter' || k === 'r')) { this.startRun(); return; }
      if (this.state !== 'playing') return;
      switch (k) {
        case 'a': case 'arrowleft': this.player.moveLane(-1); break;
        case 'd': case 'arrowright': this.player.moveLane(1); break;
        case 'w': case 'arrowup': case ' ': if (this.player.jump()) this.audio.jump(); e.preventDefault(); break;
        case 's': case 'arrowdown': case 'control': this.player.slide(); e.preventDefault(); break;
        case 'q': this.weapons.cycle(-1); break;
        case 'e': this.weapons.cycle(1); break;
        default: break;
      }
    });
  }

  // ── state ─────────────────────────────────────────────────────────────
  startRun() {
    this.audio.unlock();
    this.audio.resume();
    this.player.reset();
    this.entities.clear();
    this.spawner.reset();
    this.world.build();
    this.weapons.reset(PARAMS.weaponType);
    this.score = 0; this.kills = 0; this.gold = 0; this.combo = 0; this.comboT = 0; this.shake = 0;
    this.hud.toasts = []; this.hud.popups = []; this.hud.damageFlash = 0;
    this.pausedByParent = false;
    this.firing = false;
    this.runStart = performance.now();
    this.state = 'playing';
    this.showOverlay(null);
    this.lastFrame = performance.now();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.firing = false;
    this.audio.suspend();
    this.showOverlay('pause');
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.pausedByParent = false;
    this.audio.resume();
    this.showOverlay(null);
    this.lastFrame = performance.now();
  }

  die() {
    this.state = 'dead';
    this.firing = false;
    const p = this.player;
    const secs = Math.floor(p.runTime);
    const acc = Math.round(this.weapons.accuracy * 100);
    this.$('death-cause').textContent = `Killed by ${p.deathCause || 'the dungeon'} after ${Math.floor(p.distance)} metres.`;
    this.$('st-score').textContent = Math.floor(this.score);
    this.$('st-distance').textContent = Math.floor(p.distance);
    this.$('st-kills').textContent = this.kills;
    this.$('st-accuracy').textContent = `${acc}%`;
    this.$('st-hits').textContent = p.hitsTaken;
    this.$('st-time').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    this.showOverlay('gameover');
    this.skillprint.sendComplete({
      score: Math.floor(this.score),
      level: Math.max(1, Math.floor(p.distance / 200) + 1),
      achievements: [],
      accuracy: acc,
      mistakes: p.hitsTaken,
      bonus: this.gold,
      distance: Math.floor(p.distance),
      kills: this.kills,
      time: secs,
      deathCause: p.deathCause,
    });
  }

  // ── events ────────────────────────────────────────────────────────────
  onPlayerHit(amount, cause) {
    if (this.state !== 'playing') return;
    if (!this.player.takeDamage(amount, cause)) return;
    this.audio.playerHurt();
    this.hud.damageFlash = 1;
    this.shake = Math.max(this.shake, 1);
    this.combo = 0; this.comboT = 0;
    if (this.player.dead) this.die();
  }

  onKill(e) {
    this.audio.enemyDeath();
    this.kills += 1;
    this.comboT = 3;
    this.combo = Math.min(9, this.combo + 1);
    const pts = SCORE.KILL * Math.max(1, this.combo);
    this.score += pts;
    const pt = this.project(e.x, e.size / 2, e.z);
    if (pt) this.hud.popup(`+${pts}`, pt.x, pt.y, e.type === ENEMY.ARCHER ? '#7ef0b0' : '#ffb070');
    this.skillprint.sendScore({ score: Math.floor(this.score), kills: this.kills, distance: Math.floor(this.player.distance) });
  }

  onPickup(kind) {
    this.audio.pickup(kind);
    this.hud.pickupFlash = 1;
    if (kind === PICKUP.HEALTH) { this.player.heal(25); this.hud.popup('+25 HP', this.aim.x, this.aim.y - 40, '#ff6a6a'); this.score += SCORE.PICKUP; }
    else if (kind === PICKUP.AMMO) { this.weapons.addAmmo(); this.hud.popup('AMMO', this.aim.x, this.aim.y - 40, '#ffd27a'); this.score += SCORE.PICKUP; }
    else { this.gold += SCORE.GOLD; this.score += SCORE.GOLD; this.hud.popup(`+${SCORE.GOLD}`, this.aim.x, this.aim.y - 40, '#d9a441'); }
  }

  onTelegraph() {
    if (this.telegraphSoundT <= 0) { this.audio.telegraph(); this.telegraphSoundT = 0.25; }
  }

  // ── camera / projection ───────────────────────────────────────────────
  updateCamera(dt) {
    const p = this.player;
    const eye = p.sliding ? SLIDE_HEIGHT : EYE_HEIGHT;
    const bob = this.state === 'playing' ? Math.sin(p.bobPhase * 2) * 0.045 : 0;
    const sh = this.shake * PARAMS.screenShake;
    const sx = (Math.random() - 0.5) * 0.12 * sh, sy = (Math.random() - 0.5) * 0.1 * sh;
    this.camera.position.set(p.x + sx, eye + p.y + bob + sy, p.z);
    const yaw = -this.aim.nx * YAW_LIMIT;
    const pitch = -this.aim.ny * PITCH_LIMIT;
    this.camera.rotation.set(pitch, yaw, (Math.random() - 0.5) * 0.02 * sh);
  }

  project(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    if (v.z > 1 || v.z < -1) return null;
    return { x: (v.x + 1) / 2 * this.hud.w, y: (1 - v.y) / 2 * this.hud.h };
  }

  // ── loop ──────────────────────────────────────────────────────────────
  loop(now) {
    requestAnimationFrame((t) => this.loop(t));
    let dt = (now - this.lastFrame) / 1000;
    this.lastFrame = now;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this._fpsAcc += dt; this._fpsN += 1;
    if (this._fpsAcc >= 0.5) { this.fps = Math.round(this._fpsN / this._fpsAcc); this._fpsAcc = 0; this._fpsN = 0; }

    if (this.state === 'playing') this.step(dt);
    else if (this.state === 'menu') {
      // slow drift so the menu has a living background
      this.player.z -= dt * 1.5;
      for (const seg of this.world.update(dt, this.player.z)) { /* menu: leave empty */ }
      this.entities.update(dt, { x: 0, z: this.player.z, y: 0, sliding: false, lane: 1 });
    }

    this.shake = Math.max(0, this.shake - dt * 3);
    this.updateCamera(dt);
    this.gunLight.position.copy(this.camera.position);
    this.gunLight.intensity = this.weapons.flash * 2.2;
    this.hud.update(dt);
    this.audio.update(this.state === 'playing' ? this.entities.danger(this.player.z) : 0);

    this.renderer.render(this.scene, this.camera);

    const dir = this.camera.getWorldDirection(this._tmpDir);
    const origin = this.camera.position;
    const hot = this.state === 'playing' && !!this.entities.raycast(origin, dir, 60);
    this.hud.render({
      state: this.state,
      player: this.player,
      weapons: this.weapons,
      score: this.score,
      kills: this.kills,
      combo: this.combo,
      comboT: this.comboT,
      warnings: this.state === 'playing' ? this.entities.warnings(this.player.z) : [],
      project: (x, y, z) => this.project(x, y, z),
      targetOnCrosshair: hot,
      aim: this.aim,
      fps: this.fps,
      time: this.time,
      target: this.target.mood || this.target.skill,
      screenshotCount: this.skillprint.screenshotCount,
      counts: { obstacles: this.entities.obstacles.length, enemies: this.entities.enemies.length, pickups: this.entities.pickups.length, projectiles: this.entities.projectiles.length },
    });

    // Screenshot right after render so the WebGL buffer is still intact.
    this.skillprint.tickScreenshot(now, this.glCanvas, this.hudCanvas);
  }

  step(dt) {
    const p = this.player;
    const prevDist = p.distance;
    p.update(dt);
    this.score += (p.distance - prevDist) * SCORE.METRE;

    for (const seg of this.world.update(dt, p.z)) this.spawner.populate(seg);

    this.telegraphSoundT -= dt;
    this.comboT -= dt;
    if (this.comboT <= 0) { this.combo = 0; this.comboT = 0; }

    this.weapons.update(dt);
    if (this.firing || this.fireQueued) {
      this.fireQueued = false;
      this.updateCamera(0);
      const dir = this.camera.getWorldDirection(this._tmpDir);
      const r = this.weapons.fire({ x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z }, { x: dir.x, y: dir.y, z: dir.z }, p.z);
      if (r.fired) this.shake = Math.max(this.shake, this.weapons.def.id === 1 ? 0.45 : 0.15);
    }

    this.entities.update(dt, { x: p.x, z: p.z, y: p.y, sliding: p.sliding, lane: p.lane });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  try {
    window.dungeonRunner = new Game();
  } catch (err) {
    console.error('[DungeonRunner] failed to start', err);
    const m = document.getElementById('menu');
    if (m) m.querySelector('.lede').textContent = `Could not start the renderer: ${err.message}`;
  }
});

// Expose for the standalone harness / debugging.
window.DungeonRunnerParams = { PARAMS, setParam, resetParams };
