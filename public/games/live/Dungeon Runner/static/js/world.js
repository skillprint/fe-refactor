/**
 * Endless corridor made of recycled segments. Segment types only change dressing;
 * hazards, enemies and pickups are placed by the Spawner (entities.js) when a segment
 * is recycled to the far end.
 */
/* global THREE */
import { SEG_LEN, SEG_COUNT, HALF_WIDTH, CEILING, pick, rand } from './constants.js';
import { PARAMS } from './params.js';

const SEG_TYPES = ['hall', 'pillars', 'bridge', 'crypt', 'gate', 'hall', 'pillars'];

export class World {
  constructor(scene, mats) {
    this.scene = scene;
    this.mats = mats;
    this.segments = [];
    this.geo = {
      floor: new THREE.PlaneGeometry(HALF_WIDTH * 2, SEG_LEN),
      wall: new THREE.PlaneGeometry(SEG_LEN, CEILING),
      lava: new THREE.PlaneGeometry(1.0, SEG_LEN),
      pillar: new THREE.BoxGeometry(0.7, CEILING, 0.7),
      coffin: new THREE.BoxGeometry(1.0, 0.7, 2.2),
      post: new THREE.BoxGeometry(0.6, CEILING, 0.6),
      lintel: new THREE.BoxGeometry(HALF_WIDTH * 2 + 0.4, 0.7, 0.6),
      sconce: new THREE.BoxGeometry(0.22, 0.5, 0.22),
      flame: new THREE.BoxGeometry(0.3, 0.42, 0.3),
    };
    this.time = 0;
  }

  build() {
    for (const s of this.segments) this.scene.remove(s.group);
    this.segments = [];
    let frontZ = 10;
    for (let i = 0; i < SEG_COUNT; i++) {
      const seg = this._createSegment();
      this._placeSegment(seg, frontZ, i < 2 ? 'hall' : pick(SEG_TYPES));
      this.segments.push(seg);
      this.scene.add(seg.group);
      frontZ -= SEG_LEN;
    }
  }

  _createSegment() {
    const g = this.mats;
    const group = new THREE.Group();

    const floor = new THREE.Mesh(this.geo.floor, g.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -SEG_LEN / 2);
    group.add(floor);

    const ceiling = new THREE.Mesh(this.geo.floor, g.ceiling);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, CEILING, -SEG_LEN / 2);
    group.add(ceiling);

    const wallL = new THREE.Mesh(this.geo.wall, g.wall);
    wallL.rotation.y = Math.PI / 2;
    wallL.position.set(-HALF_WIDTH, CEILING / 2, -SEG_LEN / 2);
    group.add(wallL);

    const wallR = new THREE.Mesh(this.geo.wall, g.wall);
    wallR.rotation.y = -Math.PI / 2;
    wallR.position.set(HALF_WIDTH, CEILING / 2, -SEG_LEN / 2);
    group.add(wallR);

    const lavaL = new THREE.Mesh(this.geo.lava, g.lava);
    lavaL.rotation.x = -Math.PI / 2;
    lavaL.position.set(-HALF_WIDTH + 0.5, -0.35, -SEG_LEN / 2);
    const lavaR = lavaL.clone();
    lavaR.position.x = HALF_WIDTH - 0.5;
    group.add(lavaL, lavaR);

    const side = Math.random() < 0.5 ? -1 : 1;
    const sconce = new THREE.Mesh(this.geo.sconce, g.sconce);
    const flame = new THREE.Mesh(this.geo.flame, g.flame);
    const light = new THREE.PointLight(0xff8c3a, 1.2, 20, 1);
    group.add(sconce, flame, light);

    const decor = new THREE.Group();
    group.add(decor);

    return { group, floor, ceiling, wallL, wallR, lavaL, lavaR, sconce, flame, light, side, decor, frontZ: 0, backZ: 0, type: 'hall', flicker: Math.random() * 10 };
  }

  _placeSegment(seg, frontZ, type) {
    seg.frontZ = frontZ;
    seg.backZ = frontZ - SEG_LEN;
    seg.type = type;
    seg.group.position.z = frontZ;
    this._dress(seg);
  }

  _dress(seg) {
    const g = this.mats;
    // clear decor
    while (seg.decor.children.length) seg.decor.remove(seg.decor.children[0]);

    const isBridge = seg.type === 'bridge';
    seg.floor.scale.x = isBridge ? 0.75 : 1;
    seg.lavaL.visible = seg.lavaR.visible = isBridge;
    seg.wallL.material = seg.wallR.material = seg.type === 'crypt' ? g.wall2 : g.wall;

    seg.side = Math.random() < 0.5 ? -1 : 1;
    const zMid = -SEG_LEN / 2 + rand(-4, 4);
    seg.sconce.position.set(seg.side * (HALF_WIDTH - 0.12), 2.5, zMid);
    seg.flame.position.set(seg.side * (HALF_WIDTH - 0.25), 2.95, zMid);
    seg.light.position.set(seg.side * (HALF_WIDTH - 0.9), 2.9, zMid);

    if (seg.type === 'pillars') {
      for (let z = -2.5; z > -SEG_LEN; z -= 5) {
        for (const s of [-1, 1]) {
          const p = new THREE.Mesh(this.geo.pillar, g.pillar);
          p.position.set(s * (HALF_WIDTH - 0.35), CEILING / 2, z);
          seg.decor.add(p);
        }
      }
    } else if (seg.type === 'crypt') {
      for (let z = -3; z > -SEG_LEN + 1; z -= 4.5) {
        for (const s of [-1, 1]) {
          if (Math.random() < 0.3) continue;
          const c = new THREE.Mesh(this.geo.coffin, g.beam);
          c.position.set(s * (HALF_WIDTH - 0.55), 0.35, z);
          seg.decor.add(c);
        }
      }
    } else if (seg.type === 'gate') {
      const z = -SEG_LEN / 2;
      for (const s of [-1, 1]) {
        const p = new THREE.Mesh(this.geo.post, g.pillar);
        p.position.set(s * (HALF_WIDTH - 0.3), CEILING / 2, z);
        seg.decor.add(p);
      }
      const l = new THREE.Mesh(this.geo.lintel, g.pillar);
      l.position.set(0, CEILING - 0.35, z);
      seg.decor.add(l);
    }
  }

  /** Recycle segments that fell behind the player; returns recycled segments (already dressed). */
  update(dt, playerZ) {
    this.time += dt;
    const recycled = [];
    let minBack = Infinity;
    for (const s of this.segments) minBack = Math.min(minBack, s.backZ);
    for (const s of this.segments) {
      if (s.backZ > playerZ + 8) {
        this._placeSegment(s, minBack, pick(SEG_TYPES));
        minBack = s.backZ;
        recycled.push(s);
      }
    }
    const L = PARAMS.lightLevel;
    for (const s of this.segments) {
      const f = 0.85 + 0.15 * Math.sin(this.time * 11 + s.flicker) * Math.sin(this.time * 7.3 + s.flicker * 2);
      s.light.intensity = 1.7 * L * f;
      s.light.distance = 14 + 10 * L;
      s.flame.scale.y = 0.8 + 0.4 * f;
    }
    return recycled;
  }
}
