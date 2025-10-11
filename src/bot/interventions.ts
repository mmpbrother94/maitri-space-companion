export function suggestionFor(state: string) {
  // Short, situation-based suggestions (astronaut context)
  if (state.startsWith("neg:") || state.startsWith("mixed:")) {
    return [
      "Let's do a 60-second box-breathing: inhale 4, hold 4, exhale 4, hold 4. I'll count with you.",
      "Neck/shoulder micro-stretch: slow roll 3x each side; then scapular squeeze for 10 seconds.",
      "If a task feels crowded, we can chunk the next 10 minutes into one micro-goal. Want me to set that up?",
    ];
  }
  if (state.startsWith("pos:")) {
    return [
      "You're steady - that's great. We can bank this momentum: one focus block of 10 minutes?",
      "Before the next task, a quick hydration and posture reset helps maintain alertness.",
    ];
  }
  return [
    "How's your body right now - tension in jaw/shoulders? We can do a 30-sec release.",
    "Would a 2-minute visual reset help? I can trigger the Starlight scene with slow breath pacing.",
  ];
}

export function escalationCopy() {
  return "I'm detecting persistent distress. I'll summarize and flag Mission Support while staying with you. You can pause this at any time.";
}
