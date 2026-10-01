export type Preset = { id: string; name: string; desc: string; from: string; to: string; extra: number; model: string; keys: string[] };
export const PRESETS: Preset[] = [
  { id: "dolly-in", name: "Dolly in", desc: "Push toward subject", from: "scale(1)", to: "scale(1.35)", extra: 0, model: "slow dolly push-in toward the subject", keys: ["face", "portrait", "close", "person"] },
  { id: "dolly-out", name: "Dolly out", desc: "Reveal the scene", from: "scale(1.35)", to: "scale(1)", extra: 0, model: "smooth dolly pull-back revealing the wider scene", keys: ["landscape", "city", "wide", "reveal"] },
  { id: "pan-l", name: "Pan left", desc: "Slide across", from: "scale(1.25) translateX(6%)", to: "scale(1.25) translateX(-6%)", extra: 0, model: "steady camera pan to the left", keys: ["street", "skyline"] },
  { id: "pan-r", name: "Pan right", desc: "Slide across", from: "scale(1.25) translateX(-6%)", to: "scale(1.25) translateX(6%)", extra: 0, model: "steady camera pan to the right", keys: ["walk", "follow"] },
  { id: "crane", name: "Crane up", desc: "Rise and tilt", from: "scale(1.3) translateY(7%)", to: "scale(1.3) translateY(-7%)", extra: 0, model: "crane shot rising upward while tilting up", keys: ["tower", "tree", "mountain", "building"] },
  { id: "orbit", name: "Orbit", desc: "Arc around", from: "scale(1.3) rotate(-3deg) translateX(4%)", to: "scale(1.3) rotate(3deg) translateX(-4%)", extra: 1, model: "camera orbits around the subject in a smooth arc", keys: ["product", "car", "statue", "hero"] },
  { id: "whip", name: "Whip zoom", desc: "Fast punch-in", from: "scale(1)", to: "scale(1.8)", extra: 1, model: "fast aggressive zoom-in punch", keys: ["action", "jump", "fast"] },
];
export const cost = (dur: number, p: Preset) => (dur === 5 ? 2 : 4) + p.extra;
