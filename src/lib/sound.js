const STORAGE_KEY = "bmo-muted";

let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem(STORAGE_KEY) === "1";
} catch {}

export const isMuted = () => muted;

export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {}
}

function tone(freq, duration, { type = "square", volume = 0.05, delay = 0, slideTo } = {}) {
  if (muted) return;
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  tick: () => tone(880, 0.04, { type: "triangle", volume: 0.03 }),
  slide: () => tone(260, 0.22, { type: "sawtooth", volume: 0.025, slideTo: 140 }),
  latch: () => {
    tone(150, 0.05, { volume: 0.08 });
    tone(90, 0.09, { type: "triangle", volume: 0.09, delay: 0.03 });
  },
  release: () => {
    tone(120, 0.05, { volume: 0.07 });
    tone(420, 0.12, { type: "triangle", volume: 0.05, delay: 0.04, slideTo: 700 });
  },
  boot: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, { delay: i * 0.08, volume: 0.04 })),
  zoom: () => tone(180, 0.7, { type: "sine", volume: 0.05, slideTo: 720 }),
  screenOn: () => tone(1400, 0.08, { type: "triangle", volume: 0.03 }),
  grumble: () => tone(130, 0.3, { type: "sawtooth", volume: 0.05, slideTo: 70 }),
  screenOff:() => tone(600, 0.15, { type: "sine", volume: 0.04, slideTo: 120 }),
  boop: () => tone(300, 0.15, { type: "sine", slideTo: 600, volume: 0.08 }),
};
