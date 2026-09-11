/**
 * Procedural canvas textures and Doom-style enemy sprites. No external assets.
 */
/* global THREE */

function noise2(x, y, seed = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function pixelTexture(canvas, repeatX = 1, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  return tex;
}

/** Dark mortar + irregular stone bricks. */
export function stoneWallTexture(seed = 1, base = [92, 78, 70]) {
  const S = 128;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1412';
  ctx.fillRect(0, 0, S, S);
  const rows = 6;
  const bh = S / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 22;
    let x = -offset;
    while (x < S) {
      const bw = 24 + Math.floor(noise2(x, r, seed) * 22);
      const n = noise2(x + 3, r + 7, seed);
      const shade = 0.75 + n * 0.5;
      const col = base.map((v) => Math.min(255, Math.floor(v * shade)));
      ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.fillRect(x + 1, r * bh + 1, bw - 2, bh - 2);
      // highlight edge
      ctx.fillStyle = `rgba(255,240,220,${0.06 + n * 0.08})`;
      ctx.fillRect(x + 1, r * bh + 1, bw - 2, 2);
      // speckle
      for (let i = 0; i < 12; i++) {
        const px = x + 2 + Math.floor(noise2(i, x + r, seed + 3) * (bw - 4));
        const py = r * bh + 2 + Math.floor(noise2(i + 9, x - r, seed + 5) * (bh - 4));
        ctx.fillStyle = noise2(px, py, seed) > 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, py, 2, 2);
      }
      x += bw;
    }
  }
  // grime streaks
  for (let i = 0; i < 6; i++) {
    const gx = Math.floor(noise2(i, seed, 9) * S);
    ctx.fillStyle = 'rgba(10,6,4,0.35)';
    ctx.fillRect(gx, 0, 3 + Math.floor(noise2(i, 2, seed) * 5), S);
  }
  return c;
}

export function floorTexture(seed = 2) {
  const S = 128;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#12100f';
  ctx.fillRect(0, 0, S, S);
  const tiles = 4;
  const t = S / tiles;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      const n = noise2(x, y, seed);
      const v = 48 + Math.floor(n * 34);
      ctx.fillStyle = `rgb(${v + 6},${v},${v - 4})`;
      ctx.fillRect(x * t + 2, y * t + 2, t - 4, t - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x * t + 2, y * t + 2, t - 4, 2);
      if (n > 0.7) {
        ctx.fillStyle = 'rgba(120,20,20,0.35)';
        ctx.beginPath();
        ctx.ellipse(x * t + t / 2, y * t + t / 2, t * 0.3, t * 0.2, n * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return c;
}

export function lavaTexture() {
  const S = 128;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, '#ff6a00');
  g.addColorStop(0.5, '#ffb300');
  g.addColorStop(1, '#ff3d00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = 'rgba(40,0,0,0.75)';
  for (let i = 0; i < 40; i++) {
    const x = noise2(i, 1, 4) * S, y = noise2(i, 2, 4) * S;
    ctx.beginPath();
    ctx.ellipse(x, y, 6 + noise2(i, 3, 4) * 18, 4 + noise2(i, 4, 4) * 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

export function makeMaterials() {
  const wallTex = pixelTexture(stoneWallTexture(1), 4, 1);
  const wallTex2 = pixelTexture(stoneWallTexture(7, [70, 66, 80]), 4, 1);
  const floorTex = pixelTexture(floorTexture(2), 3, 8);
  const ceilTex = pixelTexture(stoneWallTexture(11, [58, 50, 48]), 3, 6);
  const lavaTex = pixelTexture(lavaTexture(), 1, 6);
  return {
    wall: new THREE.MeshLambertMaterial({ map: wallTex }),
    wall2: new THREE.MeshLambertMaterial({ map: wallTex2 }),
    floor: new THREE.MeshLambertMaterial({ map: floorTex }),
    ceiling: new THREE.MeshLambertMaterial({ map: ceilTex }),
    lava: new THREE.MeshBasicMaterial({ map: lavaTex, fog: true }),
    pillar: new THREE.MeshLambertMaterial({ map: pixelTexture(stoneWallTexture(5, [80, 74, 72]), 1, 4) }),
    barrel: new THREE.MeshLambertMaterial({ color: 0x6b4a2a }),
    barrelBand: new THREE.MeshLambertMaterial({ color: 0x9a3a2a, emissive: 0x2a0000 }),
    beam: new THREE.MeshLambertMaterial({ color: 0x4a3a2a }),
    gate: new THREE.MeshLambertMaterial({ color: 0x555a66, emissive: 0x0a0a10 }),
    blade: new THREE.MeshLambertMaterial({ color: 0xb8bcc8, emissive: 0x202020 }),
    sconce: new THREE.MeshBasicMaterial({ color: 0xffa040 }),
    flame: new THREE.MeshBasicMaterial({ color: 0xffe08a }),
    plasma: new THREE.MeshBasicMaterial({ color: 0x6ef3ff }),
    arrow: new THREE.MeshBasicMaterial({ color: 0xff7a2a }),
    gib: new THREE.MeshBasicMaterial({ color: 0xb8202a }),
    spark: new THREE.MeshBasicMaterial({ color: 0xffd27a }),
    warn: new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  };
}

// ── Sprites ──────────────────────────────────────────────────────────────────

function spriteTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

/** Chunky imp: brown body, horns, glowing eyes, claws. Two frames (walk). */
export function impSpriteCanvas(frame = 0) {
  const S = 64;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const px = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
  const body = '#7a3b1e', dark = '#4a2110', light = '#a3552a';
  // legs
  const legOff = frame ? 3 : 0;
  px(22 - legOff, 46, 8, 14, dark); px(34 + legOff, 46, 8, 14, dark);
  px(22 - legOff, 58, 10, 4, '#2a1208'); px(32 + legOff, 58, 10, 4, '#2a1208');
  // torso
  px(20, 24, 24, 24, body);
  px(24, 26, 16, 10, light);
  // arms + claws
  px(10, 26, 10, 8, body); px(44, 26, 10, 8, body);
  px(6, 30 + (frame ? 2 : 0), 6, 6, dark); px(52, 30 + (frame ? -2 : 0), 6, 6, dark);
  px(4, 32, 4, 2, '#e8e0d0'); px(56, 32, 4, 2, '#e8e0d0');
  // head
  px(22, 8, 20, 18, body);
  px(18, 2, 6, 10, '#d8d0c0'); px(40, 2, 6, 10, '#d8d0c0'); // horns
  px(25, 13, 5, 4, '#ff2020'); px(34, 13, 5, 4, '#ff2020'); // eyes
  px(26, 14, 2, 2, '#fff'); px(35, 14, 2, 2, '#fff');
  px(27, 21, 10, 3, '#200a08'); // mouth
  px(28, 21, 2, 2, '#fff'); px(34, 21, 2, 2, '#fff');
  return c;
}

/** Skeleton archer: pale bones, hood, bow. */
export function archerSpriteCanvas(frame = 0) {
  const S = 64;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const px = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
  const bone = '#d9d2c0', shade = '#9a9080', hood = '#2a1a30';
  px(24, 44, 6, 18, bone); px(34, 44, 6, 18, bone);
  px(22, 60, 8, 3, shade); px(34, 60, 8, 3, shade);
  px(22, 24, 20, 22, bone);
  for (let i = 0; i < 4; i++) px(24, 27 + i * 4, 16, 2, shade); // ribs
  px(18, 6, 28, 20, hood);
  px(24, 12, 16, 12, '#111'); // hood shadow
  px(26, 14, 4, 4, '#3ef0a0'); px(34, 14, 4, 4, '#3ef0a0'); // eyes
  // bow (right side)
  ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(50, 34, 14, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(50, 20); ctx.lineTo(frame ? 40 : 46, 34); ctx.lineTo(50, 48); ctx.stroke();
  px(12, 28, 10, 6, bone); // left arm
  px(38, 30, 12, 5, bone); // right arm to bow
  if (frame) px(36, 33, 12, 2, '#ff7a2a'); // nocked arrow
  return c;
}

export function pickupSpriteCanvas(kind) {
  const S = 32;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const px = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
  if (kind === 'health') {
    px(4, 4, 24, 24, '#e8e8e8'); px(6, 6, 20, 20, '#f8f8f8');
    px(13, 8, 6, 16, '#d0202a'); px(8, 13, 16, 6, '#d0202a');
  } else if (kind === 'ammo') {
    px(6, 8, 20, 18, '#4a4a3a'); px(8, 10, 16, 14, '#8a8a4a');
    px(10, 4, 3, 8, '#ffd27a'); px(15, 4, 3, 8, '#ffd27a'); px(20, 4, 3, 8, '#ffd27a');
  } else {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff0b0';
    ctx.beginPath(); ctx.arc(13, 13, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a5a10'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
    ctx.fillText('$', 16, 21);
  }
  return c;
}

export function makeSpriteMaterials() {
  const mk = (canvas) => new THREE.SpriteMaterial({ map: spriteTexture(canvas), transparent: true, fog: true, depthWrite: false });
  return {
    imp: [mk(impSpriteCanvas(0)), mk(impSpriteCanvas(1))],
    archer: [mk(archerSpriteCanvas(0)), mk(archerSpriteCanvas(1))],
    health: mk(pickupSpriteCanvas('health')),
    ammo: mk(pickupSpriteCanvas('ammo')),
    gold: mk(pickupSpriteCanvas('gold')),
  };
}
