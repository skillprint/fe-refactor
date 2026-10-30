export type MuscleGroupId =
  | 'chest'
  | 'upper_back'
  | 'lats'
  | 'lower_back'
  | 'traps'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abdominals'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'adductors'
  | 'cardio';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'plate'
  | 'cardio'
  | 'other';

export type ExerciseTrackingType =
  | 'weight_reps'
  | 'bodyweight_reps'
  | 'duration'
  | 'distance_duration';

export type MovementPattern =
  | 'bench_press'
  | 'incline_press'
  | 'overhead_press'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'vertical_pull'
  | 'horizontal_row'
  | 'bicep_curl'
  | 'tricep_extension'
  | 'lateral_raise'
  | 'fly'
  | 'dip'
  | 'shrug'
  | 'calf_raise'
  | 'core_crunch'
  | 'plank'
  | 'hip_thrust'
  | 'leg_extension'
  | 'leg_curl'
  | 'kettlebell_swing'
  | 'cardio_run'
  | 'cardio_row';

export type SetType = 'warmup' | 'normal' | 'failure' | 'dropset';

export type PRType = 'heaviest_weight' | 'best_1rm' | 'best_set_volume';

export interface GymExercise {
  id: string;
  name: string;
  equipment: EquipmentType;
  trackingType: ExerciseTrackingType;
  primaryMuscles: MuscleGroupId[];
  secondaryMuscles: MuscleGroupId[];
  movementPattern: MovementPattern;
  metValue: number;
  instructions: string[];
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  setType: SetType;
  weight: number; // in lbs (or kg when converted in UI)
  reps: number;
  durationSeconds?: number;
  distanceKm?: number;
  rpe: number | null; // 1 - 10 perceived exertion
  rir?: number | null; // Reps in reserve (10 - RPE)
  completed: boolean;
  completedAt?: string;
  isPR?: boolean;
  prTypes?: PRType[];
}

export interface WorkoutExerciseEntry {
  id: string;
  exerciseId: string;
  supersetId?: string | null; // e.g. 'A', 'B', 'C'
  notes: string;
  restTimerSeconds: number;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  title: string;
  routineId?: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  notes: string;
  sessionRpe: number; // 1-10 overall session RPE
  perceivedFatigue: number; // 1-10 post-workout fatigue
  preWorkoutReadiness?: number; // 1-10 pre-workout energy
  totalVolumeLbs: number;
  totalSets: number;
  exertionLoadAU: number; // Foster's sRPE * minutes + volume factor
  estimatedCalories: number;
  prCount: number;
  exercises: WorkoutExerciseEntry[];
}

export interface RoutineExerciseTemplate {
  id: string;
  exerciseId: string;
  supersetId?: string | null;
  notes: string;
  restTimerSeconds: number;
  sets: {
    id: string;
    setType: SetType;
    targetWeight: number;
    targetReps: number;
    targetRpe: number | null;
    durationSeconds?: number;
    distanceKm?: number;
  }[];
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  folder: string;
  description: string;
  targetDurationMinutes: number;
  lastPerformedAt?: string | null;
  exercises: RoutineExerciseTemplate[];
}

export interface BodyMeasurementLog {
  id: string;
  date: string;
  weightLbs: number;
  bodyFatPct?: number;
  chestIn?: number;
  waistIn?: number;
  armsIn?: number;
  thighsIn?: number;
  restingHr?: number;
}

export const MUSCLE_GROUP_META: Record<
  MuscleGroupId,
  { label: string; anatomicalName: string; recoveryHours: number; region: 'upper_push' | 'upper_pull' | 'legs' | 'core' | 'cardio' }
> = {
  chest: {
    label: 'Chest',
    anatomicalName: 'Pectoralis Major & Minor',
    recoveryHours: 48,
    region: 'upper_push',
  },
  upper_back: {
    label: 'Upper Back',
    anatomicalName: 'Rhomboids, Mid Traps & Rear Delts',
    recoveryHours: 48,
    region: 'upper_pull',
  },
  lats: {
    label: 'Lats',
    anatomicalName: 'Latissimus Dorsi & Teres Major',
    recoveryHours: 48,
    region: 'upper_pull',
  },
  lower_back: {
    label: 'Lower Back',
    anatomicalName: 'Erector Spinae & Multifidus',
    recoveryHours: 60,
    region: 'upper_pull',
  },
  traps: {
    label: 'Traps',
    anatomicalName: 'Upper Trapezius & Levator Scapulae',
    recoveryHours: 36,
    region: 'upper_pull',
  },
  shoulders: {
    label: 'Shoulders',
    anatomicalName: 'Anterior, Lateral & Posterior Deltoids',
    recoveryHours: 42,
    region: 'upper_push',
  },
  biceps: {
    label: 'Biceps',
    anatomicalName: 'Biceps Brachii & Brachialis',
    recoveryHours: 36,
    region: 'upper_pull',
  },
  triceps: {
    label: 'Triceps',
    anatomicalName: 'Triceps Brachii (Long, Lateral, Medial Heads)',
    recoveryHours: 36,
    region: 'upper_push',
  },
  forearms: {
    label: 'Forearms',
    anatomicalName: 'Brachioradialis & Wrist Flexors/Extensors',
    recoveryHours: 30,
    region: 'upper_pull',
  },
  abdominals: {
    label: 'Abdominals',
    anatomicalName: 'Rectus Abdominis, Obliques & Transverse Core',
    recoveryHours: 24,
    region: 'core',
  },
  quadriceps: {
    label: 'Quadriceps',
    anatomicalName: 'Rectus Femoris & Vastus Group',
    recoveryHours: 60,
    region: 'legs',
  },
  hamstrings: {
    label: 'Hamstrings',
    anatomicalName: 'Biceps Femoris, Semitendinosus & Semimembranosus',
    recoveryHours: 60,
    region: 'legs',
  },
  glutes: {
    label: 'Glutes',
    anatomicalName: 'Gluteus Maximus, Medius & Minimus',
    recoveryHours: 54,
    region: 'legs',
  },
  calves: {
    label: 'Calves',
    anatomicalName: 'Gastrocnemius & Soleus',
    recoveryHours: 36,
    region: 'legs',
  },
  adductors: {
    label: 'Adductors & Abductors',
    anatomicalName: 'Adductor Magnus/Longus & Tensor Fasciae Latae',
    recoveryHours: 48,
    region: 'legs',
  },
  cardio: {
    label: 'Cardiovascular',
    anatomicalName: 'Cardiorespiratory System',
    recoveryHours: 24,
    region: 'cardio',
  },
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  cable: 'Cable',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  band: 'Resistance Band',
  plate: 'Weight Plate',
  cardio: 'Cardio Machine',
  other: 'Other',
};

export const RPE_SCALE_INFO: Record<
  number,
  { rir: string; label: string; description: string; color: string }
> = {
  6: { rir: '4+ RIR', label: 'Light / Speed', description: 'Warm-up or speed work; 4+ reps left in tank', color: '#10b981' },
  7: { rir: '3 RIR', label: 'Moderate', description: 'Challenging weight; 3 clean reps left in reserve', color: '#22c55e' },
  7.5: { rir: '2–3 RIR', label: 'Moderately Hard', description: 'Bar speed slows slightly; 2 to 3 reps left', color: '#84cc16' },
  8: { rir: '2 RIR', label: 'Hard', description: 'Hypertrophy sweet spot; 2 reps left in reserve', color: '#eab308' },
  8.5: { rir: '1–2 RIR', label: 'Very Hard', description: 'Definitely 1 rep left, maybe 2 with max grit', color: '#f59e0b' },
  9: { rir: '1 RIR', label: 'Near Max', description: 'Heavy strain; 1 rep left in reserve', color: '#f97316' },
  9.5: { rir: '0.5 RIR', label: 'Peak Effort', description: 'No more reps possible, could add 2.5–5 lbs', color: '#ef4444' },
  10: { rir: '0 RIR', label: 'Max Effort / Failure', description: 'True muscular failure or absolute 1RM limit', color: '#e11d48' },
};

/**
 * Canonical Hevy Exercise Library (86 exercises across all body parts & equipment)
 */
export const HEVY_EXERCISE_LIBRARY: GymExercise[] = [
  // ===================== CHEST =====================
  {
    id: 'bench-press-barbell',
    name: 'Bench Press (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'bench_press',
    metValue: 6.0,
    instructions: [
      'Lie flat on the bench with your eyes directly under the barbell and feet planted firmly.',
      'Retract and depress your shoulder blades to create a stable upper-back shelf.',
      'Unrack the bar and lower it with control to your mid-to-lower sternum with elbows tucked ~45–60°.',
      'Drive the bar up and slightly back toward your shoulders until elbows lock out.',
    ],
  },
  {
    id: 'bench-press-dumbbell',
    name: 'Bench Press (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'bench_press',
    metValue: 5.8,
    instructions: [
      'Sit on a flat bench with dumbbells resting on your thighs, then kick them back as you lie down.',
      'Lower the dumbbells outside chest width until you feel a deep stretch across the pectorals.',
      'Press the dumbbells up in a slight arc over your chest without clanging them together.',
    ],
  },
  {
    id: 'incline-bench-press-barbell',
    name: 'Incline Bench Press (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    movementPattern: 'incline_press',
    metValue: 6.0,
    instructions: [
      'Set the bench to a 30–45° incline and grip the barbell slightly wider than shoulder width.',
      'Lower the bar under control to your upper chest just below the clavicles.',
      'Press the bar straight up while keeping your glutes and upper back glued to the pad.',
    ],
  },
  {
    id: 'incline-bench-press-dumbbell',
    name: 'Incline Bench Press (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    movementPattern: 'incline_press',
    metValue: 5.8,
    instructions: [
      'Set an adjustable bench to 30° to target the clavicular head of the pectorals.',
      'Lower the dumbbells until the handles align with your upper chest.',
      'Drive through your palms to press the weights back to full extension.',
    ],
  },
  {
    id: 'decline-bench-press-barbell',
    name: 'Decline Bench Press (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'bench_press',
    metValue: 5.8,
    instructions: [
      'Secure your legs at the end of the decline bench and lie back.',
      'Lower the barbell to your lower sternum, keeping wrists stacked over elbows.',
      'Press forcefully back to the starting position.',
    ],
  },
  {
    id: 'chest-press-machine',
    name: 'Chest Press (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'bench_press',
    metValue: 5.0,
    instructions: [
      'Adjust the seat height so the handles align with mid-chest.',
      'Press forward smoothly without letting your shoulders roll off the pad.',
      'Control the eccentric return for a 2-second count.',
    ],
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover / Fly',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    movementPattern: 'fly',
    metValue: 4.8,
    instructions: [
      'Set both pulleys to chest or high position and step forward into a staggered stance.',
      'With a slight bend in your elbows, sweep your hands together in a wide hug arc.',
      'Squeeze your inner chest at peak contraction for 1 second before returning slowly.',
    ],
  },
  {
    id: 'pec-deck-machine',
    name: 'Chest Fly / Pec Deck (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    movementPattern: 'fly',
    metValue: 4.5,
    instructions: [
      'Sit tall with your back flat against the pad and forearms or hands on the handles.',
      'Bring the handles together in a smooth arc while maintaining soft elbows.',
      'Return slowly until a comfortable stretch is felt across the chest.',
    ],
  },
  {
    id: 'dumbbell-fly',
    name: 'Chest Fly (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'biceps'],
    movementPattern: 'fly',
    metValue: 4.8,
    instructions: [
      'Lie on a flat bench holding dumbbells above your chest with palms facing each other.',
      'Lower your arms out to the sides in a wide arc while maintaining a fixed 15° elbow bend.',
      'Reverse the arc using your pecs to bring the dumbbells back over your chest.',
    ],
  },
  {
    id: 'chest-dip',
    name: 'Chest Dip (Weighted / Bodyweight)',
    equipment: 'bodyweight',
    trackingType: 'bodyweight_reps',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    movementPattern: 'dip',
    metValue: 6.5,
    instructions: [
      'Support yourself on parallel bars and lean your torso forward ~25° to emphasize the chest.',
      'Lower your body until your shoulders are slightly below elbow level.',
      'Press back up to the top without swinging your legs.',
    ],
  },
  {
    id: 'push-up',
    name: 'Push Up',
    equipment: 'bodyweight',
    trackingType: 'bodyweight_reps',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'abdominals'],
    movementPattern: 'bench_press',
    metValue: 5.5,
    instructions: [
      'Place hands slightly wider than shoulder-width and brace your core and glutes in a rigid plank.',
      'Lower your chest to within an inch of the floor with elbows angled ~45°.',
      'Push the floor away to return to full lockout.',
    ],
  },

  // ===================== BACK & LATS =====================
  {
    id: 'deadlift-barbell',
    name: 'Deadlift (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['lower_back', 'hamstrings', 'glutes'],
    secondaryMuscles: ['upper_back', 'traps', 'quadriceps', 'forearms'],
    movementPattern: 'hinge',
    metValue: 7.5,
    instructions: [
      'Stand with mid-foot under the barbell, hip-width stance, and grip the bar just outside your shins.',
      'Pull the slack out of the bar, brace your core 360°, and engage your lats ("protect your armpits").',
      'Push the floor away with your legs while keeping the bar dragging close up your shins and thighs.',
      'Lock out tall with hips extended and shoulders back — do not hyperextend your lumbar spine.',
    ],
  },
  {
    id: 'pull-up',
    name: 'Pull Up',
    equipment: 'bodyweight',
    trackingType: 'bodyweight_reps',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'forearms', 'abdominals'],
    movementPattern: 'vertical_pull',
    metValue: 6.8,
    instructions: [
      'Grip the overhead bar slightly wider than shoulder-width with an overhand (pronated) grip.',
      'Depress your scapulae and drive your elbows down toward your hips to pull your chin above the bar.',
      'Lower yourself all the way down to a controlled dead hang on each rep.',
    ],
  },
  {
    id: 'chin-up',
    name: 'Chin Up',
    equipment: 'bodyweight',
    trackingType: 'bodyweight_reps',
    primaryMuscles: ['lats', 'biceps'],
    secondaryMuscles: ['upper_back', 'forearms'],
    movementPattern: 'vertical_pull',
    metValue: 6.8,
    instructions: [
      'Take a shoulder-width underhand (supinated) grip on the pull-up bar.',
      'Pull your chest up to the bar by driving elbows down and squeezing both lats and biceps.',
      'Control the descent to full arm extension.',
    ],
  },
  {
    id: 'lat-pulldown-cable',
    name: 'Lat Pulldown (Cable)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['upper_back', 'biceps', 'forearms'],
    movementPattern: 'vertical_pull',
    metValue: 5.5,
    instructions: [
      'Secure your thighs under the pad and grip the wide bar outside shoulder width.',
      'Lean back ~10–15° and pull the bar down to your upper chest while driving elbows down and in.',
      'Let the bar rise smoothly until your lats are fully stretched at the top.',
    ],
  },
  {
    id: 'lat-pulldown-close-grip',
    name: 'Lat Pulldown - Close Neutral Grip (Cable)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'upper_back'],
    movementPattern: 'vertical_pull',
    metValue: 5.5,
    instructions: [
      'Attach a V-bar handle and sit tall with thighs anchored.',
      'Pull the handle to your sternum while keeping elbows tucked close to your ribs.',
      'Stretch upward under control at the top of each rep.',
    ],
  },
  {
    id: 'bent-over-row-barbell',
    name: 'Bent Over Row (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['upper_back', 'lats'],
    secondaryMuscles: ['lower_back', 'biceps', 'forearms', 'traps'],
    movementPattern: 'horizontal_row',
    metValue: 6.2,
    instructions: [
      'Hinge at the hips until your torso is 30–45° above parallel with a flat, braced spine.',
      'Row the barbell into your lower ribcage / upper abdomen by driving elbows behind your torso.',
      'Squeeze your shoulder blades together at the top and lower without torso momentum.',
    ],
  },
  {
    id: 'pendlay-row-barbell',
    name: 'Pendlay Row (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['upper_back', 'lats'],
    secondaryMuscles: ['lower_back', 'biceps'],
    movementPattern: 'horizontal_row',
    metValue: 6.4,
    instructions: [
      'Start with the barbell dead on the floor each rep and your back strictly parallel to the ground.',
      'Explosively row the bar to your lower chest, then return it completely to the floor.',
    ],
  },
  {
    id: 'dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'forearms'],
    movementPattern: 'horizontal_row',
    metValue: 5.6,
    instructions: [
      'Support your non-working hand on a bench with a flat back.',
      'Pull the dumbbell back in a sweeping arc toward your hip pocket rather than straight up to your shoulder.',
      'Lower fully to stretch the lat at the bottom.',
    ],
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['upper_back', 'lats'],
    secondaryMuscles: ['biceps', 'lower_back', 'forearms'],
    movementPattern: 'horizontal_row',
    metValue: 5.4,
    instructions: [
      'Sit with knees slightly bent and torso upright.',
      'Pull the handle into your midsection while retracting your shoulder blades.',
      'Allow a controlled protraction stretch at the front without rounding your lower back.',
    ],
  },
  {
    id: 'chest-supported-t-bar-row',
    name: 'T-Bar / Chest-Supported Row (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['upper_back', 'lats'],
    secondaryMuscles: ['biceps', 'traps'],
    movementPattern: 'horizontal_row',
    metValue: 5.5,
    instructions: [
      'Lie chest-down on the angled pad and grab the neutral or wide handles.',
      'Row the weight up until your elbows pass your torso, squeezing the rhomboids and mid-traps.',
    ],
  },
  {
    id: 'straight-arm-lat-pulldown',
    name: 'Straight-Arm Lat Pulldown (Cable)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['triceps', 'abdominals'],
    movementPattern: 'vertical_pull',
    metValue: 4.5,
    instructions: [
      'Stand facing a high pulley holding a rope or straight bar with arms nearly straight.',
      'Sweep the bar down in an arc to your thighs using pure shoulder extension from your lats.',
    ],
  },
  {
    id: 'barbell-shrug',
    name: 'Shrug (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['traps'],
    secondaryMuscles: ['forearms', 'upper_back'],
    movementPattern: 'shrug',
    metValue: 4.8,
    instructions: [
      'Hold a barbell in front of your thighs at shoulder width.',
      'Elevate your shoulders straight up toward your ears and hold for 1 full second at the top.',
      'Lower slowly under control.',
    ],
  },
  {
    id: 'dumbbell-shrug',
    name: 'Shrug (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['traps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'shrug',
    metValue: 4.6,
    instructions: [
      'Stand tall holding heavy dumbbells at your sides.',
      'Shrug your shoulders as high as possible without bending your elbows.',
    ],
  },
  {
    id: 'back-extension',
    name: 'Back Extension (Hyperextension)',
    equipment: 'bodyweight',
    trackingType: 'bodyweight_reps',
    primaryMuscles: ['lower_back', 'glutes', 'hamstrings'],
    secondaryMuscles: [],
    movementPattern: 'hinge',
    metValue: 4.5,
    instructions: [
      'Position your hips on the pad so your pelvis can hinge freely.',
      'Lower your torso down with a flat spine, then contract your glutes and erectors to return to a straight line.',
    ],
  },

  // ===================== SHOULDERS =====================
  {
    id: 'overhead-press-barbell',
    name: 'Overhead Press / OHP (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'upper_back', 'abdominals'],
    movementPattern: 'overhead_press',
    metValue: 6.0,
    instructions: [
      'Stand with feet hip-width apart, squeeze your glutes and quads, and rest the bar on your front delts.',
      'Press the bar vertically past your chin, then push your head "through the window" as it locks out overhead.',
      'Lower the bar under control back to your clavicles.',
    ],
  },
  {
    id: 'seated-shoulder-press-dumbbell',
    name: 'Seated Shoulder Press (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    movementPattern: 'overhead_press',
    metValue: 5.6,
    instructions: [
      'Sit on an upright bench with back support and hold dumbbells at ear level with elbows angled slightly forward (scapular plane).',
      'Press the dumbbells overhead to full extension and lower smoothly.',
    ],
  },
  {
    id: 'arnold-press-dumbbell',
    name: 'Arnold Press (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    movementPattern: 'overhead_press',
    metValue: 5.6,
    instructions: [
      'Begin with dumbbells in front of your shoulders, palms facing you.',
      'Rotate your palms outward as you press the weights overhead into lockout.',
      'Reverse the rotation on the way down.',
    ],
  },
  {
    id: 'shoulder-press-machine',
    name: 'Shoulder Press (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    movementPattern: 'overhead_press',
    metValue: 5.0,
    instructions: [
      'Adjust the seat so handles start at shoulder level.',
      'Press overhead smoothly without arching your lower back off the pad.',
    ],
  },
  {
    id: 'lateral-raise-dumbbell',
    name: 'Lateral Raise (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['traps'],
    movementPattern: 'lateral_raise',
    metValue: 4.5,
    instructions: [
      'Stand tall with a slight forward hip hinge and dumbbells at your sides.',
      'Raise your arms out in the scapular plane (~15–20° forward) until elbows reach shoulder height.',
      'Lower slowly to maintain constant tension on the lateral deltoids.',
    ],
  },
  {
    id: 'lateral-raise-cable',
    name: 'Lateral Raise (Cable)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['traps'],
    movementPattern: 'lateral_raise',
    metValue: 4.5,
    instructions: [
      'Set the cable pulley to wrist height and stand sideways to the stack.',
      'Sweep your arm across your body and up to shoulder height for uniform resistance through the full ROM.',
    ],
  },
  {
    id: 'front-raise-dumbbell',
    name: 'Front Raise (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['chest'],
    movementPattern: 'lateral_raise',
    metValue: 4.3,
    instructions: [
      'Hold dumbbells in front of your thighs and raise them forward to eye level with straight arms.',
      'Control the descent without swinging your hips.',
    ],
  },
  {
    id: 'face-pull-cable',
    name: 'Face Pull (Cable)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders', 'upper_back'],
    secondaryMuscles: ['traps', 'biceps'],
    movementPattern: 'horizontal_row',
    metValue: 4.5,
    instructions: [
      'Attach a rope to an upper-chest height pulley and grip with thumbs pointing back.',
      'Pull the center of the rope toward your forehead while externally rotating your shoulders into a double-biceps pose.',
    ],
  },
  {
    id: 'rear-delt-fly-dumbbell',
    name: 'Rear Delt Reverse Fly (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders', 'upper_back'],
    secondaryMuscles: ['traps'],
    movementPattern: 'fly',
    metValue: 4.5,
    instructions: [
      'Hinge forward until your torso is nearly parallel to the floor.',
      'Sweep the dumbbells out to the sides to target the posterior deltoids.',
    ],
  },
  {
    id: 'reverse-pec-deck',
    name: 'Rear Delt Reverse Fly (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['shoulders', 'upper_back'],
    secondaryMuscles: ['traps'],
    movementPattern: 'fly',
    metValue: 4.4,
    instructions: [
      'Sit facing the pec deck pad with handles set all the way forward.',
      'Sweep your arms back in a wide arc using your rear delts without shrugging your traps.',
    ],
  },

  // ===================== LEGS (QUADS, HAMSTRINGS, GLUTES, CALVES) =====================
  {
    id: 'squat-barbell',
    name: 'Squat (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'adductors', 'lower_back', 'abdominals'],
    movementPattern: 'squat',
    metValue: 7.5,
    instructions: [
      'Set the barbell across your upper traps (high-bar) or rear delts (low-bar) and unrack with a shoulder-width stance.',
      'Take a deep 360° diaphragmatic breath, brace your core, and sit down between your hips and knees.',
      'Descend until your hip crease passes below the top of your knee (parallel or deeper).',
      'Drive your whole foot into the floor and push your upper back into the bar to stand tall.',
    ],
  },
  {
    id: 'front-squat-barbell',
    name: 'Front Squat (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'upper_back', 'abdominals'],
    movementPattern: 'squat',
    metValue: 7.5,
    instructions: [
      'Rack the barbell across your front deltoids in a clean grip with elbows pointed high.',
      'Maintain an upright torso as you squat deep, keeping knees tracking over toes.',
      'Drive straight up while keeping your elbows elevated.',
    ],
  },
  {
    id: 'goblet-squat-dumbbell',
    name: 'Goblet Squat (Dumbbell / Kettlebell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['abdominals', 'adductors'],
    movementPattern: 'squat',
    metValue: 6.2,
    instructions: [
      'Hold a dumbbell or kettlebell vertically against your sternum.',
      'Squat down deeply with an upright torso, letting your elbows track inside your knees.',
      'Drive through mid-foot to stand back up.',
    ],
  },
  {
    id: 'leg-press-machine',
    name: 'Leg Press (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'adductors'],
    movementPattern: 'squat',
    metValue: 6.5,
    instructions: [
      'Sit in the sled with your lower back and hips pressed firmly into the seat pad.',
      'Lower the platform under control until knees reach at least 90° without your tailbone lifting off the seat.',
      'Press the platform back up without hard-locking your knees.',
    ],
  },
  {
    id: 'hack-squat-machine',
    name: 'Hack Squat (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat',
    metValue: 6.8,
    instructions: [
      'Place shoulders under the pads and back flat against the sled.',
      'Descend all the way to full knee flexion, then drive up powerfully through your quads.',
    ],
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'adductors'],
    movementPattern: 'lunge',
    metValue: 6.8,
    instructions: [
      'Rest the top of your rear foot on a bench behind you and hold dumbbells at your sides.',
      'Lower your back knee toward the floor while keeping most of your weight on the front leg.',
      'Drive through your front foot to return to standing.',
    ],
  },
  {
    id: 'walking-lunge-dumbbell',
    name: 'Walking Lunge (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    movementPattern: 'lunge',
    metValue: 6.5,
    instructions: [
      'Step forward into a long stride and lower until both knees are bent at ~90°.',
      'Drive through the front heel to step directly into the next lunge.',
    ],
  },
  {
    id: 'romanian-deadlift-barbell',
    name: 'Romanian Deadlift / RDL (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'forearms', 'upper_back'],
    movementPattern: 'hinge',
    metValue: 6.8,
    instructions: [
      'Start standing tall holding the barbell at hip level with a soft 15° knee bend.',
      'Push your hips straight back like closing a car door while keeping the bar grazing your thighs and shins.',
      'Stop as soon as your hips stop moving back (mid-shin) and drive hips forward to stand.',
    ],
  },
  {
    id: 'romanian-deadlift-dumbbell',
    name: 'Romanian Deadlift (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'forearms'],
    movementPattern: 'hinge',
    metValue: 6.2,
    instructions: [
      'Hold dumbbells in front of your thighs and hinge at the hips with a neutral spine.',
      'Feel a deep stretch in your hamstrings before driving your hips forward.',
    ],
  },
  {
    id: 'sumo-deadlift-barbell',
    name: 'Sumo Deadlift (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['glutes', 'quadriceps', 'hamstrings'],
    secondaryMuscles: ['adductors', 'lower_back', 'traps'],
    movementPattern: 'hinge',
    metValue: 7.4,
    instructions: [
      'Take a wide stance with toes turned out 35–45° and grip the bar inside your knees.',
      'Spread the floor with your feet, wedge your hips in close to the bar, and drive up.',
    ],
  },
  {
    id: 'hip-thrust-barbell',
    name: 'Hip Thrust (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'quadriceps', 'abdominals'],
    movementPattern: 'hip_thrust',
    metValue: 6.0,
    instructions: [
      'Rest your upper back across a bench right below your shoulder blades with a padded barbell over your hips.',
      'Drive through your heels to extend your hips until your torso is parallel to the floor and shins are vertical.',
      'Hold peak glute squeeze for 1 second with chin tucked.',
    ],
  },
  {
    id: 'leg-extension-machine',
    name: 'Leg Extension (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: [],
    movementPattern: 'leg_extension',
    metValue: 4.8,
    instructions: [
      'Align your knee joint with the machine pivot and hook your ankles behind the pad.',
      'Extend your legs fully and pause 1 second at the top to contract the rectus femoris and vastus medialis.',
    ],
  },
  {
    id: 'seated-leg-curl-machine',
    name: 'Seated Leg Curl (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    movementPattern: 'leg_curl',
    metValue: 4.8,
    instructions: [
      'Lock the thigh pad snug over your quads to maximize hip flexion stretch on the hamstrings.',
      'Curl the lower pad underneath the seat as far as possible and control the eccentric.',
    ],
  },
  {
    id: 'lying-leg-curl-machine',
    name: 'Lying Leg Curl (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves', 'glutes'],
    movementPattern: 'leg_curl',
    metValue: 4.8,
    instructions: [
      'Lie face down on the bench keeping your pelvis pressed into the pad.',
      'Curl your heels toward your glutes and lower slowly.',
    ],
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    metValue: 4.2,
    instructions: [
      'Stand with the balls of your feet on the platform and knees straight.',
      'Lower your heels into a full 2-second stretch at the bottom, then rise onto your tiptoes for a peak contraction.',
    ],
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    metValue: 4.0,
    instructions: [
      'Sit with knees bent at 90° under the pad to bias the soleus muscle.',
      'Perform full-range pauses at both the bottom stretch and top contraction.',
    ],
  },
  {
    id: 'hip-adduction-machine',
    name: 'Hip Adduction (Machine)',
    equipment: 'machine',
    trackingType: 'weight_reps',
    primaryMuscles: ['adductors'],
    secondaryMuscles: ['glutes'],
    movementPattern: 'squat',
    metValue: 4.0,
    instructions: [
      'Sit tall with pads on the insides of your knees.',
      'Squeeze your legs together smoothly and control the stretch on the return.',
    ],
  },

  // ===================== ARMS (BICEPS, TRICEPS, FOREARMS) =====================
  {
    id: 'bicep-curl-barbell',
    name: 'Bicep Curl (Barbell / EZ-Bar)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'bicep_curl',
    metValue: 4.5,
    instructions: [
      'Stand tall holding a barbell or EZ-bar with an underhand shoulder-width grip.',
      'Keep your elbows pinned by your ribs and curl the bar in an arc to shoulder height.',
      'Lower all the way down without swinging your lower back.',
    ],
  },
  {
    id: 'bicep-curl-dumbbell',
    name: 'Bicep Curl (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'bicep_curl',
    metValue: 4.4,
    instructions: [
      'Hold dumbbells at your sides and supinate (twist palms up) as you curl.',
      'Squeeze your biceps hard at the top and lower under control.',
    ],
  },
  {
    id: 'hammer-curl-dumbbell',
    name: 'Hammer Curl (Dumbbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['biceps', 'forearms'],
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    metValue: 4.4,
    instructions: [
      'Hold dumbbells with a neutral (palms facing each other) grip throughout the entire movement.',
      'Curl the weights up to target the brachialis and brachioradialis.',
    ],
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'bicep_curl',
    metValue: 4.4,
    instructions: [
      'Lie back on a 45–60° incline bench letting your arms hang behind your torso to stretch the long head of the biceps.',
      'Curl up while keeping your upper arms stationary.',
    ],
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl (EZ-Bar / Machine)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'bicep_curl',
    metValue: 4.3,
    instructions: [
      'Rest the backs of your upper arms flat against the preacher pad.',
      'Lower the weight until arms are nearly extended, then curl back up without lifting elbows off the pad.',
    ],
  },
  {
    id: 'cable-bicep-curl',
    name: 'Bicep Curl (Cable)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'bicep_curl',
    metValue: 4.3,
    instructions: [
      'Stand facing a low cable pulley with a straight or EZ attachment.',
      'Curl upward while maintaining constant cable tension at both ends of the rep.',
    ],
  },
  {
    id: 'tricep-pushdown-cable',
    name: 'Tricep Pushdown - Rope / Bar (Cable)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'tricep_extension',
    metValue: 4.4,
    instructions: [
      'Stand facing a high pulley with elbows tucked at your sides.',
      'Extend your forearms down until elbows lock out, spreading the rope ends apart at the bottom.',
      'Control the return until forearms are just above parallel.',
    ],
  },
  {
    id: 'overhead-tricep-extension-cable',
    name: 'Overhead Tricep Extension (Cable / Dumbbell)',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    metValue: 4.5,
    instructions: [
      'Raise your arms overhead to put the long head of the triceps in a deep stretch.',
      'Extend your elbows to press the weight overhead while keeping upper arms still.',
    ],
  },
  {
    id: 'skullcrusher-barbell',
    name: 'Skullcrusher / Lying Tricep Extension (EZ-Bar)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'tricep_extension',
    metValue: 4.8,
    instructions: [
      'Lie on a flat bench holding an EZ-bar with arms angled slightly back toward the wall behind you.',
      'Hinge at the elbows to lower the bar to your forehead or just behind your head, then extend back up.',
    ],
  },
  {
    id: 'close-grip-bench-press',
    name: 'Close-Grip Bench Press (Barbell)',
    equipment: 'barbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['triceps', 'chest'],
    secondaryMuscles: ['shoulders'],
    movementPattern: 'bench_press',
    metValue: 5.8,
    instructions: [
      'Grip the barbell at shoulder width and keep your elbows tucked close to your ribs as you lower the bar.',
      'Drive through your triceps to lock out the weight.',
    ],
  },
  {
    id: 'wrist-curl-dumbbell',
    name: 'Wrist Curl (Dumbbell / Barbell)',
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    metValue: 3.5,
    instructions: [
      'Rest your forearms on a bench or your thighs with wrists hanging over the edge.',
      'Let the weight roll down to your fingertips, then curl your wrists upward.',
    ],
  },

  // ===================== CORE & ABDOMINALS =====================
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    equipment: 'bodyweight',
    trackingType: 'bodyweight_reps',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: ['forearms'],
    movementPattern: 'core_crunch',
    metValue: 5.0,
    instructions: [
      'Hang from a pull-up bar with an active grip.',
      'Curl your pelvis upward as you raise your legs to at least 90° (or toes-to-bar) without swinging.',
    ],
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    equipment: 'cable',
    trackingType: 'weight_reps',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    movementPattern: 'core_crunch',
    metValue: 4.5,
    instructions: [
      'Kneel below a high pulley holding the rope behind your head.',
      'Flex your spine by curling your ribs down toward your pelvis — do not just sit back on your hips.',
    ],
  },
  {
    id: 'plank',
    name: 'Plank',
    equipment: 'bodyweight',
    trackingType: 'duration',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: ['shoulders', 'glutes', 'lower_back'],
    movementPattern: 'plank',
    metValue: 4.0,
    instructions: [
      'Support your body on your forearms and toes in a straight line from head to heels.',
      'Pull your elbows toward your toes isometrically while squeezing your glutes and quads.',
    ],
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    equipment: 'other',
    trackingType: 'bodyweight_reps',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: ['lats', 'shoulders'],
    movementPattern: 'plank',
    metValue: 5.2,
    instructions: [
      'Kneel holding the ab wheel with posterior pelvic tilt (tucked tailbone).',
      'Roll forward as far as you can without your lower back sagging, then pull back with your core.',
    ],
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist (Weighted)',
    equipment: 'plate',
    trackingType: 'weight_reps',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    movementPattern: 'core_crunch',
    metValue: 4.4,
    instructions: [
      'Sit with torso reclined 45° and rotate your ribcage side to side while holding a weight plate.',
    ],
  },

  // ===================== KETTLEBELL, ATHLETIC & CARDIO =====================
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    equipment: 'kettlebell',
    trackingType: 'weight_reps',
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['lower_back', 'shoulders', 'abdominals', 'cardio'],
    movementPattern: 'kettlebell_swing',
    metValue: 8.5,
    instructions: [
      'Hike the kettlebell back high between your thighs with a sharp hip hinge.',
      'Snap your hips into full extension to float the bell to chest height.',
    ],
  },
  {
    id: 'farmers-walk',
    name: "Farmer's Walk (Dumbbell / Trap Bar)",
    equipment: 'dumbbell',
    trackingType: 'weight_reps',
    primaryMuscles: ['forearms', 'traps'],
    secondaryMuscles: ['abdominals', 'glutes', 'calves'],
    movementPattern: 'shrug',
    metValue: 7.2,
    instructions: [
      'Pick up heavy dumbbells or farmer handles, stand tall with packed shoulders, and walk with brisk controlled steps.',
    ],
  },
  {
    id: 'treadmill-running',
    name: 'Running (Treadmill / Outdoor)',
    equipment: 'cardio',
    trackingType: 'distance_duration',
    primaryMuscles: ['cardio', 'quadriceps', 'calves'],
    secondaryMuscles: ['hamstrings', 'glutes'],
    movementPattern: 'cardio_run',
    metValue: 9.8,
    instructions: [
      'Maintain an upright posture with a ~170–180 spm cadence and mid-foot strike under your center of mass.',
    ],
  },
  {
    id: 'rowing-machine',
    name: 'Rowing (Concept2 Ergometer)',
    equipment: 'cardio',
    trackingType: 'distance_duration',
    primaryMuscles: ['cardio', 'upper_back', 'quadriceps'],
    secondaryMuscles: ['lats', 'hamstrings', 'biceps'],
    movementPattern: 'cardio_row',
    metValue: 8.5,
    instructions: [
      'Follow the sequence: Legs -> Hips -> Arms on the drive, and Arms -> Hips -> Legs on the recovery.',
    ],
  },
  {
    id: 'assault-air-bike',
    name: 'Assault Air Bike / Stationary Cycle',
    equipment: 'cardio',
    trackingType: 'distance_duration',
    primaryMuscles: ['cardio', 'quadriceps'],
    secondaryMuscles: ['hamstrings', 'shoulders', 'chest'],
    movementPattern: 'cardio_run',
    metValue: 9.2,
    instructions: [
      'Push and pull the handles in rhythm with your pedal strokes to drive high cardiovascular output.',
    ],
  },
];

/**
 * Epley 1RM formula (matches Hevy's 1RM estimation)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  const cappedReps = Math.min(reps, 30);
  return Math.round(weight * (1 + cappedReps / 30));
}

/**
 * Barbell Plate Calculator (per side of a standard 45 lb barbell)
 */
export function calculatePlateBreakdown(
  targetWeightLbs: number,
  barWeightLbs = 45
): { perSide: { plate: number; count: number }[]; remainder: number } {
  if (targetWeightLbs <= barWeightLbs) {
    return { perSide: [], remainder: 0 };
  }
  let remainingPerSide = (targetWeightLbs - barWeightLbs) / 2;
  const standardPlates = [45, 35, 25, 10, 5, 2.5];
  const perSide: { plate: number; count: number }[] = [];

  for (const plate of standardPlates) {
    const count = Math.floor((remainingPerSide + 0.001) / plate);
    if (count > 0) {
      perSide.push({ plate, count });
      remainingPerSide = Math.round((remainingPerSide - count * plate) * 100) / 100;
    }
  }

  return { perSide, remainder: remainingPerSide };
}

/**
 * Calculate Session Exertion Load (Foster's sRPE * Duration + Mechanical RPE Set Load)
 * and Estimated Calorie Expenditure
 */
export function calculateSessionExertionMetrics(params: {
  durationSeconds: number;
  sessionRpe: number;
  exercises: WorkoutExerciseEntry[];
  exerciseMap: Map<string, GymExercise>;
  bodyweightLbs?: number;
}): {
  totalVolumeLbs: number;
  completedSets: number;
  hardSets: number;
  avgSetRpe: number;
  exertionLoadAU: number;
  estimatedCalories: number;
  exertionZone: {
    label: string;
    tone: 'low' | 'moderate' | 'optimal' | 'high' | 'peak';
    color: string;
  };
} {
  let totalVolumeLbs = 0;
  let completedSets = 0;
  let hardSets = 0;
  let rpeSum = 0;
  let rpeCount = 0;
  let weightedMetSum = 0;

  for (const entry of params.exercises) {
    const ex = params.exerciseMap.get(entry.exerciseId);
    const met = ex?.metValue ?? 5.5;
    for (const set of entry.sets) {
      if (!set.completed) continue;
      completedSets += 1;
      weightedMetSum += met;
      if (set.setType !== 'warmup') {
        totalVolumeLbs += (Number(set.weight) || 0) * (Number(set.reps) || 0);
      }
      if (typeof set.rpe === 'number' && set.rpe > 0) {
        rpeSum += set.rpe;
        rpeCount += 1;
        if (set.rpe >= 8) hardSets += 1;
      }
    }
  }

  const avgSetRpe = rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : params.sessionRpe;
  const effectiveRpe = params.sessionRpe || avgSetRpe || 7;
  const durationMinutes = Math.max(5, Math.round(params.durationSeconds / 60));

  // Foster's sRPE Arbitrary Units (AU) = Duration (min) * Session RPE + mechanical hard-set bonus
  const exertionLoadAU = Math.round(durationMinutes * effectiveRpe * 10 + hardSets * 12);

  // Calorie calculation: MET * 3.5 * bodyWeightKg / 200 * durationMinutes
  const avgMet = completedSets > 0 ? weightedMetSum / completedSets : 5.5;
  const intensityFactor = 0.8 + (effectiveRpe / 10) * 0.45;
  const bwKg = (params.bodyweightLbs || 175) * 0.453592;
  const estimatedCalories = Math.round(
    ((avgMet * intensityFactor * 3.5 * bwKg) / 200) * durationMinutes
  );

  let exertionZone: {
    label: string;
    tone: 'low' | 'moderate' | 'optimal' | 'high' | 'peak';
    color: string;
  };
  if (exertionLoadAU < 1800) {
    exertionZone = { label: 'Recovery / Light Load', tone: 'low', color: '#10b981' };
  } else if (exertionLoadAU < 3200) {
    exertionZone = { label: 'Moderate Aerobic / Hypertrophy', tone: 'moderate', color: '#22c55e' };
  } else if (exertionLoadAU < 4800) {
    exertionZone = { label: 'Optimal Training Stimulus', tone: 'optimal', color: '#3b82f6' };
  } else if (exertionLoadAU < 6200) {
    exertionZone = { label: 'High Exertion / Heavy Strain', tone: 'high', color: '#f59e0b' };
  } else {
    exertionZone = { label: 'Peak Overreaching / Max Strain', tone: 'peak', color: '#ef4444' };
  }

  return {
    totalVolumeLbs: Math.round(totalVolumeLbs),
    completedSets,
    hardSets,
    avgSetRpe,
    exertionLoadAU,
    estimatedCalories,
    exertionZone,
  };
}

/**
 * Compute per-muscle fatigue percentage (0-100%) and recovery status based on recent workouts
 */
export interface MuscleFatigueStatus {
  muscle: MuscleGroupId;
  fatiguePct: number; // 0 = Fresh, 100 = Fully Fatigued
  recoveryPct: number; // 100 = 100% Recovered
  weeklySets: number;
  weeklyVolumeLbs: number;
  hoursUntilFresh: number;
  status: 'fresh' | 'recovering' | 'fatigued';
}

export function calculateMuscleRecoveryMap(
  workouts: WorkoutSession[],
  exerciseMap: Map<string, GymExercise>,
  nowMs: number = Date.now()
): Record<MuscleGroupId, MuscleFatigueStatus> {
  const result = {} as Record<MuscleGroupId, MuscleFatigueStatus>;
  const allMuscles = Object.keys(MUSCLE_GROUP_META) as MuscleGroupId[];

  for (const m of allMuscles) {
    result[m] = {
      muscle: m,
      fatiguePct: 0,
      recoveryPct: 100,
      weeklySets: 0,
      weeklyVolumeLbs: 0,
      hoursUntilFresh: 0,
      status: 'fresh',
    };
  }

  const sevenDaysMs = 7 * 24 * 3600 * 1000;

  for (const workout of workouts) {
    const endedMs = new Date(workout.endedAt || workout.startedAt).getTime();
    const ageHours = Math.max(0, (nowMs - endedMs) / (1000 * 3600));
    const isWithinWeek = nowMs - endedMs <= sevenDaysMs;

    for (const entry of workout.exercises) {
      const ex = exerciseMap.get(entry.exerciseId);
      if (!ex) continue;

      const workingSets = entry.sets.filter((s) => s.completed && s.setType !== 'warmup');
      if (workingSets.length === 0) continue;

      const entryVolume = workingSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
      const avgSetRpe =
        workingSets.reduce((sum, s) => sum + (s.rpe || workout.sessionRpe || 7.5), 0) /
        workingSets.length;
      const intensityMultiplier = Math.max(0.5, (avgSetRpe - 4) / 5); // RPE 9 -> 1.0, RPE 10 -> 1.2

      // Primary muscles take 100% stimulus, secondary take 45%
      for (const pm of ex.primaryMuscles) {
        if (isWithinWeek) {
          result[pm].weeklySets += workingSets.length;
          result[pm].weeklyVolumeLbs += entryVolume;
        }
        const recWindow = MUSCLE_GROUP_META[pm].recoveryHours;
        if (ageHours < recWindow * 1.4) {
          const decay = Math.max(0, 1 - ageHours / (recWindow * 1.15));
          const addedFatigue = workingSets.length * 14 * intensityMultiplier * decay;
          result[pm].fatiguePct = Math.min(100, Math.round(result[pm].fatiguePct + addedFatigue));
        }
      }

      for (const sm of ex.secondaryMuscles) {
        if (isWithinWeek) {
          result[sm].weeklySets += Math.round(workingSets.length * 0.5 * 10) / 10;
          result[sm].weeklyVolumeLbs += Math.round(entryVolume * 0.45);
        }
        const recWindow = MUSCLE_GROUP_META[sm].recoveryHours;
        if (ageHours < recWindow * 1.2) {
          const decay = Math.max(0, 1 - ageHours / recWindow);
          const addedFatigue = workingSets.length * 6.5 * intensityMultiplier * decay;
          result[sm].fatiguePct = Math.min(100, Math.round(result[sm].fatiguePct + addedFatigue));
        }
      }
    }
  }

  for (const m of allMuscles) {
    const f = result[m].fatiguePct;
    result[m].recoveryPct = Math.max(0, 100 - f);
    const baseHours = MUSCLE_GROUP_META[m].recoveryHours;
    result[m].hoursUntilFresh = f > 15 ? Math.round(((f - 10) / 90) * baseHours) : 0;
    result[m].status = f >= 60 ? 'fatigued' : f >= 25 ? 'recovering' : 'fresh';
  }

  return result;
}
