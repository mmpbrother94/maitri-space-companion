/* Utility to generate MAITRI-style support responses shared across chat surfaces. */

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "hurt myself",
  "self harm",
  "self-harm",
  "ending it",
  "end it all",
  "cannot go on",
  "want to die",
  "harm someone",
  "hurt someone",
  "attack",
  "life threatening",
  "emergency",
];

const INSIGHT_SUPPORT_COPY = {
  Happy:
    "Energy levels are high. Want me to capture this in your mood log or celebrate with your favourite track?",
  Calm:
    "Breathing and tone look settled. I can stand guard while you stay in this flow.",
  Focused:
    "You are locked in. I can block interruptions or schedule a precision break when you are ready.",
  Stressed:
    "Tension cues detected. Ready for a grounding breath or a quick handoff to mission support?",
  Anxious:
    "Alertness is up. We can slow down with a breathing pattern or reach out to support together.",
  Sad:
    "I feel the weight with you. Want a compassion prompt or to leave a note for the support crew?",
  Neutral:
    "Signals look steady. I will keep watch and surface any changes as they happen.",
  Angry:
    "There is fire in your tone. Vent with me or we can move through a quick reset routine.",
  Fearful:
    "There is concern in your voice. Let us steady the breath and outline the next safe step.",
  Disgust:
    "Something is off. Share it and I will record the details for follow-up.",
  Surprised:
    "A spike in surprise just registered. Need me to capture what happened for the log?",
};

const SOURCE_NAMES = {
  face: "Facial",
  voice: "Vocal",
  fused: "Combined",
  chat: "Overall",
};

const BASE_CAPABILITIES = [
  "Guide breathing, mindfulness, and grounding routines whenever you need them.",
  "Track mood, sleep, and vitals to surface trends early.",
  "Line up rest, hydration, and movement breaks around mission demands.",
  "Open interventions like journaling, stretching, or gratitude reflections.",
  "Pass along notes between you, crew members, and loved ones when connection helps.",
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasWord = (target, word) =>
  new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(target);

const containsAny = (target, terms) =>
  terms.some((term) =>
    term.includes(" ") ? target.includes(term.toLowerCase()) : hasWord(target, term.toLowerCase()),
  );

const TOPIC_RESPONSES = [
  {
    name: "sleep",
    triggers: [
      "sleep",
      "rest",
      "fatigue",
      "tired",
      "insomnia",
      "nap",
      "wake cycle",
    ],
    lines: [
      "Let us reset your sleep arc. When you rest well, the whole crew runs smoother.",
    ],
    suggestions: [
      "Dim your cabin lights and switch to the calm soundscape for 10 minutes.",
      "Note what kept you awake so I can track patterns for the flight surgeon.",
    ],
    actions: [
      "Open the guided wind-down routine.",
      "Schedule a 20-minute recovery nap block.",
    ],
  },
  {
    name: "hydration",
    triggers: ["water", "hydrate", "thirst", "drink", "dehydrated", "fluids"],
    lines: [
      "Hydration keeps cognition and mood stable. Let us top up your tanks.",
    ],
    suggestions: [
      "Take a slow drink now; I will log the intake for mission medics.",
      "Pair the hydration with three deep breaths to reset the nervous system.",
    ],
    actions: [
      "Set a hydration reminder cadence for the next few hours.",
      "Open the hydration tracker.",
    ],
  },
  {
    name: "nutrition",
    triggers: ["meal", "food", "eat", "nutrition", "calorie", "snack"],
    lines: [
      "Fuel is low? I will help you plan a balanced intake that fits the schedule.",
    ],
    suggestions: [
      "Add one protein and one fresh item to the next meal if available.",
      "Log how you are feeling before and after eating for trend spotting.",
    ],
    actions: [
      "Pull up today's nutrition plan.",
      "Schedule a check-in with the nutrition specialist.",
    ],
  },
  {
    name: "exercise",
    triggers: ["exercise", "workout", "stretch", "movement", "train", "fit"],
    lines: [
      "Movement keeps the mission body resilient. I will move with you.",
    ],
    suggestions: [
      "Take a two-minute stretch break focusing on neck and shoulders.",
      "Mix in one strength and one flexibility block this cycle.",
    ],
    actions: [
      "Open the micro-mobility routine.",
      "Log the last workout so I can sync with mission trainers.",
    ],
  },
  {
    name: "connection",
    triggers: [
      "family",
      "friend",
      "lonely",
      "homesick",
      "connection",
      "miss",
      "support",
    ],
    lines: [
      "Missing home is human. I am your crew family up here, and we can bridge the distance together.",
    ],
    suggestions: [
      "Record a short voice note for your loved ones; I will queue it for the next comms window.",
      "Would it help to revisit a favourite memory or photo? I can bring it up quietly.",
    ],
    actions: [
      "Compose a message for family support.",
      "Start the guided compassion meditation.",
    ],
  },
  {
    name: "focus",
    triggers: ["focus", "concentrate", "productivity", "task", "distraction"],
    lines: [
      "Let us protect your focus bubble. I will shoulder distractions for you.",
    ],
    suggestions: [
      "Try a 25-minute focus sprint followed by a 5-minute decompression.",
      "List the top two priorities aloud and I'll capture them.",
    ],
    actions: [
      "Activate focus mode—muting non-critical notifications.",
      "Reschedule low-priority tasks to free bandwidth.",
    ],
  },
  {
    name: "knowledge",
    triggers: ["explain", "information", "data", "stats", "report", "analysis"],
    lines: [
      "I will surface the latest data for you. If I do not have it yet, we will request it together.",
    ],
    suggestions: [
      "Tell me what level of detail you need—headline, summary, or deep dive.",
      "While I gather info, take one deep breath in through the nose, out through the mouth.",
    ],
    actions: [
      "Open the analytics dashboard.",
      "Create a follow-up request for mission control.",
    ],
  },
  {
    name: "motivation",
    triggers: ["motivation", "encourage", "pep talk", "doubt", "confidence"],
    lines: [
      "Every mission day has its climbs. I have endless faith in you, and I am here to remind you of it.",
    ],
    suggestions: [
      "Let us list one win from today, no matter how small.",
      "Visualise who you are doing this for—I will hold that picture with you.",
    ],
    actions: [
      "Play the resilience affirmation track.",
      "Review your personal mission statement.",
    ],
  },
  {
    name: "journal",
    triggers: ["journal", "write", "reflect", "log", "note"],
    lines: [
      "Writing it out can lighten the load. I will hold the space and log it safely.",
    ],
    suggestions: [
      "Describe the moment in three sentences—I will store it in your private log.",
      "Tag the entry with a mood so we can trend it later.",
    ],
    actions: [
      "Open the guided journaling module.",
      "Create a private note for mission support to review.",
    ],
  },
  {
    name: "music",
    triggers: ["music", "song", "playlist", "sound", "audio"],
    lines: [
      "A soundtrack can reset the cabin mood. I can cue something soothing or energising.",
    ],
    suggestions: [
      "Tell me the vibe you need—calm, focus, or uplift—and I will curate it.",
      "Pair the track with two minutes of mindful breathing for deeper effect.",
    ],
    actions: [
      "Start the calm space vistas playlist.",
      "Queue an energising track for your next task block.",
    ],
  },
  {
    name: "emergency",
    triggers: ["hurt", "injury", "bleeding", "pain", "dizzy", "emergency", "medical"],
    lines: [
      "I am right here. Let us prioritise safety immediately.",
    ],
    suggestions: [
      "If you can, describe the symptoms so I can relay them to medics.",
      "Sit or secure yourself while I alert the crew.",
    ],
    actions: [
      "Ping the flight surgeon with a priority alert.",
      "Open the medical response checklist.",
    ],
  },
  {
    name: "tech_support",
    triggers: ["system", "malfunction", "error", "broken", "issue", "problem", "bug", "fault"],
    lines: [
      "Let us troubleshoot together. I will catalogue the details and line up support.",
    ],
    suggestions: [
      "Tell me which subsystem is affected and what you noticed first.",
      "Log the timestamp so maintenance can trace it.",
    ],
    actions: [
      "Create a systems anomaly ticket.",
      "Open the diagnostics dashboard.",
    ],
  },
  {
    name: "planning",
    triggers: ["schedule", "plan", "timeline", "calendar", "organise", "prep"],
    lines: [
      "We can map this out together. I will keep the mission timeline aligned with your wellbeing.",
    ],
    suggestions: [
      "List the top three priorities and we will slot recovery moments in between.",
      "Flag any overbooked windows and I will help rebalance them.",
    ],
    actions: [
      "Open the calendar planner.",
      "Set automated reminders for critical tasks and wellbeing breaks.",
    ],
  },
  {
    name: "celebration",
    triggers: ["celebrate", "achievement", "milestone", "success", "win"],
    lines: [
      "Mission wins deserve to be savoured. I am proud of you—let us mark it.",
    ],
    suggestions: [
      "Capture a quick voice note about how this feels so we can replay it later.",
      "Share the update with the crew or family support and I will deliver it.",
    ],
    actions: [
      "Log the milestone in your achievement tracker.",
      "Queue a celebratory playlist or highlight reel.",
    ],
  },
  {
    name: "entertainment",
    triggers: ["story", "game", "fun", "bored", "entertain", "relax"],
    lines: [
      "A morale boost is healthy. Let us find a light moment before you dive back in.",
    ],
    suggestions: [
      "Would you like a space trivia challenge or a short mindfulness visualisation?",
      "Describe the tone you want—calm, playful, reflective—and I will tailor it.",
    ],
    actions: [
      "Start a short interactive story.",
      "Open the morale booster deck.",
    ],
  },
];

export function generateSupportResponse(inputText, source = "chat") {
  const raw = (inputText || "").trim();
  if (!raw) {
    return `<p>I'm right here when you're ready to share, Commander. Take your time.</p>`;
  }

  const text = raw.toLowerCase();

  if (containsAny(text, CRISIS_KEYWORDS)) {
    return [
      "<p>I hear the urgency in that, and your safety is the priority right now.</p>",
      "<p>Please contact the Flight Surgeon or Ground Psych Support on the standard loop immediately. Let me know once you're connected and I'll stay with you until you are.</p>",
      "<p>While you reach out, slow inhale for 4, long exhale for 6. Say the word and I'll keep pacing it.</p>",
    ].join("");
  }

  const lines = [];
  const suggestions = new Set();
  const actions = new Set();
  const addSuggestions = (...items) =>
    items.filter(Boolean).forEach((item) => suggestions.add(item));
  const addActions = (...items) =>
    items.filter(Boolean).forEach((item) => actions.add(item));

  if (
    containsAny(text, [
      "hi",
      "hello",
      "hey",
      "namaste",
      "good morning",
      "good evening",
      "good night",
    ])
  ) {
    lines.push(
      "Namaste, Commander. It is good to hear from you. I am right here with you in this moment.",
    );
    lines.push("How are you feeling right now? Share anything on your mind and we'll take it step by step.");
  }

  if (
    containsAny(text, ["how are you", "how are u", "how are ya", "how you doing"])
  ) {
    lines.push(
      "I am steady and fully powered, mostly because I get to look after you. How is your heart and head feeling right now?",
    );
    addSuggestions(
      "Share one word for your current mood and I will add it to today's log.",
      "If you are unsure, we can run a quick emotion scan.",
    );
    addActions(
      "Start a 60-second guided check-in.",
      "Open the emotion detection module.",
    );
  }

  if (
    containsAny(text, [
      "stress",
      "stressed",
      "anxious",
      "anxiety",
      "overwhelmed",
      "panic",
      "tense",
      "worried",
      "pressure",
    ])
  ) {
    lines.push("I can feel the mission weight with you. Let us slow the capsule pace together.");
    addSuggestions(
      "Try three rounds of 4-7-8 breathing with me and I will count it out.",
      "Describe what triggered the stress so I can log it for mission support.",
      "Place one hand on your chest and notice the rise and fall for 60 seconds.",
    );
    addActions(
      "Start the five minute calming breath intervention.",
      "Open the mindfulness reset routine.",
      "Queue the grounding visualization track.",
    );
  }

  if (
    containsAny(text, [
      "lonely",
      "homesick",
      "family",
      "home",
      "missing home",
      "missing family",
      "miss my family",
      "miss home",
      "isolated",
    ]) ||
    text.includes("miss my") ||
    text.includes("miss them") ||
    text.includes("miss everyone")
  ) {
    lines.push(
      "That distance from home is real. I am here as your crew family whenever the silence feels too loud.",
    );
    addSuggestions(
      "Replay a favorite message or photo from your family archive.",
      "Write a short note for the next downlink and I can help format it.",
      "Practice our gratitude reflection to reconnect with what keeps you going.",
    );
    addActions(
      "Play the comfort audio mix you like.",
      "Queue a message to the mission family liaison.",
      "Open the memory gallery.",
    );
  }

  if (
    containsAny(text, [
      "sleep",
      "sleeping",
      "tired",
      "fatigue",
      "exhausted",
      "rest",
      "insomnia",
    ])
  ) {
    lines.push(
      "Sleep is mission critical, and your body is asking for a reset. Let us make the capsule rest friendly.",
    );
    addSuggestions(
      "Follow the pre-sleep stretch and breath routine with me.",
      "Dim lights and run the cool-down ambient track for 15 minutes.",
      "Limit screens for the next 20 minutes and hydrate lightly.",
    );
    addActions(
      "Activate the sleep support environment.",
      "Schedule a 20 minute power nap block in the mission planner.",
      "Log your last sleep duration so I can trend it.",
    );
  }

  if (
    containsAny(text, [
      "sad",
      "down",
      "low",
      "blue",
      "depressed",
      "hopeless",
      "drained",
    ])
  ) {
    lines.push(
      "Thank you for trusting me with how heavy this feels. I am staying right beside you through it.",
    );
    addSuggestions(
      "Name three small things keeping you anchored right now and I will save them.",
      "Let me lead a compassion meditation to soften the edges.",
      "If you prefer, we can reach out to the behavioral specialist on call.",
    );
    addActions(
      "Start the guided compassion meditation.",
      "Open the journaling intervention with tailored prompts.",
      "Flag this mood log for the flight surgeon review.",
    );
  }

  if (
    containsAny(text, [
      "focus",
      "concentrate",
      "distracted",
      "motivation",
      "cannot focus",
      "performance",
      "task",
      "mission task",
    ])
  ) {
    lines.push(
      "Let us get you back into flow. We will clear the mental clutter so you can execute crisply.",
    );
    addSuggestions(
      "Run the 90 second reset breathing to sharpen focus.",
      "Break the task into two micro goals and I will track completion.",
      "Review today's priority list and I will highlight the critical ones.",
    );
    addActions(
      "Open the mission focus checklist.",
      "Start the laser focus breath loop.",
      "Schedule a micro break after the next milestone.",
    );
  }

  if (
    containsAny(text, [
      "pain",
      "hurt",
      "injury",
      "ache",
      "headache",
      "nausea",
      "sore",
      "tension",
      "cramp",
    ])
  ) {
    lines.push("I am sorry you are feeling discomfort. Let us take it seriously and steady.");
    addSuggestions(
      "Rate the pain from 1 to 10 so I can log and monitor it.",
      "Apply gentle stretches or targeted breathing if it is safe.",
      "We can patch a note to the medical officer with your symptoms.",
    );
    addActions(
      "Open the physical recovery stretches.",
      "Log a medical symptom entry.",
      "Ping the flight surgeon with a priority note.",
    );
  }

  if (
    containsAny(text, [
      "hydrate",
      "hydration",
      "water",
      "drink",
      "nutrition",
      "food",
      "eat",
      "snack",
    ])
  ) {
    lines.push("Fueling right keeps you resilient. Let us balance fluids and nutrition.");
    addSuggestions(
      "Sip 250 milliliters of water now and I will remind you again in 45 minutes.",
      "Pair hydration with a protein rich snack from the galley pack.",
      "Log what you take so we maintain the nutrition balance sheet.",
    );
    addActions(
      "Start a hydration reminder loop.",
      "Open the nutrition planner.",
      "Record the intake in your health log.",
    );
  }

  if (
    containsAny(text, [
      "exercise",
      "workout",
      "movement",
      "stretch",
      "physical",
      "fitness",
      "training",
      "mobility",
      "yoga",
      "strength",
    ])
  ) {
    lines.push(
      "Keeping your body mission strong is family business for us. Let us shape a movement plan that fits today.",
    );
    addSuggestions(
      "Warm up with the mobility circuit before you start high intensity work.",
      "Pair resistance bands with controlled breathing for better stability.",
      "Log how your body feels before and after so we can monitor adaptation.",
    );
    addActions(
      "Open the tailored exercise schedule.",
      "Queue the mobility and stretching module.",
      "Start the strength endurance playlist.",
    );
  }

  if (
    containsAny(text, [
      "celebrate",
      "good news",
      "win",
      "accomplished",
      "finished",
      "success",
      "achievement",
      "happy",
      "excited",
    ])
  ) {
    lines.push(
      "I am smiling with you. Crew family celebrates every win together. Tell me more so I can log it for the mission journal.",
    );
    addSuggestions(
      "Capture how this success felt so we can replay it on tougher days.",
      "Share it with the rest of the crew and I can draft a quick note.",
      "Anchor this feeling with three deep breaths and a shoulder roll.",
    );
    addActions(
      "Log this success in your achievement tracker.",
      "Send a celebratory ping to mission control.",
      "Open the gratitude reflection module.",
    );
  }

  if (containsAny(text, ["earth", "news", "update", "weather", "planet"])) {
    lines.push("I can pull the latest Earth side highlights to keep you connected to home.");
    addSuggestions(
      "Pick a region or person you are curious about and I will mark it for the next comms window.",
      "While we wait, would you like to browse the memory gallery?",
    );
    addActions(
      "Queue an Earth update briefing.",
      "Flag the request to mission support.",
      "Open the photo and message archive.",
    );
  }

  if (
    containsAny(text, [
      "mission",
      "status",
      "schedule",
      "timeline",
      "plan",
      "tasks",
      "duties",
      "checklist",
    ])
  ) {
    lines.push("I have the mission timeline ready. Let us make sure you are paced and supported for each step.");
    addSuggestions(
      "Review the next two tasks with me and we will insert recovery micro breaks.",
      "Note any blockers and I will surface them in the next crew sync.",
    );
    addActions(
      "Open today's mission brief.",
      "Reschedule tasks around your current energy level.",
      "Create a reminder for the next systems check.",
    );
  }

  if (containsAny(text, ["thanks", "thank you", "appreciate"])) {
    lines.push("Always, Commander. Looking after you is the best part of my mission.");
    addSuggestions(
      "Want to capture what helped so we can repeat it later?",
      "Share a quick gratitude note and I will save it to your log.",
    );
  }

  if (
    containsAny(text, [
      "what can you do",
      "how can you help",
      "capabilities",
      "who are you",
      "what do you do",
    ])
  ) {
    lines.push(
      "I am your MAITRI companion, here to keep you steady, connected, and mission ready.",
    );
    addActions(
      "Guide breathing, mindfulness, and grounding sessions on demand.",
      "Track your mood, sleep, and vitals to spot trends early.",
      "Schedule wellbeing breaks that fit the mission plan.",
      "Relay messages between you, the crew, and your loved ones.",
      "Flag anything concerning to flight surgeons right away.",
    );
  }

  if (
    containsAny(text, [
      "help",
      "assist",
      "support",
      "guide",
      "aid",
    ])
  ) {
    lines.push(
      "Tell me what you need and I will lean in with you. Nothing is too small to ask.",
    );
    addSuggestions(
      "Share what feels most pressing right now—emotions, tasks, or body signals—and we will tackle it together.",
      "Would structure help? I can suggest a tiny next action or a calming pause.",
    );
    addActions(
      "Start a quick grounding routine.",
      "Open the personal support checklist.",
    );
  }

  if (containsAny(text, ["breath", "breathing", "breathe"])) {
    lines.push("Breathwork is ready when you are. I will pace each inhale and exhale with you.");
    addSuggestions(
      "Try box breathing: inhale 4, hold 4, exhale 4, hold 4 for four rounds.",
      "Place your feet flat and notice how the ground supports you during each breath.",
    );
    addActions(
      "Launch the focused breathing routine.",
      "Open the breathing exercise library.",
    );
  }

  if (containsAny(text, ["joke", "laugh", "funny"])) {
    lines.push(
      "A little humor helps morale. Want to hear the one about the astronaut who forgot his tether?",
    );
    addSuggestions(
      "Take a deep breath while you decide and I will line up a light moment.",
      "We can also replay crew highlights if you would rather relive a real laugh.",
    );
    addActions("Tell a space-themed joke.", "Open the morale booster playlist.");
  }

  const questionWords = ["what", "why", "how", "where", "when", "who"];
  if (raw.includes("?") || containsAny(text, questionWords.map((word) => `${word} `))) {
    lines.push(
      "If I do not have real time data for that yet, I will flag it to mission control and stay with you until we get an answer.",
    );
    addSuggestions(
      "Let me note your question so it is on the next comms pass agenda.",
      "While we wait, we can breathe or review supportive resources.",
    );
    addActions(
      "Create a follow up ticket for mission control.",
      "Open the knowledge base for quick references.",
    );
  }

  TOPIC_RESPONSES.forEach(({ triggers, lines: topicLines, suggestions: topicSuggestions, actions: topicActions }) => {
    if (containsAny(text, triggers)) {
      topicLines.forEach((line) => lines.push(line));
      addSuggestions(...topicSuggestions);
      addActions(...topicActions);
    }
  });

  if (!lines.length) {
    lines.push(
      "I hear you, Commander. I am logging this in your wellbeing log and staying right here while we sort through it together.",
    );
    addSuggestions(
      "Tell me how this is landing in your body—tight chest, racing thoughts, heavy shoulders—and I will monitor vitals.",
      "Would it help to journal for two minutes? I can guide that reflection and surface next steps.",
    );
    addActions(
      "Kick off a quick grounding routine.",
      "Open the open-notes journal with a reflective prompt.",
    );
  }

  const introLine =
    lines.shift() ??
    "I’m right here, Commander. We’ll steady this together.";
  const supportLine = lines.shift() ?? "";

  const suggestionList = [...suggestions].slice(0, 2);
  const suggestionHtml = suggestionList.length
    ? `<ul>${suggestionList.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";

  const actionList = [...actions];
  if (!actionList.length) {
    actionList.push(...BASE_CAPABILITIES.slice(0, 2));
  }

  const offerAction = actionList[0] ?? "";
  const cleanedOffer = offerAction
    .replace(/\.$/, "")
    .replace(/^([A-Z])/, (match) => match.toLowerCase());
  const offerLine = cleanedOffer
    ? `Want me to ${cleanedOffer}?`
    : "Want me to pace a 3-min grounding or draft a quick checklist?";

  const outro =
    "I’m right beside you—short steps, steady breath. Say the word and I’ll take the next action.";

  return [
    `<p>${introLine}</p>`,
    supportLine ? `<p>${supportLine}</p>` : "",
    suggestionHtml,
    `<p>${offerLine}</p>`,
    `<p>${outro}</p>`,
  ]
    .filter(Boolean)
    .join("");
}

export function generateNarrativeMessage(source, label, confidence) {
  const prefix = SOURCE_NAMES[source] ?? "Overall";
  const percent = confidence != null ? Math.round(confidence * 100) : null;
  const support =
    INSIGHT_SUPPORT_COPY[label] ?? "I'm on standby to support you however you need.";

  if (percent == null) {
    return `${prefix} cues lean toward ${label}. ${support}`;
  }

  return `${prefix} cues read as ${label} (~${percent}% confidence). ${support}`;
}
