import { fuse, type EmotionSnapshot } from "./triage";
import { escalationCopy, suggestionFor } from "./interventions";

export type Turn = { role: "system" | "user" | "assistant"; text: string };

export function planResponse(
  snapshot: EmotionSnapshot,
  lastUser: string | null
): Turn[] {
  const { state, risk } = fuse(snapshot);

  if (risk === "red") {
    return [
      {
        role: "assistant",
        text: "I'm here. Your signal suggests heightened stress.",
      },
      { role: "assistant", text: escalationCopy() },
      { role: "assistant", text: suggestionFor(state)[0] },
    ];
  }

  // amber/green: one concise line + 1-2 options
  const options = suggestionFor(state);
  const opener = state.startsWith("pos:")
    ? "You're in a good zone; let's keep it balanced."
    : state.startsWith("mixed:")
    ? "I'm picking up mixed signals - let's steady your baseline."
    : "Let's stabilize your baseline so the next task feels lighter.";

  return [
    { role: "assistant", text: opener },
    { role: "assistant", text: options[0] },
    { role: "assistant", text: options[1] ?? "" },
  ].filter((t) => t.text);
}
