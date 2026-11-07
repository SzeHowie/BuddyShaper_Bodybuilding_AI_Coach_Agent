import type { Exercise } from '../types'

export const exercises: Exercise[] = [
  {
    id: 'squat',
    name: 'Barbell back squat',
    aliases: ['squat', 'back squat'],
    pattern: 'Squat',
    setup: [
      'Bar on upper traps, not the neck.',
      'Feet about shoulder-width, toes slightly out.',
      'Brace like someone will punch your gut.',
    ],
    reps: {
      cut: '4×6–8, leave 2 reps in the tank',
      bulk: '5×5 adding load weekly',
      recomp: '4×6–8, pause 1s in the hole every other week',
      maintain: '3×6–8',
    },
    cues: [
      'Sit between your hips, not forward onto the knees.',
      'Keep the chest tall; the bar path should stay over mid-foot.',
      'Drive the floor away. Exhale as you stand.',
    ],
    mistakes: [
      'Knees collapsing in — shove them toward the little toe.',
      'Heels lifting — drop the load and sit the hips back.',
      'Butt wink at the bottom — stop just above that depth.',
    ],
  },
  {
    id: 'deadlift',
    name: 'Conventional deadlift',
    aliases: ['deadlift', 'dl'],
    pattern: 'Hinge',
    setup: [
      'Bar over mid-foot. Shins close but not shoving it.',
      'Hips above knees, shoulders just in front of the bar.',
      'Lats on: imagine squeezing oranges in your armpits.',
    ],
    reps: {
      cut: '3×4–6, crisp technique',
      bulk: '4×4–6 heavy',
      recomp: '4×5',
      maintain: '3×5',
    },
    cues: [
      'Push the floor, don’t yank the bar.',
      'Bar stays glued to the legs the whole way up.',
      'Lock out by bringing the hips to the bar, not leaning back.',
    ],
    mistakes: [
      'Rounding the upper back excessively — reset and brace harder.',
      'Hips shooting up first — think “push the floor” before “pull”.',
      'Bouncing reps — reset each rep on the floor.',
    ],
  },
  {
    id: 'rdl',
    name: 'Romanian deadlift',
    aliases: ['rdl', 'romanian'],
    pattern: 'Hinge',
    setup: [
      'Soft knees, bar against thighs.',
      'Shoulder blades packed, neck neutral.',
    ],
    reps: {
      cut: '3×8–10',
      bulk: '4×6–8',
      recomp: '3×8',
      maintain: '3×8',
    },
    cues: [
      'Hips travel back. Bar scrapes the thighs.',
      'Stop when the hamstrings say enough, not when the back rounds.',
      'Stand by squeezing glutes, not yanking with the spine.',
    ],
    mistakes: [
      'Squatting the lift — knees should barely bend more.',
      'Bar drifting forward — keep it on the legs.',
    ],
  },
  {
    id: 'bench',
    name: 'Barbell bench press',
    aliases: ['bench', 'bench press'],
    pattern: 'Horizontal press',
    setup: [
      'Eyes under the bar. Feet planted.',
      'Unrack with locked elbows, set the shoulder blades into the bench.',
    ],
    reps: {
      cut: '4×6–8',
      bulk: '5×5',
      recomp: '4×6–8',
      maintain: '3×6–8',
    },
    cues: [
      'Row the bar down to the lower chest.',
      'Elbows about 45–70°, not flared to the ears.',
      'Press yourself into the bench as the bar goes up.',
    ],
    mistakes: [
      'Bouncing off the chest — pause a beat.',
      'Wrists bent back — stack wrist over elbow.',
      'Feet dancing — drive the floor.',
    ],
  },
  {
    id: 'ohp',
    name: 'Overhead press',
    aliases: ['ohp', 'shoulder press', 'military press'],
    pattern: 'Vertical press',
    setup: [
      'Bar on the anterior delts, elbows slightly in front of the bar.',
      'Glutes and abs tight before the first inch.',
    ],
    reps: {
      cut: '4×6–8',
      bulk: '5×5',
      recomp: '4×6',
      maintain: '3×6',
    },
    cues: [
      'Press up and slightly back so you finish under the bar.',
      'Move the head through after the bar passes the forehead.',
      'Do not lean back into a standing bench press.',
    ],
    mistakes: [
      'Overarching the lumbar spine — squeeze glutes harder.',
      'Pressing forward — think “up and back”.',
    ],
  },
  {
    id: 'row',
    name: 'Barbell row',
    aliases: ['row', 'bent over row'],
    pattern: 'Horizontal pull',
    setup: [
      'Hinge to about 30–45° torso.',
      'Bar hangs under the shoulders, lats stretched.',
    ],
    reps: {
      cut: '4×8–10',
      bulk: '4×6–8',
      recomp: '4×8',
      maintain: '3×8',
    },
    cues: [
      'Pull elbows toward the hips, not shrugging to the ears.',
      'Pause one beat at the top.',
      'Lower under control; that is half the set.',
    ],
    mistakes: [
      'Using a hip snap to cheat — freeze the torso.',
      'Rounding the low back — raise the torso a bit and brace.',
    ],
  },
  {
    id: 'pullup',
    name: 'Pull-up',
    aliases: ['pull-up', 'pullup', 'chin up', 'chin-up'],
    pattern: 'Vertical pull',
    setup: [
      'Dead hang, ribs down, slight hollow body.',
      'Grip just outside shoulders for pull-ups; underhand for chin-ups.',
    ],
    reps: {
      cut: '4×max-2, add band or weight as needed',
      bulk: '5×5–8 weighted if you can',
      recomp: '4×6–10',
      maintain: '3×6–10',
    },
    cues: [
      'Start the pull by depressing the scapula, then bend the elbows.',
      'Chest to the bar, not chin hunting.',
      'Lower all the way. Partial reps hide weak spots.',
    ],
    mistakes: [
      'Kipping when you asked for strength — keep legs quiet.',
      'Shrugging to the ears — think “pockets” with the elbows.',
    ],
  },
  {
    id: 'lunge',
    name: 'Walking lunge',
    aliases: ['lunge', 'split squat'],
    pattern: 'Split squat',
    setup: [
      'Tall torso, light dumbbells if bodyweight is easy.',
      'Front shin vertical at the bottom.',
    ],
    reps: {
      cut: '3×10/leg',
      bulk: '4×8/leg with load',
      recomp: '3×8–10/leg',
      maintain: '3×8/leg',
    },
    cues: [
      'Step long enough that the knee tracks over the mid-foot.',
      'Drop the back knee toward the floor, not slamming it.',
      'Push through the front heel to stand.',
    ],
    mistakes: [
      'Tiny steps that shove the knee past the toes aggressively.',
      'Torso collapsing — brace like a squat.',
    ],
  },
  {
    id: 'hip-thrust',
    name: 'Hip thrust',
    aliases: ['hip thrust', 'glute bridge'],
    pattern: 'Bridge',
    setup: [
      'Upper back on a bench, bar in the hip crease with a pad.',
      'Shins vertical at lockout.',
    ],
    reps: {
      cut: '3×10–12',
      bulk: '4×8–10',
      recomp: '3×10',
      maintain: '3×10',
    },
    cues: [
      'Ribs down. Do not hyperextend the low back at the top.',
      'Squeeze glutes for a full second at lockout.',
      'Lower until you feel a stretch, then drive.',
    ],
    mistakes: [
      'Pushing with the low back — posterior pelvic tilt at the top.',
      'Feet too far — shins should be vertical when locked out.',
    ],
  },
  {
    id: 'plank',
    name: 'Front plank',
    aliases: ['plank'],
    pattern: 'Core',
    setup: [
      'Elbows under shoulders, thighs and glutes squeezed.',
      'Neck long. Look at the floor.',
    ],
    reps: {
      cut: '3×30–45s',
      bulk: '3×40–60s',
      recomp: '3×40s',
      maintain: '3×30–45s',
    },
    cues: [
      'Pull the floor toward your hips with the elbows.',
      'If the low back sags, you are done — reset shorter.',
    ],
    mistakes: [
      'Hips piked up — that’s a rest, not a plank.',
      'Holding breath — slow nasal breathing.',
    ],
  },
]

export function findExercise(query: string): Exercise | undefined {
  const q = query.toLowerCase()
  return exercises.find(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.aliases.some((a) => q.includes(a)),
  )
}
