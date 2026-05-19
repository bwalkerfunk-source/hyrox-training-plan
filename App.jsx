import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   HYROX COMPLETE TRAINING PLAN
   Start: May 18 2026  |  Race: Sep 18 2026  |  18 weeks
   Two-a-days: GYM (AM) + CARDIO (PM)
   Rest Day: Every Sunday
   Goal: Recomp — fat loss + muscle retention, HYROX race ready
   Athlete: Male 6'3" 235 lbs ~22% BF  |  5K in 35 min
═══════════════════════════════════════════════════════════════════ */

// ─── helpers ────────────────────────────────────────────────────
function addDays(base, n) {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
}
const START = new Date(2026, 4, 18); // May 18 2026
function dayIndex(dt) {
  return Math.round((dt - START) / 86400000);
}
function fmt(dt) {
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function weekday(dt) {
  return dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}
function isSunday(dt) { return dt.getDay() === 0; }
function isRaceDay(dt) {
  return dt.getFullYear() === 2026 && dt.getMonth() === 8 && dt.getDate() === 18;
}

// ─── PHASES ─────────────────────────────────────────────────────
// 18 weeks: May 18 – Sep 18
// Phase 1: Base  Wks 1–4  (May 18–Jun 14)
// Phase 2: Build Wks 5–9  (Jun 15–Jul 19)
// Phase 3: Sim   Wks 10–14 (Jul 20–Aug 23)
// Phase 4: Taper Wks 15–18 (Aug 24–Sep 18)
const PHASES = [
  { id:1, name:"BASE BUILDING",  color:"#22d3ee", accent:"#0e7490", weeks:"1–4",  dates:"May 18 – Jun 14",  desc:"Aerobic foundation, movement learning, habit building" },
  { id:2, name:"BUILD PHASE",    color:"#f59e0b", accent:"#b45309", weeks:"5–9",  dates:"Jun 15 – Jul 19",  desc:"Higher intensity, longer intervals, sled loading" },
  { id:3, name:"SIMULATION",     color:"#f97316", accent:"#c2410c", weeks:"10–14",dates:"Jul 20 – Aug 23",  desc:"Full race simulations, race-pace intervals" },
  { id:4, name:"TAPER",          color:"#a78bfa", accent:"#7c3aed", weeks:"15–18",dates:"Aug 24 – Sep 18",  desc:"Volume reduction, sharpening, race prep" },
];

function getPhase(weekNum) {
  if (weekNum <= 4)  return PHASES[0];
  if (weekNum <= 9)  return PHASES[1];
  if (weekNum <= 14) return PHASES[2];
  return PHASES[3];
}

// ─── NUTRITION ──────────────────────────────────────────────────
const NUTRITION = {
  high: {
    id:"high", label:"HIGH CARB", sublabel:"Heavy Training Day", color:"#f97316",
    calories:2900, protein:235, carbs:310, fat:75,
    note:"Two-a-day fuel. Front-load carbs around AM session. Hit all 7 meals.",
    meals:[
      { time:"6:00 AM",  name:"Pre-Gym Fuel",        cal:520,  p:32, c:72, f:10,
        items:["1 cup rolled oats cooked (54g C)","2 whole eggs + 3 egg whites","1 banana","Black coffee or pre-workout"] },
      { time:"~9:00 AM", name:"Post-Gym Shake",       cal:400,  p:45, c:52, f:3,
        items:["1.5 scoops whey isolate (45g P)","1 cup white rice or 3 rice cakes","1 tbsp honey","Water or almond milk"] },
      { time:"12:00 PM", name:"Lunch",                cal:580,  p:58, c:65, f:10,
        items:["8 oz chicken breast or 93% ground beef","1.5 cups white rice","1 cup broccoli","1 tsp olive oil + soy sauce"] },
      { time:"3:00 PM",  name:"Pre-Cardio Fuel",      cal:280,  p:20, c:36, f:6,
        items:["1 cup low-fat Greek yogurt (18g P)","1 medium sweet potato","5 rice crackers"] },
      { time:"~5:30 PM", name:"Post-Cardio Recovery", cal:420,  p:42, c:50, f:7,
        items:["40g whey or casein protein","1 cup pasta or rice","1 cup vegetables","Dash olive oil"] },
      { time:"8:00 PM",  name:"Dinner",               cal:530,  p:52, c:38, f:18,
        items:["8 oz salmon, tuna steak, or lean beef","1 cup quinoa","Large mixed greens salad","Avocado ¼, olive oil dressing"] },
      { time:"10:00 PM", name:"Overnight Protein",    cal:170,  p:26, c:4,  f:6,
        items:["1 scoop casein protein","8–10 almonds","Herbal tea or water"] },
    ]
  },
  moderate: {
    id:"moderate", label:"MODERATE CARB", sublabel:"Standard Training Day", color:"#f59e0b",
    calories:2700, protein:235, carbs:250, fat:78,
    note:"Most weekday sessions. Solid fuel without excess. Protein priority every meal.",
    meals:[
      { time:"6:00 AM",  name:"Pre-Gym Fuel",        cal:400,  p:28, c:42, f:12,
        items:["3 whole eggs + 2 whites scrambled","2 slices Ezekiel bread (toasted)","½ avocado","Black coffee"] },
      { time:"~9:00 AM", name:"Post-Gym Shake",       cal:370,  p:43, c:44, f:3,
        items:["1.5 scoops whey isolate","1 cup oatmeal (dry cooked)","½ banana"] },
      { time:"12:00 PM", name:"Lunch",                cal:520,  p:54, c:48, f:12,
        items:["7 oz grilled chicken or turkey breast","1 cup brown rice","1 cup roasted vegetables","1 tbsp olive oil"] },
      { time:"3:00 PM",  name:"Pre-Cardio Fuel",      cal:260,  p:12, c:38, f:7,
        items:["2 rice cakes","2 tbsp peanut butter","1 medium apple"] },
      { time:"~5:30 PM", name:"Post-Cardio Recovery", cal:330,  p:42, c:28, f:5,
        items:["40g whey or casein protein","½ cup rice","Cucumber + tomato side"] },
      { time:"8:00 PM",  name:"Dinner",               cal:500,  p:56, c:26, f:16,
        items:["8 oz tilapia, cod, or chicken thighs","½ cup lentils (9g P, 20g C)","Large spinach salad","Olive oil + lemon dressing"] },
      { time:"10:00 PM", name:"Overnight Protein",    cal:220,  p:34, c:4,  f:8,
        items:["1 scoop casein protein","1 oz low-fat cheese","Herbal tea"] },
    ]
  },
  low: {
    id:"low", label:"LOW CARB", sublabel:"Rest Day — Sunday", color:"#22d3ee",
    calories:2400, protein:235, carbs:110, fat:95,
    note:"Sunday rest day. Cut carbs, keep protein high. Let muscles repair. No training.",
    meals:[
      { time:"8:00 AM",  name:"Breakfast",            cal:430,  p:44, c:5,  f:26,
        items:["4 whole eggs scrambled in butter","3 strips turkey bacon","Spinach + mushroom sauté","Black coffee"] },
      { time:"11:00 AM", name:"Mid-Morning",          cal:290,  p:42, c:14, f:7,
        items:["1.5 scoops whey protein in water","1 cup mixed berries","1 tbsp chia seeds"] },
      { time:"1:30 PM",  name:"Lunch",                cal:500,  p:60, c:18, f:20,
        items:["8 oz 90/10 ground beef patties","Large kale salad + olive oil","½ cup black beans","Salsa, jalapeño, lime"] },
      { time:"4:00 PM",  name:"Afternoon Snack",      cal:220,  p:15, c:8,  f:15,
        items:["2 hard-boiled eggs","1 oz macadamia nuts","Celery + 2 tbsp almond butter"] },
      { time:"7:00 PM",  name:"Dinner",               cal:590,  p:64, c:36, f:20,
        items:["9 oz salmon or lean steak","2 cups roasted Brussels sprouts + cauliflower","½ cup wild rice","Lemon + herbs + olive oil"] },
      { time:"9:30 PM",  name:"Overnight Protein",    cal:200,  p:28, c:4,  f:9,
        items:["1 scoop casein","1 tbsp almond butter","Chamomile tea"] },
    ]
  }
};

// ─── WORKOUT GENERATOR ──────────────────────────────────────────
// Each day: { gymTitle, gymItems, cardioTitle, cardioItems, nutKey, dayType }
// dayType: LOWER | UPPER_PUSH | UPPER_PULL | LEGS2 | PUSH2 | PULL2 | REST | RACE

function buildDay(weekNum, dayOfWeek, dayInPhase) {
  // dayOfWeek: 0=Mon,1=Tue,2=Wed,3=Thu,4=Fri,5=Sat,6=Sun(rest)
  const phase = getPhase(weekNum);
  const pid = phase.id;

  // Intensity scaling
  const intensityPct = pid === 1 ? "65%" : pid === 2 ? "72%" : pid === 3 ? "75%" : "65%";
  const runPace = pid === 1 ? "9:15–10:00/mi" : pid === 2 ? "8:30–9:15/mi" : pid === 3 ? "7:45–8:30/mi" : "8:00–8:45/mi";
  const easyPace = pid === 1 ? "9:40–10:30/mi" : "9:15–10:00/mi";
  const sledNote = pid === 1 ? "moderate load (learn form)" : pid === 2 ? "80% race weight" : pid === 3 ? "race weight" : "moderate load";
  const sleds = pid <= 2 ? 4 : pid === 3 ? 6 : 3;

  // GYM rotation by day of week (Mon–Sat = 0–5)
  const gymRotation = [
    // Monday: Lower Body A
    {
      type:"LOWER_A", title:"Lower Body A — Squat Focus",
      items:[
        `Warm-up: 5 min bike + hip circles, leg swings`,
        `Back Squat 4×${pid<=2?"8":"6"} @${intensityPct} 1RM`,
        `Romanian Deadlift 3×10`,
        `Walking Lunges 3×12/leg (add DBs from Wk 3+)`,
        `Leg Press 3×12`,
        `Calf Raises 4×15`,
        `Sled Push: ${sleds}×25m @${sledNote}`,
        `Sled Pull: ${sleds}×25m @${sledNote}`,
        `Rest ${pid>=3?"90s":"2 min"} between sled sets`,
        `Cool-down: hip flexor + quad stretch 5 min`,
        `~${pid>=3?55:65} min`,
      ]
    },
    // Tuesday: Upper Push
    {
      type:"UPPER_PUSH", title:"Upper Body — Push (Chest/Shoulders/Triceps)",
      items:[
        `Warm-up: band pull-aparts 3×15, arm circles`,
        `Bench Press 4×${pid<=2?"8":"6"} @${intensityPct} 1RM`,
        `DB Incline Press 3×10`,
        `Overhead Press 3×${pid<=2?"10":"8"}`,
        `Lateral Raises 3×15`,
        `Tricep Dips 3×12`,
        `Cable Tricep Pushdown 3×15`,
        `Face Pulls 3×20 (rear delt health)`,
        `~55 min`,
      ]
    },
    // Wednesday: Upper Pull
    {
      type:"UPPER_PULL", title:"Upper Body — Pull (Back/Biceps)",
      items:[
        `Warm-up: dead hangs 3×20s, shoulder rotations`,
        `Pull-Ups ${pid>=2?"Weighted ":""}4×${pid<=2?"6":"5"}`,
        `Bent-Over Barbell Row 4×8 @${intensityPct}`,
        `Seated Cable Row 3×12`,
        `Single-arm DB Row 3×10/side`,
        `Barbell Curl 3×10`,
        `Hammer Curl 3×12`,
        `Face Pulls 3×20`,
        `~55 min`,
      ]
    },
    // Thursday: Lower Body B
    {
      type:"LOWER_B", title:"Lower Body B — Hinge & Unilateral Focus",
      items:[
        `Warm-up: 5 min bike + glute bridges 2×15`,
        `Trap Bar Deadlift 4×${pid<=2?"6":"5"} @${intensityPct}`,
        `Bulgarian Split Squat 3×${pid<=2?"10":"8"}/leg @DBs`,
        `Nordic Curl Negatives 3×6`,
        `Leg Curl 3×12`,
        `Box Step-Ups 3×10/leg`,
        `Sled Push: ${sleds}×25m @${sledNote}`,
        `Sled Pull: ${sleds}×25m @${sledNote}`,
        `~${pid>=3?55:65} min`,
      ]
    },
    // Friday: Full Body / HYROX Strength
    {
      type:"FULL_HYROX", title:"Full Body — HYROX Strength Day",
      items:[
        `Warm-up: 0.5 mi easy jog`,
        `Back Squat 3×5 @${intensityPct}`,
        `Push Press 4×6 (power for wall balls)`,
        `Weighted Farmer's Carry: 4×30m @${pid<=2?"44":"53"} lb/hand`,
        `Single-leg RDL 3×10/leg`,
        `Pushups 3×20 (or weighted vest)`,
        `Wall Balls: 4×${pid<=2?"15":"20"} reps @20 lb — rhythm focus`,
        `Plank 3×45s`,
        `~55 min`,
      ]
    },
    // Saturday: Legs / Power
    {
      type:"LEGS_POWER", title:"Legs — Power & Accessory",
      items:[
        `Warm-up: jump rope 3 min + dynamic leg swings`,
        `Power Clean or Jump Squat 4×5 (explosive focus)`,
        `Leg Press 4×10`,
        `Walking Lunge 3×15/leg @DBs`,
        `Leg Extension 3×15`,
        `Calf Raises 4×20`,
        `Glute Bridge 3×15 @barbell`,
        `Core: 3× {20 hanging knee raises, 30s L-sit or hollow hold}`,
        `~55 min`,
      ]
    },
  ];

  // CARDIO rotation by day of week
  const cardioMap = {
    0: { // Monday cardio
      type:"EASY_RUN", title:`Easy Aerobic Run — ${pid<=2?"20":"25"} min`,
      items:[
        `${pid<=2?"20":"25"} min easy continuous run @${easyPace}`,
        `HR below ${pid<=2?140:145} bpm throughout`,
        `Walk breaks allowed — do NOT push`,
        `~${pid<=2?"2":"2.2"} mi total`,
        `Finish: 5 min calf + hip flexor stretch`,
        `~30 min total`,
      ]
    },
    1: { // Tuesday cardio
      type:"RUN_INTERVALS", title:`Run Intervals`,
      items:[
        `10 min easy warm-up jog`,
        pid<=2 ? `4×0.25 mi @8:45–9:15/mi, 90s walk rest` :
        pid===2 ? `4×0.5 mi @${runPace}, 2 min walk rest` :
        `6×0.6 mi @${runPace}, 90s walk rest`,
        `5 min easy cooldown`,
        `Total run: ${pid<=2?"~2.2":"~3.7"}+ mi`,
        `Log all split times`,
        `~45 min`,
      ]
    },
    2: { // Wednesday cardio — HYROX stations
      type:"HYROX_CARDIO", title:"HYROX Station Cardio",
      items:[
        pid <= 2
          ? [
              `3 rounds (2 min rest between rounds):`,
              `  Row 500m @strong effort`,
              `  Ski Erg 500m @strong effort`,
              `  Burpee Broad Jumps 10 reps`,
              `  Farmer's Carry 100 ft @44 lb/hand`,
              `  Wall Balls 15 reps @20 lb`,
            ]
          : pid === 3
          ? [
              `HYROX Circuit (race order, log all times):`,
              `  0.6 mi run @${runPace}`,
              `  Ski Erg 1,000m`,
              `  0.6 mi run`,
              `  Sled Push 25+25m @race weight`,
              `  0.6 mi run`,
              `  Sled Pull 25+25m @race weight`,
              `  0.6 mi run`,
              `  Burpee Broad Jumps 20 reps`,
              `  0.6 mi run`,
              `  Row 1,000m`,
              `  0.6 mi run`,
              `  Farmer's Carry 2×82 ft @53 lb`,
              `  0.6 mi run`,
              `  Sandbag Lunges 109 yd`,
              `  0.6 mi run`,
              `  Wall Balls 75 reps @20 lb`,
            ]
          : [
              `Light station activation (taper):`,
              `  2×0.6 mi @race pace, full 3 min rest`,
              `  Ski Erg 200m, Row 200m`,
              `  10 Burpee Broad Jumps, 15 Wall Balls`,
              `  Total under 30 min — feel sharp, stop feeling great`,
            ],
        `~${pid<=2?"50":pid===3?"80":"30"} min`,
      ].flat()
    },
    3: { // Thursday cardio
      type:"EASY_RUN_MOB", title:"Easy Run + Mobility",
      items:[
        `${pid<=2?"25":"30"} min easy run @${easyPace}`,
        `~${pid<=2?"2.2":"2.5"} mi`,
        `Post-run mobility 15 min:`,
        `  Pigeon pose 60s/side`,
        `  90/90 hip switches 2×10`,
        `  Couch stretch 60s/side`,
        `  Calf stretch 45s/side`,
        `  T-spine foam roll 2 min`,
        `~45 min total`,
      ]
    },
    4: { // Friday cardio
      type:"CONDITIONING", title:"Conditioning — Mixed Fatigue",
      items:[
        pid <= 2
          ? [
              `AMRAP ${pid===1?15:20} min:`,
              `  0.25 mi run`,
              `  15 Wall Balls @20 lb`,
              `  12 Cal Row`,
              `  8 Burpee Broad Jumps`,
              `  Farmer's Carry 65 ft @44 lb/hand`,
              `Track total rounds completed`,
            ]
          : pid === 3
          ? [
              `4 Rounds (2 min rest between):`,
              `  0.6 mi run @race pace`,
              `  Row 250m @max effort`,
              `  Ski Erg 250m @max effort`,
              `  15 Burpee Broad Jumps`,
              `Track total time per round`,
            ]
          : [
              `Taper sharpener — 2 rounds only:`,
              `  0.25 mi run @race pace`,
              `  Row 200m, Ski Erg 200m`,
              `  8 Burpee Broad Jumps`,
              `Feel fast. Stop while feeling great.`,
            ],
        `~${pid<=2?30:pid===3?45:20} min`,
      ].flat()
    },
    5: { // Saturday cardio
      type:"LONG_RUN", title:`Long Run / Race Sim`,
      items:[
        pid <= 2
          ? [
              `${pid===1?25:35} min easy continuous run @${easyPace}`,
              `~${pid===1?"2.2":"2.8"} mi`,
              `Focus: time on feet, easy effort`,
            ]
          : pid === 3
          ? [
              `HYROX Full Simulation — race order all 8 stations`,
              `0.6 mi × 8 runs + all stations`,
              `Target time: under 90 min`,
              `Log every station split`,
              `Pace runs conservatively first 2.4 mi`,
            ]
          : [
              `Taper: 20 min easy shakeout jog`,
              `4×0.12 mi strides @race feel (not sprint)`,
              `5 min easy cooldown`,
            ],
        `~${pid<=2?40:pid===3?95:30} min`,
      ].flat()
    },
  };

  return {
    gym: gymRotation[dayOfWeek],
    cardio: cardioMap[dayOfWeek],
  };
}

// ─── BUILD ALL WEEKS ────────────────────────────────────────────
// May 18 = Monday. Week 1 = May 18–24. Sunday May 24 = rest.
// 18 weeks total, race Sep 18 (Friday).

function buildWeeks() {
  const weeks = [];
  let cursor = new Date(START);
  for (let w = 1; w <= 18; w++) {
    const phase = getPhase(w);
    const days = [];
    // 7 days per week
    for (let dow = 0; dow < 7; dow++) {
      const date = new Date(cursor);
      date.setDate(cursor.getDate() + dow);
      if (isRaceDay(date)) {
        days.push({
          date, dow, isRest: false, isRace: true, nutrition: "high",
          gym: {
            type:"RACE", title:"🏅 HYROX RACE — Salt Lake City",
            items:[
              `Wake up 3 hrs before gun time`,
              `Pre-race meal: oats + banana + coffee (familiar food only)`,
              `Arrive venue 60 min early`,
              `Warm-up: 8 min easy jog + dynamic stretching`,
              `Activate: few ski erg strokes, sled push strides`,
              `RACE STRATEGY:`,
              `  Mi 1–2: conservative 8:45–9:40/mi — do NOT go out hot`,
              `  Ski Erg: 4:30–5:00/500m controlled`,
              `  Sled Push: short powerful steps, drive from hips`,
              `  Sled Pull: hip hinge, breathe on every pull`,
              `  Row: 2:10–2:20/500m split`,
              `  Burpee BJ: find a rhythm, don't rush`,
              `  Farmer's Carry: tall posture, big steps`,
              `  Lunges: steady rhythm — 15–15–15–10–10 break strategy`,
              `  Wall Balls: 15–15–15–10–10–10 break strategy`,
              `  Mi 4–5: release reserves, push hard`,
              `  Final run: everything left in the tank`,
            ]
          },
          cardio: {
            type:"RACE", title:"Post-Race Recovery",
            items:[
              `Walk 10 min immediately after finish`,
              `Stretch: hip flexors, quads, calves`,
              `Eat real food within 30–45 min (protein + carbs)`,
              `Rehydrate: water + electrolytes`,
              `CELEBRATE — you earned this 🏅`,
            ]
          }
        });
        continue;
      }
      const isSun = date.getDay() === 0;
      if (isSun) {
        days.push({
          date, dow, isRest: true, isRace: false, nutrition: "low",
          gym: {
            type:"REST", title:"Full Rest Day — Sunday",
            items:[
              `Complete rest — zero training`,
              `Light 15 min walk if desired`,
              `Foam roll: quads, IT band, calves (optional)`,
              `Sleep 8–9 hours`,
              `Hydrate: 120+ oz water`,
              `Meal prep for the week ahead`,
              `Mental reset — review weekly goals`,
            ]
          },
          cardio: {
            type:"REST", title:"Rest & Recovery",
            items:[
              `No cardio — full recovery`,
              `Focus on nutrition quality today`,
              `Review station performance from Wednesday's circuit`,
              `Log any soreness or niggles`,
            ]
          }
        });
        continue;
      }
      const dayOfWeek = dow; // 0=Mon ... 5=Sat, 6=Sun already handled
      const dayInPhase = (w - (phase.id===1?1:phase.id===2?5:phase.id===3?10:15)) * 6 + dow;
      const built = buildDay(w, dayOfWeek, dayInPhase);
      const nutKey = dow === 6 ? "low" : (dow === 2 || dow === 5) ? "high" : "moderate";
      days.push({
        date, dow, isRest: false, isRace: false, nutrition: nutKey,
        gym: built.gym,
        cardio: built.cardio
      });
    }
    cursor.setDate(cursor.getDate() + 7);
    weeks.push({ weekNum: w, phase, days });
  }
  return weeks;
}

const ALL_WEEKS = buildWeeks();

// ─── DAY TYPE COLORS ────────────────────────────────────────────
const TYPE_COLOR = {
  LOWER_A:"#3b82f6", LOWER_B:"#2563eb",
  UPPER_PUSH:"#10b981", UPPER_PULL:"#059669",
  FULL_HYROX:"#f59e0b", LEGS_POWER:"#8b5cf6",
  REST:"#374151", RACE:"#ef4444",
  EASY_RUN:"#22d3ee", RUN_INTERVALS:"#f97316",
  HYROX_CARDIO:"#ef4444", EASY_RUN_MOB:"#a78bfa",
  CONDITIONING:"#f59e0b", LONG_RUN:"#ec4899",
};

const TYPE_ICON = {
  LOWER_A:"🦵", LOWER_B:"🏋️", UPPER_PUSH:"💪", UPPER_PULL:"🔗",
  FULL_HYROX:"⚡", LEGS_POWER:"🔥", REST:"😴", RACE:"🏅",
  EASY_RUN:"🏃", RUN_INTERVALS:"⏱", HYROX_CARDIO:"🔥",
  EASY_RUN_MOB:"🧘", CONDITIONING:"💥", LONG_RUN:"🛣",
};

// ─── COMPONENT ──────────────────────────────────────────────────
export default function HyroxPlan() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [activePhaseFilter, setActivePhaseFilter] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [nutTab, setNutTab] = useState("high");
  const [mainTab, setMainTab] = useState("plan"); // plan | nutrition

  const displayWeeks = activePhaseFilter
    ? ALL_WEEKS.filter(w => w.phase.id === activePhaseFilter)
    : ALL_WEEKS;

  const currentWeekData = ALL_WEEKS.find(w => w.weekNum === activeWeek);

  const weekStart = useMemo(() => {
    const d = new Date(START);
    d.setDate(d.getDate() + (activeWeek - 1) * 7);
    return d;
  }, [activeWeek]);
  const weekEnd = addDays(weekStart, 6);

  return (
    <div style={{
      fontFamily:"'Barlow Condensed','Oswald',sans-serif",
      background:"#080808", minHeight:"100vh", color:"#e5e5e5",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;900&family=Barlow:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#f97316;border-radius:2px}
        ::-webkit-scrollbar-track{background:#111}
        .btn{cursor:pointer;border:none;transition:all .15s}
        .btn:hover{filter:brightness(1.2)}
        .card{transition:all .15s;cursor:pointer}
        .card:hover{transform:translateY(-2px)}
        .item-row{font-family:'Barlow',sans-serif;font-size:13px;color:#bbb;
          padding:4px 0 4px 12px;border-left:2px solid #222;margin:3px 0;line-height:1.5}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp .2s ease}
        @keyframes glow{0%,100%{opacity:1}50%{opacity:.5}}
        .race-glow{animation:glow 2s infinite}
        .meal-row{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #1a1a1a}
        .meal-row:last-child{border-bottom:none}
        .macro-pill{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:1px;margin:2px}
        .tab-btn{cursor:pointer;border:none;transition:.15s;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:1px}
        .tab-btn:hover{opacity:.85}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background:"linear-gradient(135deg,#080808 0%,#1a0800 60%,#080808 100%)",
        borderBottom:"3px solid #f97316", padding:"28px 20px 22px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:0,right:0,width:350,height:350,
          background:"radial-gradient(circle,rgba(249,115,22,.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{fontSize:48,lineHeight:1}}>🏋️</div>
            <div>
              <div style={{fontSize:10,letterSpacing:"4px",color:"#f97316",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>
                SALT LAKE CITY · RACE DAY SEPTEMBER 18, 2026
              </div>
              <h1 style={{fontSize:"clamp(26px,5vw,54px)",fontWeight:900,letterSpacing:"2px",color:"#fff",lineHeight:1}}>
                HYROX TRAINING PLAN
              </h1>
              <div style={{fontSize:13,color:"#555",fontFamily:"'Barlow'",fontWeight:300,marginTop:4}}>
                18 Weeks · May 18 – Sep 18 · Two-A-Days · Sundays Off · Gym AM + Cardio PM · Nutrition Included
              </div>
            </div>
          </div>
          {/* Athlete badges */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:14}}>
            {[["♂ 6'3\" 235 lb","#3b82f6"],["~22% BF","#6b7280"],["5K ~35 min","#10b981"],
              ["Lifts 6×/wk","#f59e0b"],["2-A-DAYS","#f97316"],["SUNDAYS OFF","#a78bfa"],["HYROX DEBUT","#ef4444"]
            ].map(([t,c])=>(
              <span key={t} style={{background:c+"22",border:`1px solid ${c}44`,color:c,
                padding:"3px 10px",borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:"1px"}}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"18px 16px"}}>

        {/* ── MAIN TABS ── */}
        <div style={{display:"flex",gap:2,marginBottom:20,background:"#111",borderRadius:8,padding:4,width:"fit-content"}}>
          {[["plan","📅 TRAINING PLAN"],["nutrition","🥗 NUTRITION PLAN"]].map(([k,l])=>(
            <button key={k} className="tab-btn"
              onClick={()=>{setMainTab(k);setSelectedDay(null)}}
              style={{
                background:mainTab===k?"#f97316":"transparent",
                color:mainTab===k?"#000":"#666",
                padding:"8px 20px",borderRadius:6,fontSize:13,
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* ══════════════ NUTRITION TAB ══════════════ */}
        {mainTab === "nutrition" && (
          <div className="fade">
            {/* Philosophy */}
            <div style={{background:"#111",border:"1px solid #f97316",borderRadius:10,padding:"18px 20px",marginBottom:20}}>
              <div style={{fontSize:11,color:"#f97316",fontWeight:700,letterSpacing:"3px",marginBottom:10}}>NUTRITION PHILOSOPHY — BODY RECOMPOSITION</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
                {[
                  ["🎯 Goal","Lose fat while keeping/building muscle. Moderate caloric deficit (~300–500 cal/day). High protein every day without exception."],
                  ["🥩 Protein","235g/day = 1g per lb bodyweight. Split across 6–7 meals. Never skip protein in a meal."],
                  ["🍚 Carb Cycling","High carbs on heavy training days (sled, circuit, long run). Moderate on standard days. Low on Sunday rest."],
                  ["💧 Hydration","Minimum 120 oz (3.5L) daily. Add 16–24 oz per training session. Electrolytes on two-a-day days."],
                  ["⏰ Timing","Eat pre-gym within 90 min of training. Post-gym shake within 30 min. Pre-cardio snack 60–90 min before PM."],
                  ["📦 Supplements","Whey + casein protein, creatine 5g/day, fish oil 2–3g/day, vitamin D3, electrolyte mix on hard days."],
                ].map(([title,body])=>(
                  <div key={title} style={{background:"#0d0d0d",borderRadius:8,padding:"12px 14px",border:"1px solid #1e1e1e"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:6}}>{title}</div>
                    <div style={{fontFamily:"'Barlow'",fontSize:12,color:"#999",lineHeight:1.6}}>{body}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro overview */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:20}}>
              {Object.values(NUTRITION).map(n=>(
                <div key={n.id} style={{background:"#111",border:`2px solid ${n.color}`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontSize:10,color:n.color,fontWeight:700,letterSpacing:"2px"}}>{n.label}</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:4}}>{n.sublabel}</div>
                  <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                    {[["CALS",n.calories,"#fff"],["PROTEIN",n.protein+"g","#f97316"],["CARBS",n.carbs+"g","#f59e0b"],["FAT",n.fat+"g","#22d3ee"]].map(([k,v,c])=>(
                      <div key={k} style={{textAlign:"center"}}>
                        <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
                        <div style={{fontSize:9,color:"#555",letterSpacing:"1px"}}>{k}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontFamily:"'Barlow'",fontSize:11,color:"#666",marginTop:8,lineHeight:1.5}}>{n.note}</div>
                </div>
              ))}
            </div>

            {/* Meal plans */}
            <div style={{display:"flex",gap:4,marginBottom:14}}>
              {Object.values(NUTRITION).map(n=>(
                <button key={n.id} className="tab-btn"
                  onClick={()=>setNutTab(n.id)}
                  style={{
                    background:nutTab===n.id?n.color+"33":"#111",
                    border:`2px solid ${nutTab===n.id?n.color:"#222"}`,
                    color:nutTab===n.id?n.color:"#555",
                    padding:"6px 16px",borderRadius:6,fontSize:12,
                  }}>{n.label}</button>
              ))}
            </div>

            {(() => {
              const n = NUTRITION[nutTab];
              return (
                <div className="fade" style={{background:"#111",border:`1px solid ${n.color}33`,borderRadius:10,padding:"18px 20px"}}>
                  <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:4}}>{n.sublabel}</div>
                  <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
                    {[["CALORIES",n.calories],["PROTEIN",n.protein+"g"],["CARBS",n.carbs+"g"],["FAT",n.fat+"g"]].map(([k,v])=>(
                      <span key={k} className="macro-pill" style={{background:n.color+"22",color:n.color,border:`1px solid ${n.color}44`}}>
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                  {n.meals.map((meal,i)=>(
                    <div key={i} className="meal-row">
                      <div style={{minWidth:110,fontSize:10,color:"#555",fontWeight:700,letterSpacing:"1px",paddingTop:2}}>{meal.time}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:4}}>{meal.name}</div>
                        {meal.items.map((item,j)=>(
                          <div key={j} className="item-row" style={{borderColor:n.color+"44"}}>{item}</div>
                        ))}
                        <div style={{marginTop:6,fontSize:10,background:n.color+"11",color:n.color,
                          padding:"3px 10px",borderRadius:4,display:"inline-block",fontWeight:700,letterSpacing:"1px"}}>
                          {meal.macros ? meal.macros : `P:${meal.p}g  C:${meal.c}g  F:${meal.f}g  ~${meal.cal} cal`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════ TRAINING PLAN TAB ══════════════ */}
        {mainTab === "plan" && (<>

          {/* Phase filters */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginBottom:18}}>
            {PHASES.map(p=>(
              <button key={p.id} className="btn"
                onClick={()=>setActivePhaseFilter(activePhaseFilter===p.id?null:p.id)}
                style={{
                  background:activePhaseFilter===p.id?p.color+"20":"#111",
                  border:`2px solid ${activePhaseFilter===p.id?p.color:"#1e1e1e"}`,
                  borderRadius:8,padding:"10px 14px",textAlign:"left",
                }}>
                <div style={{fontSize:9,color:p.color,letterSpacing:"2px",fontWeight:700}}>PHASE {p.id} · WKS {p.weeks}</div>
                <div style={{fontSize:15,fontWeight:900,color:"#fff",marginTop:2}}>{p.name}</div>
                <div style={{fontSize:10,color:"#555",fontFamily:"'Barlow'",marginTop:2}}>{p.dates}</div>
              </button>
            ))}
          </div>

          {/* Week selector */}
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:18,
            background:"#0d0d0d",padding:"10px",borderRadius:8,border:"1px solid #1a1a1a"}}>
            <div style={{width:"100%",fontSize:10,color:"#444",fontWeight:700,letterSpacing:"2px",marginBottom:6}}>SELECT WEEK</div>
            {displayWeeks.map(({weekNum,phase})=>(
              <button key={weekNum} className="btn"
                onClick={()=>{setActiveWeek(weekNum);setSelectedDay(null)}}
                style={{
                  background:activeWeek===weekNum?phase.color:"#1a1a1a",
                  color:activeWeek===weekNum?"#000":"#555",
                  padding:"5px 12px",borderRadius:5,fontSize:12,fontWeight:700,letterSpacing:"1px",
                }}>
                WK{weekNum}
              </button>
            ))}
          </div>

          {/* Week header */}
          {currentWeekData && (() => {
            const p = currentWeekData.phase;
            return (
              <div style={{background:"#111",border:`1px solid ${p.color}33`,borderRadius:10,
                padding:"14px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",
                alignItems:"center",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontSize:10,color:p.color,fontWeight:700,letterSpacing:"3px"}}>PHASE {p.id}: {p.name}</div>
                  <div style={{fontSize:24,fontWeight:900,color:"#fff",marginTop:4}}>
                    WEEK {activeWeek} &nbsp;·&nbsp; {fmt(weekStart)} – {fmt(weekEnd)}
                  </div>
                  <div style={{fontSize:11,color:"#555",fontFamily:"'Barlow'",marginTop:2}}>{p.desc}</div>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {currentWeekData.days.map((day,i)=>{
                    const col = day.isRest ? "#374151" : day.isRace ? "#ef4444" : TYPE_COLOR[day.gym?.type]||"#666";
                    return (
                      <div key={i} style={{textAlign:"center",cursor:"pointer"}}
                        onClick={()=>setSelectedDay(selectedDay?.date?.toISOString()===day.date.toISOString()?null:day)}>
                        <div style={{width:32,height:32,borderRadius:5,background:col+"33",
                          border:`1px solid ${col}55`,display:"flex",alignItems:"center",
                          justifyContent:"center",fontSize:15}}>
                          {day.isRace?"🏅":day.isRest?"😴":(TYPE_ICON[day.gym?.type]||"💪")}
                        </div>
                        <div style={{fontSize:9,color:col,marginTop:2,fontWeight:700}}>{weekday(day.date)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Day cards grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10,marginBottom:20}}>
            {currentWeekData?.days.map((day,i)=>{
              const isSelected = selectedDay?.date?.toISOString()===day.date.toISOString();
              const gymCol = day.isRest?"#374151":day.isRace?"#ef4444":TYPE_COLOR[day.gym?.type]||"#666";
              const cardioCol = day.isRest?"#374151":day.isRace?"#ef4444":TYPE_COLOR[day.cardio?.type]||"#555";
              return (
                <div key={i} className={`card ${day.isRace?"race-glow":""}`}
                  onClick={()=>setSelectedDay(isSelected?null:day)}
                  style={{
                    background:isSelected?"#151515":"#0f0f0f",
                    border:`2px solid ${isSelected?gymCol:"#1e1e1e"}`,
                    borderRadius:10,padding:"14px",
                  }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:10,color:gymCol,fontWeight:700,letterSpacing:"2px"}}>
                        {weekday(day.date)} · {fmt(day.date)}
                        {day.isRest?" · REST DAY":""}
                        {day.isRace?" · RACE DAY":""}
                      </div>
                      <div style={{fontSize:15,fontWeight:900,color:"#fff",marginTop:4,lineHeight:1.2}}>
                        {day.gym?.title}
                      </div>
                    </div>
                    <div style={{fontSize:22,marginLeft:8}}>
                      {day.isRace?"🏅":day.isRest?"😴":(TYPE_ICON[day.gym?.type]||"💪")}
                    </div>
                  </div>
                  {!day.isRest && !day.isRace && (
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:9,background:gymCol+"22",color:gymCol,
                        padding:"2px 8px",borderRadius:3,fontWeight:700,letterSpacing:"1px"}}>
                        🏋️ GYM
                      </span>
                      <span style={{fontSize:9,background:cardioCol+"22",color:cardioCol,
                        padding:"2px 8px",borderRadius:3,fontWeight:700,letterSpacing:"1px"}}>
                        🏃 {day.cardio?.type?.replace(/_/g," ")}
                      </span>
                      <span style={{fontSize:9,
                        background:NUTRITION[day.nutrition]?.color+"22",
                        color:NUTRITION[day.nutrition]?.color,
                        padding:"2px 8px",borderRadius:3,fontWeight:700,letterSpacing:"1px"}}>
                        🍽 {NUTRITION[day.nutrition]?.label}
                      </span>
                    </div>
                  )}
                  <div style={{marginTop:8,fontSize:10,color:isSelected?"#f97316":"#333"}}>
                    {isSelected?"▲ tap to collapse":"tap for full workout"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day detail panel */}
          {selectedDay && (()=>{
            const day = selectedDay;
            const gymCol = day.isRest?"#374151":day.isRace?"#ef4444":TYPE_COLOR[day.gym?.type]||"#666";
            const cardioCol = day.isRest?"#374151":day.isRace?"#ef4444":TYPE_COLOR[day.cardio?.type]||"#555";
            const nut = NUTRITION[day.nutrition];
            return (
              <div className="fade" style={{
                background:"#0f0f0f",border:`2px solid ${gymCol}`,
                borderRadius:12,padding:"22px",marginBottom:20,
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:gymCol,fontWeight:700,letterSpacing:"3px"}}>
                      {weekday(day.date)} · {fmt(day.date)} · WEEK {activeWeek} · PHASE {currentWeekData?.phase.id}
                    </div>
                    <h2 style={{fontSize:"clamp(18px,3vw,30px)",fontWeight:900,color:"#fff",marginTop:6,lineHeight:1}}>
                      {day.isRest?"SUNDAY — FULL REST":day.isRace?"HYROX RACE DAY 🏅":day.gym?.title}
                    </h2>
                  </div>
                  <button className="btn"
                    onClick={()=>setSelectedDay(null)}
                    style={{background:"#1a1a1a",color:"#666",border:"1px solid #333",
                      borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:700}}>
                    ✕ CLOSE
                  </button>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginBottom:16}}>
                  {/* GYM block */}
                  <div style={{background:"#080808",borderRadius:8,padding:"16px",border:`1px solid ${gymCol}44`}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:"2px",color:gymCol,marginBottom:10}}>
                      🏋️ {day.isRest?"REST":"AM — GYM SESSION"}
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:10}}>{day.gym?.title}</div>
                    {day.gym?.items?.map((item,j)=>(
                      <div key={j} className="item-row" style={{borderColor:gymCol+"55"}}>{item}</div>
                    ))}
                  </div>

                  {/* CARDIO block */}
                  <div style={{background:"#080808",borderRadius:8,padding:"16px",border:`1px solid ${cardioCol}44`}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:"2px",color:cardioCol,marginBottom:10}}>
                      🏃 {day.isRest?"REST":"PM — CARDIO SESSION"}
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:10}}>{day.cardio?.title}</div>
                    {day.cardio?.items?.map((item,j)=>(
                      <div key={j} className="item-row" style={{borderColor:cardioCol+"55"}}>{item}</div>
                    ))}
                  </div>

                  {/* Nutrition block */}
                  {nut && (
                    <div style={{background:"#080808",borderRadius:8,padding:"16px",border:`1px solid ${nut.color}44`}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:"2px",color:nut.color,marginBottom:10}}>
                        🍽 NUTRITION — {nut.label}
                      </div>
                      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
                        {[["CALS",nut.calories,"#fff"],["PRO",nut.protein+"g","#f97316"],["CARBS",nut.carbs+"g","#f59e0b"],["FAT",nut.fat+"g","#22d3ee"]].map(([k,v,c])=>(
                          <div key={k} style={{textAlign:"center"}}>
                            <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
                            <div style={{fontSize:9,color:"#444",letterSpacing:"1px"}}>{k}</div>
                          </div>
                        ))}
                      </div>
                      {nut.meals.slice(0,4).map((m,j)=>(
                        <div key={j} style={{marginBottom:8}}>
                          <div style={{fontSize:10,color:nut.color,fontWeight:700,letterSpacing:"1px"}}>{m.time} — {m.name}</div>
                          <div style={{fontSize:11,color:"#777",fontFamily:"'Barlow'",marginTop:2}}>
                            {m.items.slice(0,2).join(" · ")}
                          </div>
                        </div>
                      ))}
                      <button className="btn" onClick={()=>setMainTab("nutrition")}
                        style={{marginTop:8,background:nut.color+"22",border:`1px solid ${nut.color}44`,
                          color:nut.color,padding:"5px 12px",borderRadius:5,fontSize:10,fontWeight:700,
                          letterSpacing:"1px",cursor:"pointer"}}>
                        VIEW FULL MEAL PLAN →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Legend */}
          <div style={{background:"#0d0d0d",borderRadius:10,padding:"16px 18px",border:"1px solid #1a1a1a"}}>
            <div style={{fontSize:10,color:"#333",fontWeight:700,letterSpacing:"2px",marginBottom:12}}>GYM ROTATION LEGEND (MON–SAT)</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:14}}>
              {[
                ["MON","Lower Body A — Squat + Sled","LOWER_A"],
                ["TUE","Upper Push — Chest/Shoulders/Tri","UPPER_PUSH"],
                ["WED","Upper Pull — Back/Biceps","UPPER_PULL"],
                ["THU","Lower Body B — Hinge + Sled","LOWER_B"],
                ["FRI","Full Body HYROX Strength","FULL_HYROX"],
                ["SAT","Legs Power + Accessory","LEGS_POWER"],
                ["SUN","REST","REST"],
              ].map(([day,label,type])=>(
                <div key={day} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:10,color:TYPE_COLOR[type],fontWeight:700,
                    background:TYPE_COLOR[type]+"22",padding:"2px 7px",borderRadius:3}}>{day}</span>
                  <span style={{fontSize:11,color:"#555",fontFamily:"'Barlow'"}}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{borderTop:"1px solid #1a1a1a",paddingTop:12,fontFamily:"'Barlow'",fontSize:11,color:"#444",lineHeight:2}}>
              <strong style={{color:"#666"}}>HYROX Race Format (Sep 18):</strong>{" "}
              8×0.6 mi runs alternating with 8 stations —{" "}
              Ski Erg 1km · Sled Push 25+25m · Sled Pull 25+25m · Burpee Broad Jumps ×20 · Row 1km · Farmer's Carry 2×82 ft · Sandbag Lunges 109 yd · Wall Balls ×75 @20lb{" "}
              <strong style={{color:"#f97316"}}>· Total ~4.8 mi running + all stations</strong>
            </div>
          </div>

        </>)}

      </div>
    </div>
  );
}
