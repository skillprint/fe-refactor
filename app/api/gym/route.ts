import { NextRequest, NextResponse } from 'next/server';
import {
  HEVY_EXERCISE_LIBRARY,
  type BodyMeasurementLog,
  type GymExercise,
  type WorkoutRoutine,
  type WorkoutSession,
} from '@/lib/gym/exercises';
import {
  DEFAULT_GYM_ROUTINES,
  createSeedMeasurements,
  createSeedWorkouts,
} from '@/lib/gym/presets';

interface ServerGymStore {
  workouts: WorkoutSession[];
  routines: WorkoutRoutine[];
  customExercises: GymExercise[];
  measurements: BodyMeasurementLog[];
}

const globalForGym = globalThis as unknown as {
  __skillprintGymStore?: ServerGymStore;
};

function getGymStore(): ServerGymStore {
  if (!globalForGym.__skillprintGymStore) {
    globalForGym.__skillprintGymStore = {
      workouts: createSeedWorkouts(),
      routines: [...DEFAULT_GYM_ROUTINES],
      customExercises: [],
      measurements: createSeedMeasurements(),
    };
  }
  return globalForGym.__skillprintGymStore;
}

export async function GET() {
  try {
    const store = getGymStore();
    return NextResponse.json({
      workouts: store.workouts,
      routines: store.routines,
      customExercises: store.customExercises,
      exercises: [...HEVY_EXERCISE_LIBRARY, ...store.customExercises],
      measurements: store.measurements,
    });
  } catch (error: any) {
    console.error('[api/gym] GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load gym tracker data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const store = getGymStore();
    const body = await request.json();
    const action = body?.action;

    if (action === 'save_workout') {
      const workout = body?.workout as WorkoutSession | undefined;
      if (!workout || !workout.id) {
        return NextResponse.json({ error: 'Valid workout payload required' }, { status: 400 });
      }
      store.workouts = [workout, ...store.workouts.filter((w) => w.id !== workout.id)];
      if (workout.routineId) {
        store.routines = store.routines.map((r) =>
          r.id === workout.routineId ? { ...r, lastPerformedAt: workout.endedAt } : r
        );
      }
      return NextResponse.json({ ok: true, workout, workouts: store.workouts });
    }

    if (action === 'save_routine') {
      const routine = body?.routine as WorkoutRoutine | undefined;
      if (!routine || !routine.id || !routine.name) {
        return NextResponse.json({ error: 'Valid routine payload required' }, { status: 400 });
      }
      const exists = store.routines.some((r) => r.id === routine.id);
      if (exists) {
        store.routines = store.routines.map((r) => (r.id === routine.id ? routine : r));
      } else {
        store.routines = [routine, ...store.routines];
      }
      return NextResponse.json({ ok: true, routine, routines: store.routines });
    }

    if (action === 'save_custom_exercise') {
      const exercise = body?.exercise as GymExercise | undefined;
      if (!exercise || !exercise.id || !exercise.name) {
        return NextResponse.json({ error: 'Valid exercise payload required' }, { status: 400 });
      }
      const tagged: GymExercise = { ...exercise, isCustom: true };
      store.customExercises = [
        tagged,
        ...store.customExercises.filter((e) => e.id !== tagged.id),
      ];
      return NextResponse.json({
        ok: true,
        exercise: tagged,
        customExercises: store.customExercises,
      });
    }

    if (action === 'save_measurement') {
      const measurement = body?.measurement as BodyMeasurementLog | undefined;
      if (!measurement || !measurement.id) {
        return NextResponse.json({ error: 'Valid measurement payload required' }, { status: 400 });
      }
      store.measurements = [
        ...store.measurements.filter((m) => m.id !== measurement.id),
        measurement,
      ].sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json({ ok: true, measurement, measurements: store.measurements });
    }

    return NextResponse.json({ error: `Unsupported action: ${String(action)}` }, { status: 400 });
  } catch (error: any) {
    console.error('[api/gym] POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save gym tracker record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const store = getGymStore();
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');
    const id = searchParams.get('id');

    if (!kind || !id) {
      return NextResponse.json({ error: 'Both kind and id are required' }, { status: 400 });
    }

    if (kind === 'workout') {
      store.workouts = store.workouts.filter((w) => w.id !== id);
      return NextResponse.json({ ok: true, workouts: store.workouts });
    }

    if (kind === 'routine') {
      store.routines = store.routines.filter((r) => r.id !== id);
      return NextResponse.json({ ok: true, routines: store.routines });
    }

    return NextResponse.json({ error: `Unsupported kind: ${kind}` }, { status: 400 });
  } catch (error: any) {
    console.error('[api/gym] DELETE error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete gym tracker record' },
      { status: 500 }
    );
  }
}
