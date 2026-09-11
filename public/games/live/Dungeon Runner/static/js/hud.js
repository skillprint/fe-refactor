/**
 * 2D canvas HUD drawn over the WebGL canvas. Because it is a canvas (not DOM) the
 * Skillprint screenshot can composite it so the vision model sees health and score.
 */
import { WEAPONS, OBSTACLE, ENEMY, PLAYER_MAX_HEALTH, clamp } from './constants.js';
import { PARAMS, PARAM_DEFS, PARAM_SOURCE } from './params.js';

const FONT_TITLE = '"Impact","Arial Narrow Bold","Helvetica Neue",Arial,sans-serif';
const FONT_BODY = '"Trebuchet MS","Helvetica Neue",Arial,sans-serif';

export class Hud {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.toasts = [];
    this.popups = [];
    this.damageFlash = 0;
    this.pickupFlash = 0;
    this.debug = false;
    this.w = 1; this.h = 1; this.dpr = 1;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
  }

  toast(text, color = '#ffb070') {
    this.toasts.unshift({ text, color, t: 4.5 });
    if (this.toasts.length > 4) this.toasts.length = 4;
  }

  popup(text, x, y, color = '#ffd27a') {
    if (PARAMS.scoreFeedback <= 0.05) return;
    this.popups.push({ text, x, y, t: 1.1, color });
    if (this.popups.length > 12) this.popups.shift();
  }

  update(dt) {
    for (const t of this.toasts) t.t -= dt;
    this.toasts = this.toasts.filter((t) => t.t > 0);
    for (const p of this.popups) { p.t -= dt; p.y -= dt * 40; }
    this.popups = this.popups.filter((p) => p.t > 0);
    this.damageFlash = Math.max(0, this.damageFlash - dt * 1.6);
    this.pickupFlash = Math.max(0, this.pickupFlash - dt * 3);
  }

  /**
   * @param {object} s  { state, player, weapons, score, combo, comboT, kills, warnings, project, targetOnCrosshair, fps, time, target }
   */
  render(s) {
    const ctx = this.ctx, W = this.w, H = this.h;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (s.state === 'menu') return;

    const p = s.player;

    // ── damage / low health vignette ─────────────────────────────────────
    const low = p.health < 30 ? (0.25 + 0.15 * Math.sin(s.time * 8)) : 0;
    const vig = clamp(this.damageFlash * 0.8 + low, 0, 0.9);
    if (vig > 0.01) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.8);
      g.addColorStop(0, 'rgba(180,0,0,0)');
      g.addColorStop(1, `rgba(180,0,0,${vig})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.pickupFlash > 0.01) {
      ctx.fillStyle = `rgba(255,220,120,${this.pickupFlash * 0.12})`;
      ctx.fillRect(0, 0, W, H);
    }

    // ── hazard markers (telegraph) ───────────────────────────────────────
    for (const wnd of s.warnings) {
      const pt = s.project(wnd.x, wnd.y ? wnd.y + 0.35 : 0.9, wnd.z);
      if (!pt) continue;
      const a = clamp(1 - wnd.dist / 60, 0.25, 1);
      let glyph = '▲', col = '#ff5a3a', label = '';
      switch (wnd.type) {
        case OBSTACLE.BARREL: glyph = '▲'; col = '#ffb070'; label = 'JUMP / SHOOT'; break;
        case OBSTACLE.PIT: glyph = '▲'; col = '#ff8a3d'; label = 'JUMP'; break;
        case OBSTACLE.BEAM: glyph = '▼'; col = '#8ad0ff'; label = 'SLIDE'; break;
        case OBSTACLE.BLADE: glyph = '▼'; col = '#c8c8ff'; label = 'SLIDE'; break;
        case OBSTACLE.GATE: glyph = '◆'; col = '#7cff9a'; label = 'OPEN LANE'; break;
        case ENEMY.IMP: glyph = '☠'; col = '#ff4040'; label = ''; break;
        case ENEMY.ARCHER: glyph = '➶'; col = '#7ef0b0'; label = ''; break;
      }
      ctx.globalAlpha = a;
      ctx.font = `bold 22px ${FONT_BODY}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = col;
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
      ctx.fillText(glyph, pt.x, pt.y);
      if (label && wnd.dist < 18) {
        ctx.font = `bold 10px ${FONT_BODY}`;
        ctx.fillText(label, pt.x, pt.y + 12);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // ── weapon viewmodel ─────────────────────────────────────────────────
    this._drawGun(s);

    // ── crosshair ────────────────────────────────────────────────────────
    const cx = s.aim.x, cy = s.aim.y;
    const hot = s.targetOnCrosshair;
    ctx.strokeStyle = hot ? '#ff4a4a' : 'rgba(255,240,220,0.9)';
    ctx.lineWidth = 2;
    const r = hot ? 9 : 7, gap = 3;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + r);
    ctx.stroke();
    if (hot) { ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke(); }

    // ── bottom bar ───────────────────────────────────────────────────────
    const barH = 62;
    ctx.fillStyle = 'rgba(8,4,10,0.72)';
    ctx.fillRect(0, H - barH, W, barH);
    ctx.fillStyle = '#3a2a2a';
    ctx.fillRect(0, H - barH, W, 2);

    // health
    const hp = p.health / PLAYER_MAX_HEALTH;
    ctx.font = `13px ${FONT_BODY}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a9998a';
    ctx.fillText('HEALTH', 18, H - barH + 20);
    ctx.fillStyle = '#2a1416';
    ctx.fillRect(18, H - barH + 28, 200, 18);
    ctx.fillStyle = hp > 0.5 ? '#c8262e' : hp > 0.25 ? '#e0602a' : '#ff2a2a';
    ctx.fillRect(18, H - barH + 28, 200 * hp, 18);
    ctx.font = `bold 22px ${FONT_TITLE}`;
    ctx.fillStyle = '#fff0e0';
    ctx.fillText(`${Math.ceil(p.health)}`, 226, H - barH + 45);

    // weapon + ammo
    const w = WEAPONS[s.weapons.current];
    ctx.textAlign = 'right';
    ctx.font = `13px ${FONT_BODY}`;
    ctx.fillStyle = '#a9998a';
    ctx.fillText('WEAPON  Q / E', W - 18, H - barH + 20);
    ctx.font = `bold 26px ${FONT_TITLE}`;
    ctx.fillStyle = w.color;
    const ammo = s.weapons.currentAmmo;
    ctx.fillText(`${w.name.toUpperCase()}  ${ammo === Infinity ? '∞' : ammo}`, W - 18, H - barH + 48);

    // ── top left: score block ───────────────────────────────────────────
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(8,4,10,0.6)';
    ctx.fillRect(12, 12, 190, 84);
    ctx.font = `13px ${FONT_BODY}`;
    ctx.fillStyle = '#a9998a';
    ctx.fillText('SCORE', 22, 32);
    ctx.font = `bold 28px ${FONT_TITLE}`;
    ctx.fillStyle = '#d9a441';
    ctx.fillText(`${Math.floor(s.score)}`, 22, 60);
    ctx.font = `12px ${FONT_BODY}`;
    ctx.fillStyle = '#c8b8a8';
    ctx.fillText(`${Math.floor(p.distance)} m   ${s.kills} kills   ${Math.round(s.weapons.accuracy * 100)}% acc`, 22, 84);

    // ── top centre: combo / speed ───────────────────────────────────────
    if (s.combo > 1 && PARAMS.scoreFeedback > 0.1) {
      const k = clamp(s.comboT / 3, 0, 1);
      ctx.textAlign = 'center';
      ctx.font = `bold ${26 + 10 * PARAMS.scoreFeedback}px ${FONT_TITLE}`;
      ctx.fillStyle = `rgba(255,${180 - s.combo * 10},60,${0.4 + 0.6 * k})`;
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 8;
      ctx.fillText(`x${s.combo} COMBO`, W / 2, 48);
      ctx.shadowBlur = 0;
    }
    ctx.textAlign = 'center';
    ctx.font = `11px ${FONT_BODY}`;
    ctx.fillStyle = 'rgba(200,184,168,0.7)';
    ctx.fillText(`${p.speed.toFixed(1)} m/s`, W / 2, H - barH - 8);

    // ── top right: target + toasts ──────────────────────────────────────
    ctx.textAlign = 'right';
    let ty = 30;
    if (s.target) {
      ctx.font = `12px ${FONT_BODY}`;
      ctx.fillStyle = '#ff8a3d';
      ctx.fillText(`TARGET  ${s.target.toUpperCase()}`, W - 18, ty);
      ty += 22;
    }
    for (const t of this.toasts) {
      const a = clamp(t.t, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(8,4,10,0.7)';
      ctx.font = `bold 13px ${FONT_BODY}`;
      const tw = ctx.measureText(t.text).width + 20;
      ctx.fillRect(W - 18 - tw, ty - 15, tw, 22);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, W - 28, ty);
      ctx.globalAlpha = 1;
      ty += 26;
    }

    // ── score popups ────────────────────────────────────────────────────
    for (const pp of this.popups) {
      ctx.globalAlpha = clamp(pp.t, 0, 1);
      ctx.font = `bold ${16 + 10 * PARAMS.scoreFeedback}px ${FONT_TITLE}`;
      ctx.fillStyle = pp.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
      ctx.fillText(pp.text, pp.x, pp.y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // ── paused / dead banners are DOM overlays; debug panel here ────────
    if (this.debug) this._drawDebug(s);
  }

  _drawGun(s) {
    const ctx = this.ctx, W = this.w, H = this.h;
    const wp = s.weapons;
    const w = WEAPONS[wp.current];
    const bobX = Math.sin(s.player.bobPhase) * 9;
    const bobY = Math.abs(Math.cos(s.player.bobPhase)) * 7 + (s.player.sliding ? 30 : 0) + (s.player.y > 0.05 ? 14 : 0);
    const kick = wp.recoil * 34;
    const gx = W / 2 + 90 + bobX + (s.aim.x - W / 2) * 0.12;
    const gy = H - 62 + bobY + kick;
    ctx.save();
    ctx.translate(gx, gy);
    // muzzle flash
    if (wp.flash > 0.05) {
      const fr = 30 + 40 * wp.flash;
      const g = ctx.createRadialGradient(-20, -120, 2, -20, -120, fr);
      g.addColorStop(0, `rgba(255,255,200,${wp.flash})`);
      g.addColorStop(0.4, `rgba(255,170,60,${wp.flash * 0.7})`);
      g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(-20, -120, fr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0a0608';
    if (w.id === 0) {
      // pistol: slide + grip
      ctx.fillStyle = '#3a3a42';
      ctx.fillRect(-46, -110, 52, 34);
      ctx.strokeRect(-46, -110, 52, 34);
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(-30, -76, 40, 70);
      ctx.strokeRect(-30, -76, 40, 70);
      ctx.fillStyle = '#6a6a72';
      ctx.fillRect(-46, -104, 52, 6);
      ctx.fillStyle = '#111';
      ctx.fillRect(-40, -100, 14, 8);
    } else if (w.id === 1) {
      // shotgun: double barrel + wooden stock
      ctx.fillStyle = '#2c2c34';
      ctx.fillRect(-58, -140, 24, 80); ctx.strokeRect(-58, -140, 24, 80);
      ctx.fillRect(-30, -140, 24, 80); ctx.strokeRect(-30, -140, 24, 80);
      ctx.fillStyle = '#111';
      ctx.fillRect(-52, -138, 12, 10); ctx.fillRect(-24, -138, 12, 10);
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(-64, -62, 78, 70); ctx.strokeRect(-64, -62, 78, 70);
      ctx.fillStyle = '#8a6a3a';
      ctx.fillRect(-60, -58, 70, 8);
    } else {
      // plasma: glowing tube
      const glow = 0.5 + 0.5 * Math.sin(s.time * 10);
      ctx.fillStyle = '#26303a';
      ctx.fillRect(-50, -130, 60, 100); ctx.strokeRect(-50, -130, 60, 100);
      ctx.fillStyle = `rgba(110,243,255,${0.5 + 0.4 * glow})`;
      ctx.fillRect(-40, -120, 40, 60);
      ctx.fillStyle = '#6ef3ff';
      ctx.fillRect(-46, -134, 52, 8);
      ctx.fillStyle = '#1a2028';
      ctx.fillRect(-30, -30, 30, 40); ctx.strokeRect(-30, -30, 30, 40);
    }
    ctx.restore();
  }

  _drawDebug(s) {
    const ctx = this.ctx;
    const x = 12, y = 110;
    const rows = PARAM_DEFS.length + 3;
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(x, y, 330, rows * 15 + 12);
    ctx.font = `11px Menlo, Consolas, monospace`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffb070';
    ctx.fillText(`PARAMS (Tab to hide)  fps ${s.fps}  shots ${s.screenshotCount}`, x + 8, y + 14);
    let yy = y + 30;
    for (const d of PARAM_DEFS) {
      const v = PARAMS[d.name];
      const src = PARAM_SOURCE[d.name];
      ctx.fillStyle = src === 'backend' ? '#7ef0b0' : src === 'preset' ? '#8ad0ff' : '#c8b8a8';
      const val = typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : String(v);
      ctx.fillText(`${d.tier === 1 ? '●' : '○'} ${d.name.padEnd(20)} ${String(val).padStart(6)}  ${src}`, x + 8, yy);
      yy += 15;
    }
    ctx.fillStyle = '#a9998a';
    ctx.fillText(`ent: obs ${s.counts.obstacles} en ${s.counts.enemies} pk ${s.counts.pickups} pr ${s.counts.projectiles}`, x + 8, yy);
  }
}
