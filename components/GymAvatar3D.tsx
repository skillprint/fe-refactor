'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MUSCLE_GROUP_META,
  type EquipmentType,
  type GymExercise,
  type MovementPattern,
  type MuscleFatigueStatus,
  type MuscleGroupId,
} from '@/lib/gym/exercises';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface GymAvatar3DProps {
  exercise?: GymExercise | null;
  activeWeightLbs?: number;
  activeRpe?: number | null;
  mode?: 'exercise' | 'recovery';
  fatigueMap?: Record<MuscleGroupId, MuscleFatigueStatus>;
  selectedMuscle?: MuscleGroupId | null;
  onSelectMuscle?: (muscle: MuscleGroupId) => void;
  compact?: boolean;
}

type JointName =
  | 'pelvis'
  | 'lumbar'
  | 'thorax'
  | 'neck'
  | 'head'
  | 'l_shoulder'
  | 'r_shoulder'
  | 'l_elbow'
  | 'r_elbow'
  | 'l_wrist'
  | 'r_wrist'
  | 'l_hip'
  | 'r_hip'
  | 'l_knee'
  | 'r_knee'
  | 'l_ankle'
  | 'r_ankle'
  | 'l_toe'
  | 'r_toe';

type SkeletonPose = Record<JointName, Vec3>;

interface MuscleCapsule3D {
  id: string;
  muscleGroup: MuscleGroupId | 'bone';
  from: Vec3;
  to: Vec3;
  radiusStart: number;
  radiusEnd: number;
  side?: 'front' | 'back' | 'both';
}

function v3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

function add3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function sub3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale3(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

function length3(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize3(v: Vec3): Vec3 {
  const len = length3(v) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Compute articulated 3D joint positions (in meters, y-up, floor at y = 0, facing +z)
 * for any exercise movement pattern and normalized rep phase `p` (0 = eccentric start, 1 = bottom/peak, 0 = return).
 */
function computeExercisePose(
  pattern: MovementPattern,
  phase01: number, // 0..1 smooth oscillation (0 = rest/top, 1 = peak displacement)
  rawTime: number
): {
  joints: SkeletonPose;
  propType: 'barbell' | 'dumbbell' | 'cable_high' | 'cable_low' | 'pullup_bar' | 'bench_flat' | 'bench_incline' | 'kettlebell' | 'leg_machine' | 'none';
  benchAngleDeg?: number;
} {
  const p = phase01; // 0 to 1 smooth

  // Base standing anatomical pose (height ~1.78m, floor y = 0)
  const base: SkeletonPose = {
    pelvis: v3(0, 0.94, 0),
    lumbar: v3(0, 1.12, -0.02),
    thorax: v3(0, 1.34, -0.02),
    neck: v3(0, 1.50, 0),
    head: v3(0, 1.65, 0.02),
    l_shoulder: v3(-0.22, 1.44, -0.01),
    r_shoulder: v3(0.22, 1.44, -0.01),
    l_elbow: v3(-0.26, 1.14, 0.02),
    r_elbow: v3(0.26, 1.14, 0.02),
    l_wrist: v3(-0.28, 0.86, 0.08),
    r_wrist: v3(0.28, 0.86, 0.08),
    l_hip: v3(-0.11, 0.92, 0),
    r_hip: v3(0.11, 0.92, 0),
    l_knee: v3(-0.12, 0.50, 0.03),
    r_knee: v3(0.12, 0.50, 0.03),
    l_ankle: v3(-0.12, 0.08, 0),
    r_ankle: v3(0.12, 0.08, 0),
    l_toe: v3(-0.13, 0.03, 0.14),
    r_toe: v3(0.13, 0.03, 0.14),
  };

  if (pattern === 'squat') {
    const drop = p * 0.42;
    const hipBack = p * 0.22;
    const kneeFwd = p * 0.20;
    const torsoLean = p * 0.18;
    const pelvisY = 0.94 - drop;
    const pelvisZ = -hipBack;
    const thoraxY = 1.34 - drop * 0.92;
    const thoraxZ = -0.02 + torsoLean - hipBack * 0.4;
    return {
      propType: 'barbell',
      joints: {
        ...base,
        pelvis: v3(0, pelvisY, pelvisZ),
        lumbar: v3(0, (pelvisY + thoraxY) * 0.5, (pelvisZ + thoraxZ) * 0.5),
        thorax: v3(0, thoraxY, thoraxZ),
        neck: v3(0, thoraxY + 0.16, thoraxZ + 0.03),
        head: v3(0, thoraxY + 0.30, thoraxZ + 0.06),
        l_shoulder: v3(-0.22, thoraxY + 0.10, thoraxZ),
        r_shoulder: v3(0.22, thoraxY + 0.10, thoraxZ),
        l_elbow: v3(-0.32, thoraxY - 0.12, thoraxZ - 0.08),
        r_elbow: v3(0.32, thoraxY - 0.12, thoraxZ - 0.08),
        l_wrist: v3(-0.38, thoraxY + 0.11, thoraxZ - 0.03),
        r_wrist: v3(0.38, thoraxY + 0.11, thoraxZ - 0.03),
        l_hip: v3(-0.12, pelvisY - 0.02, pelvisZ),
        r_hip: v3(0.12, pelvisY - 0.02, pelvisZ),
        l_knee: v3(-0.17, 0.50 - drop * 0.18, 0.03 + kneeFwd),
        r_knee: v3(0.17, 0.50 - drop * 0.18, 0.03 + kneeFwd),
      },
    };
  }

  if (pattern === 'hinge') {
    // Deadlift / RDL hip hinge: p=0 is lockout, p=1 is bottom hinge
    const hipBack = p * 0.26;
    const hipDrop = p * 0.16;
    const kneeBend = p * 0.10;
    const torsoDrop = p * 0.46;
    const torsoFwd = p * 0.36;
    const pelvis = v3(0, 0.94 - hipDrop, -hipBack);
    const thorax = v3(0, 1.34 - torsoDrop, -0.02 + torsoFwd - hipBack * 0.3);
    const shoulderY = thorax.y + 0.08;
    const shoulderZ = thorax.z + 0.04;
    const barY = lerp(0.84, 0.28, p);
    return {
      propType: 'barbell',
      joints: {
        ...base,
        pelvis,
        lumbar: lerp3(pelvis, thorax, 0.5),
        thorax,
        neck: v3(0, thorax.y + 0.13, thorax.z + 0.11),
        head: v3(0, thorax.y + 0.24, thorax.z + 0.18),
        l_shoulder: v3(-0.22, shoulderY, shoulderZ),
        r_shoulder: v3(0.22, shoulderY, shoulderZ),
        l_elbow: v3(-0.22, (shoulderY + barY) * 0.5, 0.08),
        r_elbow: v3(0.22, (shoulderY + barY) * 0.5, 0.08),
        l_wrist: v3(-0.22, barY, 0.09),
        r_wrist: v3(0.22, barY, 0.09),
        l_hip: v3(-0.11, pelvis.y - 0.02, pelvis.z),
        r_hip: v3(0.11, pelvis.y - 0.02, pelvis.z),
        l_knee: v3(-0.12, 0.48 - hipDrop * 0.2, 0.03 + kneeBend),
        r_knee: v3(0.12, 0.48 - hipDrop * 0.2, 0.03 + kneeBend),
      },
    };
  }

  if (pattern === 'bench_press' || pattern === 'fly') {
    // Lying supine on flat bench at y = 0.56, torso along z from -0.35 (head) to +0.25 (hips)
    const pressHeight = lerp(0.68, 1.02, 1 - p); // p=1 is bottom stretch, p=0 is lockout
    const elbowSpread = pattern === 'fly' ? lerp(0.32, 0.52, p) : 0.34;
    const wristSpread = pattern === 'fly' ? lerp(0.12, 0.56, p) : 0.34;
    const elbowY = pattern === 'fly' ? lerp(0.88, 0.52, p) : lerp(0.82, 0.46, p);
    return {
      propType: 'bench_flat',
      joints: {
        pelvis: v3(0, 0.56, 0.24),
        lumbar: v3(0, 0.59, 0.05),
        thorax: v3(0, 0.60, -0.16),
        neck: v3(0, 0.60, -0.32),
        head: v3(0, 0.62, -0.46),
        l_shoulder: v3(-0.22, 0.60, -0.18),
        r_shoulder: v3(0.22, 0.60, -0.18),
        l_elbow: v3(-elbowSpread, elbowY, -0.12),
        r_elbow: v3(elbowSpread, elbowY, -0.12),
        l_wrist: v3(-wristSpread, pressHeight, -0.14),
        r_wrist: v3(wristSpread, pressHeight, -0.14),
        l_hip: v3(-0.12, 0.55, 0.26),
        r_hip: v3(0.12, 0.55, 0.26),
        l_knee: v3(-0.18, 0.52, 0.62),
        r_knee: v3(0.18, 0.52, 0.62),
        l_ankle: v3(-0.20, 0.08, 0.58),
        r_ankle: v3(0.20, 0.08, 0.58),
        l_toe: v3(-0.22, 0.03, 0.72),
        r_toe: v3(0.22, 0.03, 0.72),
      },
    };
  }

  if (pattern === 'incline_press') {
    const pressY = lerp(0.92, 1.32, 1 - p);
    const elbowY = lerp(0.68, 1.06, 1 - p);
    return {
      propType: 'bench_incline',
      benchAngleDeg: 35,
      joints: {
        pelvis: v3(0, 0.52, 0.18),
        lumbar: v3(0, 0.66, 0.02),
        thorax: v3(0, 0.82, -0.14),
        neck: v3(0, 0.94, -0.24),
        head: v3(0, 1.06, -0.32),
        l_shoulder: v3(-0.22, 0.85, -0.14),
        r_shoulder: v3(0.22, 0.85, -0.14),
        l_elbow: v3(-0.34, elbowY, -0.06),
        r_elbow: v3(0.34, elbowY, -0.06),
        l_wrist: v3(-0.32, pressY, -0.10),
        r_wrist: v3(0.32, pressY, -0.10),
        l_hip: v3(-0.12, 0.50, 0.20),
        r_hip: v3(0.12, 0.50, 0.20),
        l_knee: v3(-0.18, 0.48, 0.56),
        r_knee: v3(0.18, 0.48, 0.56),
        l_ankle: v3(-0.20, 0.08, 0.54),
        r_ankle: v3(0.20, 0.08, 0.54),
        l_toe: v3(-0.22, 0.03, 0.68),
        r_toe: v3(0.22, 0.03, 0.68),
      },
    };
  }

  if (pattern === 'overhead_press') {
    // p=0 is racked at clavicles, p=1 is locked out overhead
    const barY = lerp(1.48, 1.98, p);
    const elbowY = lerp(1.18, 1.72, p);
    const elbowX = lerp(0.28, 0.25, p);
    const elbowZ = lerp(0.12, 0.0, p);
    return {
      propType: 'barbell',
      joints: {
        ...base,
        l_elbow: v3(-elbowX, elbowY, elbowZ),
        r_elbow: v3(elbowX, elbowY, elbowZ),
        l_wrist: v3(-0.30, barY, lerp(0.08, -0.01, p)),
        r_wrist: v3(0.30, barY, lerp(0.08, -0.01, p)),
      },
    };
  }

  if (pattern === 'vertical_pull') {
    // Pull-up / Lat pulldown: body rises towards bar at y = 2.02
    const lift = p * 0.36;
    const barY = 2.02;
    const shY = 1.44 + lift;
    const elbY = lerp(1.74, 1.36 + lift * 0.4, p);
    return {
      propType: 'pullup_bar',
      joints: {
        pelvis: v3(0, 0.94 + lift, 0),
        lumbar: v3(0, 1.12 + lift, -0.02),
        thorax: v3(0, 1.34 + lift, -0.04),
        neck: v3(0, 1.50 + lift, -0.02),
        head: v3(0, 1.65 + lift, 0.0),
        l_shoulder: v3(-0.22, shY, -0.02),
        r_shoulder: v3(0.22, shY, -0.02),
        l_elbow: v3(-0.36, elbY, 0.02),
        r_elbow: v3(0.36, elbY, 0.02),
        l_wrist: v3(-0.36, barY, 0),
        r_wrist: v3(0.36, barY, 0),
        l_hip: v3(-0.11, 0.92 + lift, 0),
        r_hip: v3(0.11, 0.92 + lift, 0),
        l_knee: v3(-0.12, 0.52 + lift, 0.05),
        r_knee: v3(0.12, 0.52 + lift, 0.05),
        l_ankle: v3(-0.12, 0.18 + lift, -0.12),
        r_ankle: v3(0.12, 0.18 + lift, -0.12),
        l_toe: v3(-0.12, 0.12 + lift, -0.04),
        r_toe: v3(0.12, 0.12 + lift, -0.04),
      },
    };
  }

  if (pattern === 'horizontal_row') {
    // Bent-over barbell row: hinged torso, pulling bar from knees to lower ribs
    const pelvis = v3(0, 0.88, -0.16);
    const thorax = v3(0, 1.14, 0.16);
    const wristY = lerp(0.62, 0.96, p);
    const wristZ = lerp(0.24, 0.08, p);
    const elbowY = lerp(0.86, 1.18, p);
    const elbowZ = lerp(0.18, -0.12, p);
    return {
      propType: 'barbell',
      joints: {
        ...base,
        pelvis,
        lumbar: lerp3(pelvis, thorax, 0.5),
        thorax,
        neck: v3(0, 1.24, 0.28),
        head: v3(0, 1.34, 0.38),
        l_shoulder: v3(-0.22, 1.16, 0.16),
        r_shoulder: v3(0.22, 1.16, 0.16),
        l_elbow: v3(-0.28, elbowY, elbowZ),
        r_elbow: v3(0.28, elbowY, elbowZ),
        l_wrist: v3(-0.26, wristY, wristZ),
        r_wrist: v3(0.26, wristY, wristZ),
        l_hip: v3(-0.11, 0.86, -0.16),
        r_hip: v3(0.11, 0.86, -0.16),
        l_knee: v3(-0.12, 0.48, 0.06),
        r_knee: v3(0.12, 0.48, 0.06),
      },
    };
  }

  if (pattern === 'bicep_curl') {
    // Standing curl: elbows pinned at sides, wrists arc up and forward
    const angle = lerp(0.15, 2.35, p); // radians from vertical down
    const forearmLen = 0.28;
    const elbL = v3(-0.25, 1.13, 0.03);
    const elbR = v3(0.25, 1.13, 0.03);
    const wy = elbL.y - Math.cos(angle) * forearmLen;
    const wz = elbL.z + Math.sin(angle) * forearmLen;
    return {
      propType: 'dumbbell',
      joints: {
        ...base,
        l_elbow: elbL,
        r_elbow: elbR,
        l_wrist: v3(-0.26, wy, wz),
        r_wrist: v3(0.26, wy, wz),
      },
    };
  }

  if (pattern === 'tricep_extension') {
    // Cable pushdown: elbows pinned, forearms extend from above 90° down to straight
    const angle = lerp(2.0, 0.18, p);
    const forearmLen = 0.28;
    const elbL = v3(-0.24, 1.14, 0.05);
    const elbR = v3(0.24, 1.14, 0.05);
    const wy = elbL.y - Math.cos(angle) * forearmLen;
    const wz = elbL.z + Math.sin(angle) * forearmLen;
    return {
      propType: 'cable_high',
      joints: {
        ...base,
        l_elbow: elbL,
        r_elbow: elbR,
        l_wrist: v3(-0.20, wy, wz),
        r_wrist: v3(0.20, wy, wz),
      },
    };
  }

  if (pattern === 'lateral_raise') {
    // Arms sweep out laterally in scapular plane
    const sweep = lerp(0.12, 1.48, p);
    const elbX = 0.22 + Math.sin(sweep) * 0.28;
    const elbY = 1.44 - Math.cos(sweep) * 0.28;
    const wristX = 0.22 + Math.sin(sweep) * 0.54;
    const wristY = 1.44 - Math.cos(sweep) * 0.54;
    return {
      propType: 'dumbbell',
      joints: {
        ...base,
        l_elbow: v3(-elbX, elbY, 0.05),
        r_elbow: v3(elbX, elbY, 0.05),
        l_wrist: v3(-wristX, wristY, 0.10),
        r_wrist: v3(wristX, wristY, 0.10),
      },
    };
  }

  if (pattern === 'lunge') {
    const drop = p * 0.34;
    const pelvisY = 0.94 - drop;
    return {
      propType: 'dumbbell',
      joints: {
        ...base,
        pelvis: v3(0, pelvisY, 0),
        lumbar: v3(0, pelvisY + 0.18, 0),
        thorax: v3(0, pelvisY + 0.40, 0),
        neck: v3(0, pelvisY + 0.56, 0.01),
        head: v3(0, pelvisY + 0.71, 0.03),
        l_shoulder: v3(-0.22, pelvisY + 0.50, 0),
        r_shoulder: v3(0.22, pelvisY + 0.50, 0),
        l_elbow: v3(-0.26, pelvisY + 0.20, 0.02),
        r_elbow: v3(0.26, pelvisY + 0.20, 0.02),
        l_wrist: v3(-0.27, pelvisY - 0.06, 0.04),
        r_wrist: v3(0.27, pelvisY - 0.06, 0.04),
        l_hip: v3(-0.11, pelvisY - 0.02, 0.04),
        r_hip: v3(0.11, pelvisY - 0.02, -0.04),
        l_knee: v3(-0.12, 0.50 - drop * 0.1, 0.36),
        r_knee: v3(0.12, 0.50 - drop * 0.95, -0.24),
        l_ankle: v3(-0.12, 0.08, 0.34),
        r_ankle: v3(0.12, 0.12, -0.52),
        l_toe: v3(-0.12, 0.03, 0.48),
        r_toe: v3(0.12, 0.03, -0.44),
      },
    };
  }

  if (pattern === 'dip') {
    const drop = p * 0.28;
    const py = 1.08 - drop;
    return {
      propType: 'none',
      joints: {
        ...base,
        pelvis: v3(0, py, -0.05),
        lumbar: v3(0, py + 0.18, 0.0),
        thorax: v3(0, py + 0.38, 0.06),
        neck: v3(0, py + 0.53, 0.10),
        head: v3(0, py + 0.67, 0.14),
        l_shoulder: v3(-0.22, py + 0.48, 0.06),
        r_shoulder: v3(0.22, py + 0.48, 0.06),
        l_elbow: v3(-0.28, 1.24 + (1 - p) * 0.06, -0.14 * p),
        r_elbow: v3(0.28, 1.24 + (1 - p) * 0.06, -0.14 * p),
        l_wrist: v3(-0.26, 1.02, 0.04),
        r_wrist: v3(0.26, 1.02, 0.04),
        l_hip: v3(-0.11, py - 0.02, -0.05),
        r_hip: v3(0.11, py - 0.02, -0.05),
        l_knee: v3(-0.12, py - 0.42, -0.02),
        r_knee: v3(0.12, py - 0.42, -0.02),
        l_ankle: v3(-0.12, py - 0.72, -0.22),
        r_ankle: v3(0.12, py - 0.72, -0.22),
        l_toe: v3(-0.12, py - 0.78, -0.14),
        r_toe: v3(0.12, py - 0.78, -0.14),
      },
    };
  }

  if (pattern === 'shrug') {
    const lift = p * 0.09;
    return {
      propType: 'dumbbell',
      joints: {
        ...base,
        l_shoulder: v3(-0.21, 1.44 + lift, -0.01),
        r_shoulder: v3(0.21, 1.44 + lift, -0.01),
        l_elbow: v3(-0.25, 1.14 + lift, 0.02),
        r_elbow: v3(0.25, 1.14 + lift, 0.02),
        l_wrist: v3(-0.26, 0.86 + lift, 0.05),
        r_wrist: v3(0.26, 0.86 + lift, 0.05),
      },
    };
  }

  if (pattern === 'calf_raise') {
    const rise = p * 0.11;
    return {
      propType: 'dumbbell',
      joints: {
        ...base,
        pelvis: add3(base.pelvis, v3(0, rise, 0)),
        lumbar: add3(base.lumbar, v3(0, rise, 0)),
        thorax: add3(base.thorax, v3(0, rise, 0)),
        neck: add3(base.neck, v3(0, rise, 0)),
        head: add3(base.head, v3(0, rise, 0)),
        l_shoulder: add3(base.l_shoulder, v3(0, rise, 0)),
        r_shoulder: add3(base.r_shoulder, v3(0, rise, 0)),
        l_elbow: add3(base.l_elbow, v3(0, rise, 0)),
        r_elbow: add3(base.r_elbow, v3(0, rise, 0)),
        l_wrist: add3(base.l_wrist, v3(0, rise, 0)),
        r_wrist: add3(base.r_wrist, v3(0, rise, 0)),
        l_hip: add3(base.l_hip, v3(0, rise, 0)),
        r_hip: add3(base.r_hip, v3(0, rise, 0)),
        l_knee: add3(base.l_knee, v3(0, rise, 0)),
        r_knee: add3(base.r_knee, v3(0, rise, 0)),
        l_ankle: v3(-0.12, 0.08 + rise, 0.04 * p),
        r_ankle: v3(0.12, 0.08 + rise, 0.04 * p),
      },
    };
  }

  if (pattern === 'hip_thrust') {
    const hipY = lerp(0.26, 0.58, p);
    return {
      propType: 'barbell',
      joints: {
        pelvis: v3(0, hipY, 0.14),
        lumbar: v3(0, lerp(0.38, 0.58, p), -0.04),
        thorax: v3(0, 0.58, -0.24),
        neck: v3(0, 0.64, -0.38),
        head: v3(0, 0.72, -0.48),
        l_shoulder: v3(-0.22, 0.58, -0.24),
        r_shoulder: v3(0.22, 0.58, -0.24),
        l_elbow: v3(-0.28, hipY + 0.08, 0.02),
        r_elbow: v3(0.28, hipY + 0.08, 0.02),
        l_wrist: v3(-0.24, hipY + 0.06, 0.14),
        r_wrist: v3(0.24, hipY + 0.06, 0.14),
        l_hip: v3(-0.12, hipY, 0.16),
        r_hip: v3(0.12, hipY, 0.16),
        l_knee: v3(-0.15, 0.54, 0.54),
        r_knee: v3(0.15, 0.54, 0.54),
        l_ankle: v3(-0.15, 0.08, 0.54),
        r_ankle: v3(0.15, 0.08, 0.54),
        l_toe: v3(-0.16, 0.03, 0.68),
        r_toe: v3(0.16, 0.03, 0.68),
      },
    };
  }

  if (pattern === 'leg_extension' || pattern === 'leg_curl') {
    // Seated on machine at y = 0.58
    const isExt = pattern === 'leg_extension';
    const ankleY = isExt ? lerp(0.14, 0.56, p) : lerp(0.54, 0.14, p);
    const ankleZ = isExt ? lerp(0.38, 0.78, p) : lerp(0.76, 0.30, p);
    return {
      propType: 'leg_machine',
      joints: {
        pelvis: v3(0, 0.58, -0.05),
        lumbar: v3(0, 0.76, -0.10),
        thorax: v3(0, 0.98, -0.14),
        neck: v3(0, 1.14, -0.12),
        head: v3(0, 1.29, -0.10),
        l_shoulder: v3(-0.22, 1.06, -0.14),
        r_shoulder: v3(0.22, 1.06, -0.14),
        l_elbow: v3(-0.26, 0.78, -0.06),
        r_elbow: v3(0.26, 0.78, -0.06),
        l_wrist: v3(-0.26, 0.58, 0.06),
        r_wrist: v3(0.26, 0.58, 0.06),
        l_hip: v3(-0.12, 0.58, -0.02),
        r_hip: v3(0.12, 0.58, -0.02),
        l_knee: v3(-0.13, 0.58, 0.38),
        r_knee: v3(0.13, 0.58, 0.38),
        l_ankle: v3(-0.13, ankleY, ankleZ),
        r_ankle: v3(0.13, ankleY, ankleZ),
        l_toe: v3(-0.13, ankleY - 0.04, ankleZ + 0.12),
        r_toe: v3(0.13, ankleY - 0.04, ankleZ + 0.12),
      },
    };
  }

  if (pattern === 'core_crunch') {
    // Hanging leg raise
    const legLift = p * 0.65;
    const legZ = p * 0.45;
    return {
      propType: 'pullup_bar',
      joints: {
        ...base,
        pelvis: v3(0, 0.94 + p * 0.06, p * 0.05),
        l_elbow: v3(-0.28, 1.74, 0),
        r_elbow: v3(0.28, 1.74, 0),
        l_wrist: v3(-0.28, 2.02, 0),
        r_wrist: v3(0.28, 2.02, 0),
        l_knee: v3(-0.12, 0.52 + legLift * 0.7, 0.04 + legZ * 0.7),
        r_knee: v3(0.12, 0.52 + legLift * 0.7, 0.04 + legZ * 0.7),
        l_ankle: v3(-0.12, 0.12 + legLift, legZ),
        r_ankle: v3(0.12, 0.12 + legLift, legZ),
        l_toe: v3(-0.12, 0.08 + legLift, legZ + 0.12),
        r_toe: v3(0.12, 0.08 + legLift, legZ + 0.12),
      },
    };
  }

  if (pattern === 'plank') {
    const breath = Math.sin(rawTime * 3) * 0.015;
    return {
      propType: 'none',
      joints: {
        pelvis: v3(0, 0.36 + breath, -0.04),
        lumbar: v3(0, 0.39 + breath, 0.14),
        thorax: v3(0, 0.42 + breath, 0.34),
        neck: v3(0, 0.44, 0.48),
        head: v3(0, 0.46, 0.62),
        l_shoulder: v3(-0.21, 0.42, 0.36),
        r_shoulder: v3(0.21, 0.42, 0.36),
        l_elbow: v3(-0.22, 0.08, 0.36),
        r_elbow: v3(0.22, 0.08, 0.36),
        l_wrist: v3(-0.18, 0.06, 0.58),
        r_wrist: v3(0.18, 0.06, 0.58),
        l_hip: v3(-0.11, 0.35 + breath, -0.06),
        r_hip: v3(0.11, 0.35 + breath, -0.06),
        l_knee: v3(-0.12, 0.22, -0.44),
        r_knee: v3(0.12, 0.22, -0.44),
        l_ankle: v3(-0.12, 0.10, -0.82),
        r_ankle: v3(0.12, 0.10, -0.82),
        l_toe: v3(-0.12, 0.02, -0.78),
        r_toe: v3(0.12, 0.02, -0.78),
      },
    };
  }

  if (pattern === 'kettlebell_swing') {
    const swing = p; // 0 = bottom hike, 1 = top float
    const hipZ = lerp(-0.22, 0.02, swing);
    const hipY = lerp(0.82, 0.94, swing);
    const thoraxY = lerp(1.06, 1.34, swing);
    const thoraxZ = lerp(0.22, -0.02, swing);
    const wristY = lerp(0.46, 1.38, swing);
    const wristZ = lerp(-0.12, 0.52, swing);
    return {
      propType: 'kettlebell',
      joints: {
        ...base,
        pelvis: v3(0, hipY, hipZ),
        lumbar: v3(0, (hipY + thoraxY) * 0.5, (hipZ + thoraxZ) * 0.5),
        thorax: v3(0, thoraxY, thoraxZ),
        neck: v3(0, thoraxY + 0.15, thoraxZ + 0.04),
        head: v3(0, thoraxY + 0.29, thoraxZ + 0.08),
        l_shoulder: v3(-0.22, thoraxY + 0.08, thoraxZ),
        r_shoulder: v3(0.22, thoraxY + 0.08, thoraxZ),
        l_elbow: v3(-0.16, (thoraxY + wristY) * 0.5, (thoraxZ + wristZ) * 0.5),
        r_elbow: v3(0.16, (thoraxY + wristY) * 0.5, (thoraxZ + wristZ) * 0.5),
        l_wrist: v3(-0.08, wristY, wristZ),
        r_wrist: v3(0.08, wristY, wristZ),
        l_hip: v3(-0.14, hipY - 0.02, hipZ),
        r_hip: v3(0.14, hipY - 0.02, hipZ),
        l_knee: v3(-0.18, 0.48, 0.06),
        r_knee: v3(0.18, 0.48, 0.06),
      },
    };
  }

  if (pattern === 'cardio_run') {
    const stride = Math.sin(rawTime * 5.2);
    const bounce = Math.abs(Math.cos(rawTime * 5.2)) * 0.05;
    return {
      propType: 'none',
      joints: {
        ...base,
        pelvis: v3(0, 0.94 + bounce, 0),
        lumbar: v3(0, 1.12 + bounce, 0.02),
        thorax: v3(0, 1.34 + bounce, 0.04),
        neck: v3(0, 1.50 + bounce, 0.06),
        head: v3(0, 1.65 + bounce, 0.08),
        l_shoulder: v3(-0.22, 1.44 + bounce, 0.04 - stride * 0.04),
        r_shoulder: v3(0.22, 1.44 + bounce, 0.04 + stride * 0.04),
        l_elbow: v3(-0.26, 1.16 + bounce, -stride * 0.16),
        r_elbow: v3(0.26, 1.16 + bounce, stride * 0.16),
        l_wrist: v3(-0.22, 1.24 + bounce, 0.16 - stride * 0.22),
        r_wrist: v3(0.22, 1.24 + bounce, 0.16 + stride * 0.22),
        l_knee: v3(-0.12, 0.52 + Math.max(0, stride) * 0.18, 0.04 + stride * 0.24),
        r_knee: v3(0.12, 0.52 + Math.max(0, -stride) * 0.18, 0.04 - stride * 0.24),
        l_ankle: v3(-0.12, 0.10 + Math.max(0, stride) * 0.16, stride * 0.28),
        r_ankle: v3(0.12, 0.10 + Math.max(0, -stride) * 0.16, -stride * 0.28),
        l_toe: v3(-0.12, 0.04 + Math.max(0, stride) * 0.14, 0.12 + stride * 0.28),
        r_toe: v3(0.12, 0.04 + Math.max(0, -stride) * 0.14, 0.12 - stride * 0.28),
      },
    };
  }

  if (pattern === 'cardio_row') {
    const drive = p; // 0 = catch, 1 = finish
    const seatZ = lerp(0.18, -0.26, drive);
    const thoraxZ = lerp(0.32, -0.36, drive);
    const wristZ = lerp(0.58, -0.18, drive);
    return {
      propType: 'cable_low',
      joints: {
        pelvis: v3(0, 0.34, seatZ),
        lumbar: v3(0, 0.52, (seatZ + thoraxZ) * 0.5),
        thorax: v3(0, 0.72, thoraxZ),
        neck: v3(0, 0.88, thoraxZ + 0.02),
        head: v3(0, 1.02, thoraxZ + 0.04),
        l_shoulder: v3(-0.22, 0.78, thoraxZ),
        r_shoulder: v3(0.22, 0.78, thoraxZ),
        l_elbow: v3(-0.28, 0.62, lerp(0.38, -0.44, drive)),
        r_elbow: v3(0.28, 0.62, lerp(0.38, -0.44, drive)),
        l_wrist: v3(-0.18, 0.64, wristZ),
        r_wrist: v3(0.18, 0.64, wristZ),
        l_hip: v3(-0.12, 0.34, seatZ),
        r_hip: v3(0.12, 0.34, seatZ),
        l_knee: v3(-0.13, lerp(0.58, 0.34, drive), lerp(0.28, 0.16, drive)),
        r_knee: v3(0.13, lerp(0.58, 0.34, drive), lerp(0.28, 0.16, drive)),
        l_ankle: v3(-0.13, 0.28, 0.54),
        r_ankle: v3(0.13, 0.28, 0.54),
        l_toe: v3(-0.13, 0.36, 0.62),
        r_toe: v3(0.13, 0.36, 0.62),
      },
    };
  }

  return { propType: 'none', joints: base };
}

/**
 * Build anatomical volumetric 3D muscle capsules from the articulated skeleton
 */
function buildAnatomicalCapsules(pose: SkeletonPose): MuscleCapsule3D[] {
  const j = pose;
  const torsoFwd = normalize3(v3(0, 0, 1));
  const torsoBack = v3(0, 0, -1);

  return [
    // Head & Neck
    { id: 'neck', muscleGroup: 'traps', from: j.thorax, to: j.neck, radiusStart: 0.065, radiusEnd: 0.055 },
    { id: 'head', muscleGroup: 'bone', from: j.neck, to: j.head, radiusStart: 0.09, radiusEnd: 0.105 },

    // Traps (Upper back / neck slope)
    { id: 'trap_l', muscleGroup: 'traps', from: add3(j.neck, v3(-0.04, -0.02, -0.02)), to: j.l_shoulder, radiusStart: 0.055, radiusEnd: 0.06 },
    { id: 'trap_r', muscleGroup: 'traps', from: add3(j.neck, v3(0.04, -0.02, -0.02)), to: j.r_shoulder, radiusStart: 0.055, radiusEnd: 0.06 },

    // Chest (Pectoralis Major L & R on anterior thorax)
    {
      id: 'pec_l',
      muscleGroup: 'chest',
      from: add3(j.thorax, v3(-0.03, 0.03, 0.075)),
      to: add3(j.l_shoulder, v3(0.05, -0.05, 0.065)),
      radiusStart: 0.088,
      radiusEnd: 0.075,
    },
    {
      id: 'pec_r',
      muscleGroup: 'chest',
      from: add3(j.thorax, v3(0.03, 0.03, 0.075)),
      to: add3(j.r_shoulder, v3(-0.05, -0.05, 0.065)),
      radiusStart: 0.088,
      radiusEnd: 0.075,
    },

    // Upper Back (Rhomboids / Mid Traps on posterior thorax)
    {
      id: 'uback_l',
      muscleGroup: 'upper_back',
      from: add3(j.thorax, v3(-0.06, 0.04, -0.07)),
      to: add3(j.lumbar, v3(-0.05, 0.08, -0.065)),
      radiusStart: 0.085,
      radiusEnd: 0.072,
    },
    {
      id: 'uback_r',
      muscleGroup: 'upper_back',
      from: add3(j.thorax, v3(0.06, 0.04, -0.07)),
      to: add3(j.lumbar, v3(0.05, 0.08, -0.065)),
      radiusStart: 0.085,
      radiusEnd: 0.072,
    },

    // Lats (Latissimus Dorsi V-taper)
    {
      id: 'lat_l',
      muscleGroup: 'lats',
      from: add3(j.l_shoulder, v3(0.05, -0.08, -0.04)),
      to: add3(j.lumbar, v3(-0.08, -0.02, -0.04)),
      radiusStart: 0.082,
      radiusEnd: 0.062,
    },
    {
      id: 'lat_r',
      muscleGroup: 'lats',
      from: add3(j.r_shoulder, v3(-0.05, -0.08, -0.04)),
      to: add3(j.lumbar, v3(0.08, -0.02, -0.04)),
      radiusStart: 0.082,
      radiusEnd: 0.062,
    },

    // Abdominals (Anterior core)
    {
      id: 'abs_upper',
      muscleGroup: 'abdominals',
      from: add3(j.thorax, scale3(torsoFwd, 0.055)),
      to: add3(j.lumbar, scale3(torsoFwd, 0.055)),
      radiusStart: 0.095,
      radiusEnd: 0.088,
    },
    {
      id: 'abs_lower',
      muscleGroup: 'abdominals',
      from: add3(j.lumbar, scale3(torsoFwd, 0.055)),
      to: add3(j.pelvis, scale3(torsoFwd, 0.045)),
      radiusStart: 0.088,
      radiusEnd: 0.082,
    },

    // Lower Back (Erector Spinae on posterior lumbar)
    {
      id: 'lback',
      muscleGroup: 'lower_back',
      from: add3(j.lumbar, scale3(torsoBack, 0.055)),
      to: add3(j.pelvis, scale3(torsoBack, 0.055)),
      radiusStart: 0.088,
      radiusEnd: 0.092,
    },

    // Shoulders (Deltoid caps L & R)
    {
      id: 'delt_l',
      muscleGroup: 'shoulders',
      from: j.l_shoulder,
      to: lerp3(j.l_shoulder, j.l_elbow, 0.34),
      radiusStart: 0.076,
      radiusEnd: 0.062,
    },
    {
      id: 'delt_r',
      muscleGroup: 'shoulders',
      from: j.r_shoulder,
      to: lerp3(j.r_shoulder, j.r_elbow, 0.34),
      radiusStart: 0.076,
      radiusEnd: 0.062,
    },

    // Biceps (Anterior upper arm)
    {
      id: 'bicep_l',
      muscleGroup: 'biceps',
      from: add3(lerp3(j.l_shoulder, j.l_elbow, 0.25), v3(0, 0, 0.024)),
      to: add3(j.l_elbow, v3(0, 0.02, 0.02)),
      radiusStart: 0.054,
      radiusEnd: 0.048,
    },
    {
      id: 'bicep_r',
      muscleGroup: 'biceps',
      from: add3(lerp3(j.r_shoulder, j.r_elbow, 0.25), v3(0, 0, 0.024)),
      to: add3(j.r_elbow, v3(0, 0.02, 0.02)),
      radiusStart: 0.054,
      radiusEnd: 0.048,
    },

    // Triceps (Posterior upper arm)
    {
      id: 'tricep_l',
      muscleGroup: 'triceps',
      from: add3(lerp3(j.l_shoulder, j.l_elbow, 0.22), v3(0, 0, -0.024)),
      to: add3(j.l_elbow, v3(0, 0.02, -0.022)),
      radiusStart: 0.056,
      radiusEnd: 0.048,
    },
    {
      id: 'tricep_r',
      muscleGroup: 'triceps',
      from: add3(lerp3(j.r_shoulder, j.r_elbow, 0.22), v3(0, 0, -0.024)),
      to: add3(j.r_elbow, v3(0, 0.02, -0.022)),
      radiusStart: 0.056,
      radiusEnd: 0.048,
    },

    // Forearms
    {
      id: 'forearm_l',
      muscleGroup: 'forearms',
      from: j.l_elbow,
      to: j.l_wrist,
      radiusStart: 0.048,
      radiusEnd: 0.034,
    },
    {
      id: 'forearm_r',
      muscleGroup: 'forearms',
      from: j.r_elbow,
      to: j.r_wrist,
      radiusStart: 0.048,
      radiusEnd: 0.034,
    },

    // Glutes (Posterior pelvis/hips)
    {
      id: 'glute_l',
      muscleGroup: 'glutes',
      from: add3(j.pelvis, v3(-0.07, 0.02, -0.06)),
      to: add3(j.l_hip, v3(-0.02, -0.05, -0.065)),
      radiusStart: 0.095,
      radiusEnd: 0.088,
    },
    {
      id: 'glute_r',
      muscleGroup: 'glutes',
      from: add3(j.pelvis, v3(0.07, 0.02, -0.06)),
      to: add3(j.r_hip, v3(0.02, -0.05, -0.065)),
      radiusStart: 0.095,
      radiusEnd: 0.088,
    },

    // Adductors (Inner thighs)
    {
      id: 'adductor_l',
      muscleGroup: 'adductors',
      from: add3(j.l_hip, v3(0.04, -0.04, 0)),
      to: add3(lerp3(j.l_hip, j.l_knee, 0.7), v3(0.03, 0, 0)),
      radiusStart: 0.068,
      radiusEnd: 0.052,
    },
    {
      id: 'adductor_r',
      muscleGroup: 'adductors',
      from: add3(j.r_hip, v3(-0.04, -0.04, 0)),
      to: add3(lerp3(j.r_hip, j.r_knee, 0.7), v3(-0.03, 0, 0)),
      radiusStart: 0.068,
      radiusEnd: 0.052,
    },

    // Quadriceps (Anterior thigh)
    {
      id: 'quad_l',
      muscleGroup: 'quadriceps',
      from: add3(j.l_hip, v3(-0.01, 0, 0.032)),
      to: add3(j.l_knee, v3(0, 0.03, 0.024)),
      radiusStart: 0.092,
      radiusEnd: 0.068,
    },
    {
      id: 'quad_r',
      muscleGroup: 'quadriceps',
      from: add3(j.r_hip, v3(0.01, 0, 0.032)),
      to: add3(j.r_knee, v3(0, 0.03, 0.024)),
      radiusStart: 0.092,
      radiusEnd: 0.068,
    },

    // Hamstrings (Posterior thigh)
    {
      id: 'ham_l',
      muscleGroup: 'hamstrings',
      from: add3(j.l_hip, v3(-0.01, -0.02, -0.034)),
      to: add3(j.l_knee, v3(0, 0.03, -0.026)),
      radiusStart: 0.086,
      radiusEnd: 0.064,
    },
    {
      id: 'ham_r',
      muscleGroup: 'hamstrings',
      from: add3(j.r_hip, v3(0.01, -0.02, -0.034)),
      to: add3(j.r_knee, v3(0, 0.03, -0.026)),
      radiusStart: 0.086,
      radiusEnd: 0.064,
    },

    // Calves (Lower legs)
    {
      id: 'calf_l',
      muscleGroup: 'calves',
      from: j.l_knee,
      to: j.l_ankle,
      radiusStart: 0.066,
      radiusEnd: 0.042,
    },
    {
      id: 'calf_r',
      muscleGroup: 'calves',
      from: j.r_knee,
      to: j.r_ankle,
      radiusStart: 0.066,
      radiusEnd: 0.042,
    },

    // Feet
    {
      id: 'foot_l',
      muscleGroup: 'bone',
      from: j.l_ankle,
      to: j.l_toe,
      radiusStart: 0.044,
      radiusEnd: 0.036,
    },
    {
      id: 'foot_r',
      muscleGroup: 'bone',
      from: j.r_ankle,
      to: j.r_toe,
      radiusStart: 0.044,
      radiusEnd: 0.036,
    },
  ];
}

export default function GymAvatar3D({
  exercise,
  activeWeightLbs = 135,
  activeRpe = 8,
  mode = 'exercise',
  fatigueMap,
  selectedMuscle,
  onSelectMuscle,
  compact = false,
}: GymAvatar3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraYaw, setCameraYaw] = useState<number>(0.52); // ~30 deg 3/4 view
  const [cameraPitch, setCameraPitch] = useState<number>(0.18);
  const [cameraZoom, setCameraZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [manualPhase, setManualPhase] = useState<number>(0.5);
  const [repPhaseLabel, setRepPhaseLabel] = useState<string>('Concentric Drive');
  const [repCount, setRepCount] = useState<number>(0);

  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const yawRef = useRef<number>(cameraYaw);
  const pitchRef = useRef<number>(cameraPitch);
  const zoomRef = useRef<number>(cameraZoom);

  useEffect(() => {
    yawRef.current = cameraYaw;
  }, [cameraYaw]);

  useEffect(() => {
    pitchRef.current = cameraPitch;
  }, [cameraPitch]);

  useEffect(() => {
    zoomRef.current = cameraZoom;
  }, [cameraZoom]);

  const setViewPreset = (preset: 'front' | 'side' | 'back' | 'iso') => {
    setAutoRotate(false);
    if (preset === 'front') {
      setCameraYaw(0);
      setCameraPitch(0.12);
    } else if (preset === 'side') {
      setCameraYaw(Math.PI / 2);
      setCameraPitch(0.12);
    } else if (preset === 'back') {
      setCameraYaw(Math.PI);
      setCameraPitch(0.15);
    } else {
      setCameraYaw(0.55);
      setCameraPitch(0.18);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId = 0;
    let startTime = performance.now();
    let prevCycleIndex = 0;

    const renderFrame = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(240, rect.width);
      const height = Math.max(240, rect.height);

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear background with deep studio gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72
      );
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (autoRotate && !isDraggingRef.current) {
        yawRef.current += 0.008;
      }

      const elapsed = ((now - startTime) / 1000) * speedMultiplier;
      const rpeFactor = Math.max(6, Math.min(10, activeRpe || 8));
      const cycleFreq = mode === 'recovery' ? 0.35 : 0.48; // reps per second
      const cyclePos = (elapsed * cycleFreq) % 1;
      const currentCycleIdx = Math.floor(elapsed * cycleFreq);

      if (isPlaying && mode === 'exercise' && currentCycleIdx !== prevCycleIndex) {
        prevCycleIndex = currentCycleIdx;
        setRepCount((c) => c + 1);
      }

      // Smooth biomechanical wave (0 -> 1 -> 0) with slight pause at peak contraction
      let phase01: number;
      if (mode === 'recovery') {
        phase01 = 0;
      } else if (!isPlaying) {
        phase01 = manualPhase;
      } else {
        const rawWave = 0.5 - 0.5 * Math.cos(cyclePos * Math.PI * 2);
        phase01 = Math.pow(rawWave, 0.88);
        if (cyclePos < 0.22) {
          setRepPhaseLabel('Eccentric / Setup');
        } else if (cyclePos < 0.45) {
          setRepPhaseLabel('Concentric Drive');
        } else if (cyclePos < 0.58) {
          setRepPhaseLabel('Peak Contraction');
        } else {
          setRepPhaseLabel('Controlled Return');
        }
      }

      const pattern: MovementPattern =
        mode === 'recovery' ? 'shrug' : exercise?.movementPattern || 'squat';
      const { joints, propType } = computeExercisePose(pattern, phase01, elapsed);

      // 3D Camera Transform (Target center around y = 0.92m)
      const camTarget = v3(0, 0.92, 0);
      const yaw = yawRef.current;
      const pitch = pitchRef.current;
      const camDist = 3.25 / zoomRef.current;
      const fov = Math.min(width, height) * 0.92;

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const project = (pt: Vec3): ProjectedPoint => {
        const dx = pt.x - camTarget.x;
        const dy = pt.y - camTarget.y;
        const dz = pt.z - camTarget.z;

        // Rotate around Y (yaw)
        const rx = dx * cosY - dz * sinY;
        const rz1 = dx * sinY + dz * cosY;

        // Rotate around X (pitch)
        const ry = dy * cosP - rz1 * sinP;
        const rz = dy * sinP + rz1 * cosP + camDist;

        const safeZ = Math.max(0.4, rz);
        const s = fov / safeZ;
        return {
          x: width * 0.5 + rx * s,
          y: height * 0.54 - ry * s,
          z: safeZ,
          scale: s,
        };
      };

      // 1. Draw 3D Perspective Gym Platform & Grid at y = 0
      ctx.lineWidth = 1;
      const gridSize = 1.2;
      const gridStep = 0.3;
      for (let g = -gridSize; g <= gridSize + 0.01; g += gridStep) {
        const p1 = project(v3(g, 0, -gridSize));
        const p2 = project(v3(g, 0, gridSize));
        ctx.strokeStyle = Math.abs(g) < 0.01 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(148, 163, 184, 0.12)';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(v3(-gridSize, 0, g));
        const p4 = project(v3(gridSize, 0, g));
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // Platform outer ring + RPE exertion pulse ring on the floor
      const ringSegments = 48;
      ctx.beginPath();
      for (let i = 0; i <= ringSegments; i++) {
        const a = (i / ringSegments) * Math.PI * 2;
        const r = 0.85 + (mode === 'exercise' ? phase01 * 0.06 : 0);
        const gp = project(v3(Math.cos(a) * r, 0.005, Math.sin(a) * r));
        if (i === 0) ctx.moveTo(gp.x, gp.y);
        else ctx.lineTo(gp.x, gp.y);
      }
      ctx.strokeStyle =
        rpeFactor >= 9
          ? `rgba(244, 63, 94, ${0.3 + phase01 * 0.35})`
          : `rgba(56, 189, 248, ${0.24 + phase01 * 0.25})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ground drop shadow under pelvis
      const shadowCenter = project(v3(joints.pelvis.x, 0.01, joints.pelvis.z));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(
        shadowCenter.x,
        shadowCenter.y,
        0.34 * shadowCenter.scale,
        0.14 * shadowCenter.scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 2. Draw Static 3D Gym Bench / Pull-up Frame / Machine Props behind/around avatar
      const draw3DLine = (a: Vec3, b: Vec3, radiusMeters: number, color: string, highlightColor?: string) => {
        const pa = project(a);
        const pb = project(b);
        const w = Math.max(2, ((pa.scale + pb.scale) * 0.5) * radiusMeters * 2);
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();

        if (highlightColor) {
          ctx.strokeStyle = highlightColor;
          ctx.lineWidth = Math.max(1, w * 0.35);
          ctx.beginPath();
          ctx.moveTo(pa.x - w * 0.12, pa.y - w * 0.12);
          ctx.lineTo(pb.x - w * 0.12, pb.y - w * 0.12);
          ctx.stroke();
        }
      };

      if (propType === 'bench_flat') {
        draw3DLine(v3(0, 0.48, -0.52), v3(0, 0.48, 0.38), 0.13, '#334155', '#475569');
        draw3DLine(v3(0, 0.01, -0.44), v3(0, 0.46, -0.44), 0.035, '#475569');
        draw3DLine(v3(0, 0.01, 0.32), v3(0, 0.46, 0.32), 0.035, '#475569');
      } else if (propType === 'bench_incline') {
        draw3DLine(v3(0, 0.46, 0.25), v3(0, 1.04, -0.38), 0.13, '#334155', '#475569');
        draw3DLine(v3(0, 0.01, 0.22), v3(0, 0.46, 0.22), 0.035, '#475569');
        draw3DLine(v3(0, 0.01, -0.28), v3(0, 0.94, -0.28), 0.035, '#475569');
      } else if (propType === 'pullup_bar') {
        draw3DLine(v3(-0.62, 0, -0.06), v3(-0.62, 2.08, -0.06), 0.03, '#334155', '#64748b');
        draw3DLine(v3(0.62, 0, -0.06), v3(0.62, 2.08, -0.06), 0.03, '#334155', '#64748b');
        draw3DLine(v3(-0.62, 2.02, 0), v3(0.62, 2.02, 0), 0.022, '#94a3b8', '#e2e8f0');
      } else if (propType === 'leg_machine') {
        draw3DLine(v3(0, 0.50, -0.15), v3(0, 0.50, 0.36), 0.14, '#334155', '#475569');
        draw3DLine(v3(0, 0.50, -0.16), v3(0, 1.12, -0.22), 0.13, '#334155', '#475569');
        draw3DLine(v3(0, 0.01, 0.12), v3(0, 0.48, 0.12), 0.04, '#475569');
      }

      // 3. Build & Depth-Sort 3D Anatomical Muscle Capsules
      const capsules = buildAnatomicalCapsules(joints);
      const primarySet = new Set<MuscleGroupId>(exercise?.primaryMuscles || []);
      const secondarySet = new Set<MuscleGroupId>(exercise?.secondaryMuscles || []);

      const sortedCapsules = capsules
        .map((c) => {
          const mid = lerp3(c.from, c.to, 0.5);
          const pMid = project(mid);
          return { capsule: c, depth: pMid.z };
        })
        .sort((a, b) => b.depth - a.depth); // Painter's algorithm: far to near

      for (const { capsule } of sortedCapsules) {
        const pa = project(capsule.from);
        const pb = project(capsule.to);

        let baseColor = '#475569';
        let highlightColor = '#94a3b8';
        let glowColor: string | null = null;
        let glowRadius = 0;

        if (capsule.muscleGroup === 'bone') {
          baseColor = '#64748b';
          highlightColor = '#cbd5e1';
        } else if (mode === 'recovery' && fatigueMap) {
          const status = fatigueMap[capsule.muscleGroup];
          const f = status?.fatiguePct ?? 0;
          const isSelected = selectedMuscle === capsule.muscleGroup;
          if (f >= 60) {
            baseColor = '#e11d48';
            highlightColor = '#fda4af';
            glowColor = 'rgba(244, 63, 94, 0.55)';
            glowRadius = isSelected ? 18 : 10;
          } else if (f >= 25) {
            baseColor = '#d97706';
            highlightColor = '#fde68a';
            glowColor = 'rgba(245, 158, 11, 0.45)';
            glowRadius = isSelected ? 16 : 8;
          } else {
            baseColor = '#059669';
            highlightColor = '#6ee7b7';
            if (isSelected) {
              glowColor = 'rgba(16, 185, 129, 0.55)';
              glowRadius = 14;
            }
          }
        } else {
          // Exercise activation mode
          const isPrimary = primarySet.has(capsule.muscleGroup);
          const isSecondary = secondarySet.has(capsule.muscleGroup);
          const isSelected = selectedMuscle === capsule.muscleGroup;
          const activationIntensity = 0.45 + 0.55 * phase01;

          if (isPrimary) {
            baseColor = '#e11d48';
            highlightColor = '#fecdd3';
            glowColor = `rgba(244, 63, 94, ${(0.35 + 0.5 * activationIntensity).toFixed(2)})`;
            glowRadius = 10 + 10 * activationIntensity;
          } else if (isSecondary) {
            baseColor = '#d97706';
            highlightColor = '#fde68a';
            glowColor = `rgba(245, 158, 11, ${(0.25 + 0.35 * activationIntensity).toFixed(2)})`;
            glowRadius = 6 + 6 * activationIntensity;
          } else {
            baseColor = '#334155';
            highlightColor = '#64748b';
          }

          if (isSelected) {
            glowColor = 'rgba(56, 189, 248, 0.8)';
            glowRadius = 16;
          }
        }

        // Draw volumetric 3D tapered capsule
        const rStartPx = Math.max(3, pa.scale * capsule.radiusStart * (capsule.id === 'head' ? 1.15 : 1));
        const rEndPx = Math.max(3, pb.scale * capsule.radiusEnd);

        ctx.save();
        if (glowColor && glowRadius > 0) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = glowRadius;
        }

        if (capsule.id === 'head') {
          const headCenter = lerp3(capsule.from, capsule.to, 0.58);
          const ph = project(headCenter);
          const rad = Math.max(8, ph.scale * 0.105);
          const headGrad = ctx.createRadialGradient(
            ph.x - rad * 0.3,
            ph.y - rad * 0.3,
            rad * 0.1,
            ph.x,
            ph.y,
            rad
          );
          headGrad.addColorStop(0, '#e2e8f0');
          headGrad.addColorStop(0.55, '#94a3b8');
          headGrad.addColorStop(1, '#334155');
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.arc(ph.x, ph.y, rad, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const avgWidth = (rStartPx + rEndPx);
          ctx.lineCap = 'round';
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = avgWidth;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();

          // Specular 3D muscle striation highlight
          ctx.shadowBlur = 0;
          ctx.strokeStyle = highlightColor;
          ctx.globalAlpha = 0.48;
          ctx.lineWidth = Math.max(1.5, avgWidth * 0.34);
          ctx.beginPath();
          ctx.moveTo(pa.x - avgWidth * 0.12, pa.y - avgWidth * 0.12);
          ctx.lineTo(pb.x - avgWidth * 0.12, pb.y - avgWidth * 0.12);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Draw 3D Articulated Joint Nodes
      const keyJoints: JointName[] = [
        'l_shoulder',
        'r_shoulder',
        'l_elbow',
        'r_elbow',
        'l_wrist',
        'r_wrist',
        'l_hip',
        'r_hip',
        'l_knee',
        'r_knee',
        'l_ankle',
        'r_ankle',
      ];
      for (const jName of keyJoints) {
        const pj = project(joints[jName]);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(pj.x, pj.y, Math.max(2.2, pj.scale * 0.022), 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw Dynamic 3D Equipment held by the Avatar (Barbell with scaled Weight Plates, Dumbbells, Kettlebell, Cable)
      if (mode === 'exercise') {
        const eq: EquipmentType = exercise?.equipment || 'barbell';
        const lw = joints.l_wrist;
        const rw = joints.r_wrist;

        if (eq === 'barbell' || propType === 'barbell' || propType === 'bench_flat' || propType === 'bench_incline') {
          const midWrist = lerp3(lw, rw, 0.5);
          const barDir = normalize3(sub3(rw, lw));
          const barLeft = add3(midWrist, scale3(barDir, -0.95));
          const barRight = add3(midWrist, scale3(barDir, 0.95));
          draw3DLine(barLeft, barRight, 0.016, '#cbd5e1', '#f8fafc');

          // Number of plates per side scaled by activeWeightLbs
          const plateCount = Math.max(
            1,
            Math.min(5, Math.floor(Math.max(0, (activeWeightLbs || 135) - 45) / 70) + 1)
          );
          for (let pIdx = 0; pIdx < plateCount; pIdx++) {
            const offset = 0.64 + pIdx * 0.045;
            const plateRadius = 0.17 - pIdx * 0.012;
            const plL1 = add3(midWrist, scale3(barDir, -offset));
            const plL2 = add3(midWrist, scale3(barDir, -(offset + 0.028)));
            const plR1 = add3(midWrist, scale3(barDir, offset));
            const plR2 = add3(midWrist, scale3(barDir, offset + 0.028));
            const plateColor = pIdx === 0 ? '#ef4444' : pIdx === 1 ? '#3b82f6' : '#eab308';
            draw3DLine(plL1, plL2, plateRadius, plateColor, '#f8fafc');
            draw3DLine(plR1, plR2, plateRadius, plateColor, '#f8fafc');
          }
        } else if (eq === 'dumbbell') {
          for (const wrist of [lw, rw]) {
            const dbA = add3(wrist, v3(-0.09, 0, 0));
            const dbB = add3(wrist, v3(0.09, 0, 0));
            draw3DLine(dbA, dbB, 0.015, '#cbd5e1');
            draw3DLine(add3(wrist, v3(-0.09, 0, 0)), add3(wrist, v3(-0.06, 0, 0)), 0.065, '#1e293b', '#64748b');
            draw3DLine(add3(wrist, v3(0.06, 0, 0)), add3(wrist, v3(0.09, 0, 0)), 0.065, '#1e293b', '#64748b');
          }
        } else if (eq === 'kettlebell' || propType === 'kettlebell') {
          const midW = lerp3(lw, rw, 0.5);
          const kbCenter = add3(midW, v3(0, -0.10, 0.03));
          const pkb = project(kbCenter);
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pkb.x, pkb.y, Math.max(8, pkb.scale * 0.095), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (eq === 'cable' || propType === 'cable_high' || propType === 'cable_low') {
          const midW = lerp3(lw, rw, 0.5);
          const anchor = propType === 'cable_low' ? v3(0, 0.45, 0.85) : v3(0, 2.05, 0.45);
          draw3DLine(anchor, midW, 0.008, '#38bdf8');
          draw3DLine(lw, rw, 0.015, '#e2e8f0');
        }
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(renderFrame);
    };

    animFrameId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animFrameId);
  }, [
    exercise,
    activeWeightLbs,
    activeRpe,
    mode,
    fatigueMap,
    selectedMuscle,
    autoRotate,
    isPlaying,
    speedMultiplier,
    manualPhase,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    const nextYaw = yawRef.current + dx * 0.012;
    const nextPitch = Math.max(-0.45, Math.min(0.85, pitchRef.current + dy * 0.01));
    yawRef.current = nextYaw;
    pitchRef.current = nextPitch;
    setCameraYaw(nextYaw);
    setCameraPitch(nextPitch);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const primaryMuscles = exercise?.primaryMuscles || [];
  const secondaryMuscles = exercise?.secondaryMuscles || [];

  return (
    <div
      className="sp-card"
      style={{
        padding: compact ? '0.85rem' : '1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar: Exercise / Mode Title + Live Telemetry */}
      <div className="layout-flex items-center justify-between gap-sm wrap">
        <div>
          <span
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#38bdf8',
              fontWeight: 700,
              display: 'block',
            }}
          >
            {mode === 'recovery' ? '3D Anatomical Recovery Heatmap' : '3D Biomechanical Avatar'}
          </span>
          <h3 style={{ margin: '0.15rem 0 0', fontSize: compact ? '1rem' : '1.15rem', fontWeight: 700 }}>
            {mode === 'recovery'
              ? 'Full-Body Muscle Fatigue & Exertion Status'
              : exercise?.name || 'Barbell Squat'}
          </h3>
        </div>
        {mode === 'exercise' && (
          <div className="cluster gap-xs">
            <span
              className="ui-badge ui-badge--sm"
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.35)',
              }}
            >
              RPE {activeRpe || 8}
            </span>
            {activeWeightLbs > 0 && (
              <span className="ui-badge ui-badge--sm">
                {activeWeightLbs} lbs
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3D Interactive Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: compact ? '280px' : '360px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ width: '100%', height: '100%', display: 'block' }}
          aria-label={
            mode === 'recovery'
              ? 'Interactive 3D muscle recovery avatar'
              : `Interactive 3D avatar demonstrating ${exercise?.name || 'exercise'}`
          }
        />

        {/* Overlay: Phase & Rep Counter */}
        {mode === 'exercise' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                background: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(6px)',
                color: '#e2e8f0',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 600,
                border: '1px solid rgba(148, 163, 184, 0.25)',
              }}
            >
              Phase: <strong style={{ color: '#38bdf8' }}>{repPhaseLabel}</strong>
            </span>
            <span
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#94a3b8',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.68rem',
              }}
            >
              Demo Reps: {repCount} · Drag to Orbit 360°
            </span>
          </div>
        )}

        {/* Overlay: Camera View Presets */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(
              [
                { id: 'iso', label: '3/4' },
                { id: 'front', label: 'Front' },
                { id: 'side', label: 'Side' },
                { id: 'back', label: 'Back' },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewPreset(v.id)}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {v.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAutoRotate((r) => !r)}
              style={{
                background: autoRotate ? 'rgba(56, 189, 248, 0.28)' : 'rgba(15, 23, 42, 0.85)',
                color: autoRotate ? '#38bdf8' : '#e2e8f0',
                border: `1px solid ${autoRotate ? '#38bdf8' : 'rgba(148, 163, 184, 0.28)'}`,
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Orbit
            </button>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {mode === 'exercise' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(148, 163, 184, 0.28)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSpeedMultiplier((s) => (s === 1 ? 1.5 : s === 1.5 ? 0.5 : 1))
                  }
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#38bdf8',
                    border: '1px solid rgba(148, 163, 184, 0.28)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {speedMultiplier}x
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setCameraZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#e2e8f0',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: '6px',
                padding: '3px 7px',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setCameraZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)))}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#e2e8f0',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: '6px',
                padding: '3px 7px',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
              aria-label="Zoom out"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* Manual Scrubber when Paused */}
      {mode === 'exercise' && !isPlaying && (
        <div className="layout-flex items-center gap-sm">
          <span className="font-xs text-muted">Scrub Rep Phase:</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={manualPhase}
            onChange={(e) => setManualPhase(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span className="font-xs weight-semibold">{Math.round(manualPhase * 100)}%</span>
        </div>
      )}

      {/* Muscle Activation / Fatigue Legend */}
      {mode === 'exercise' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div className="layout-flex items-center gap-xs wrap">
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#f43f5e',
                display: 'inline-block',
                boxShadow: '0 0 8px #f43f5e',
              }}
            />
            <span className="font-xs weight-semibold">Primary:</span>
            {primaryMuscles.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelectMuscle?.(m)}
                style={{
                  background: 'rgba(244, 63, 94, 0.16)',
                  color: '#fda4af',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {MUSCLE_GROUP_META[m]?.label || m}
              </button>
            ))}
          </div>
          {secondaryMuscles.length > 0 && (
            <div className="layout-flex items-center gap-xs wrap">
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  display: 'inline-block',
                }}
              />
              <span className="font-xs text-muted">Synergists:</span>
              {secondaryMuscles.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectMuscle?.(m)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.14)',
                    color: '#fcd34d',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  {MUSCLE_GROUP_META[m]?.label || m}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="layout-flex items-center justify-between gap-sm wrap font-xs">
          <span className="layout-flex items-center gap-xs">
            <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Fresh (80–100% Recovered)
          </span>
          <span className="layout-flex items-center gap-xs">
            <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            Recovering (40–79%)
          </span>
          <span className="layout-flex items-center gap-xs">
            <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            Fatigued (&lt;40% Recovered)
          </span>
        </div>
      )}
    </div>
  );
}
