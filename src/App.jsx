import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Bmo, { SCREEN, SLOT, SLOT_ANGLE, SLOT_MID, TRAY, TRAY_DEPTH, VIEWBOX } from "./components/Bmo";
import Cartridge from "./components/Cartridge";
import DialogBox from "./components/DialogBox";
import ProjectScreen from "./components/ProjectScreen";
import StartScreen from "./components/StartScreen";
import { PROJECTS, CARD_POSITIONS } from "./data/projects";
import { sfx, isMuted, setMuted } from "./lib/sound";
import "./App.css";

const ZOOM_MS = 900;
const SCREEN_OFF_MS = 260;
const SLEEP_AFTER_MS = 10000;
const ANNOYED_CLICKS = 5;
const ANNOYED_WINDOW_MS = 3000;
const ANNOYED_FOR_MS = 4000;
const TOTAL = PROJECTS.length;

const BMO_LINES = [
  "Hehe! Gıdıklanıyorum!",
  "Bir kartuş seç, birlikte oynayalım!",
  "Ben BMO! Kamera, oyun konsolu ve portfolyoyum.",
  "Ulaş beni çok seviyor. Sanırım.",
];

const HINTS = {
  idle: "← → seç · Enter tak · E çıkar",
  open: "← → önceki / sonraki proje · E çıkar",
  busy: "Atlamak için dokun ya da Enter'a bas",
};

const wrap = (i) => (i + TOTAL) % TOTAL;
const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isNarrow = () => matchMedia("(max-width: 760px)").matches;

// BMO'nun ekranı, yakınlaşma yokmuş gibi sayfa pikselinde; yeniden boyutlamada da çalışır
function measureScreen(svg, zoom) {
  const rect = svg.getBoundingClientRect();
  const s = zoom?.scale ?? 1;
  const left = zoom ? (rect.left - zoom.x) / s : rect.left;
  const top = zoom ? (rect.top - zoom.y) / s : rect.top;
  const unit = rect.width / s / VIEWBOX.width;
  const inset = SCREEN.stroke / 2;

  return {
    x: left + (SCREEN.x - VIEWBOX.x + inset) * unit,
    y: top + (SCREEN.y - VIEWBOX.y + inset) * unit,
    width: (SCREEN.width - inset * 2) * unit,
    height: (SCREEN.height - inset * 2) * unit,
    rise: SCREEN.rise * unit,
    radius: (SCREEN.radius - inset) * unit,
  };
}

// Uçan kartuş kopyasının başlangıç ve bitiş konumu; bitiş BMO'nun kendi çizimiyle
// birebir aynı olduğu için kopyadan çizime geçiş fark edilmez
function trayHandoff(svg, card) {
  const box = svg.getBoundingClientRect();
  const unit = box.width / VIEWBOX.width;
  const cos = Math.cos(SLOT_ANGLE);
  const sin = Math.sin(SLOT_ANGLE);
  const x = box.left + (SLOT_MID.x - sin * TRAY.hover - VIEWBOX.x) * unit;
  const y = box.top + (SLOT_MID.y + cos * TRAY.hover - VIEWBOX.y) * unit;

  const scale = (SLOT.width * SLOT.fit * unit) / card.width;
  // Yatırdıkça yükseklik kısalır; geriye tam TRAY.face kalacak açıyı bul
  const tilt = Math.acos(Math.min(1, (TRAY.face * unit) / (card.height * scale)));

  const pose = (dx, dy, rad, tiltRad, s) =>
    `translate(${dx}px, ${dy}px) rotate(${rad}rad) rotateX(${tiltRad}rad) scale(${s})`;

  return {
    start: pose(0, 0, 0, 0, 1),
    end: pose(x - (card.left + card.width / 2), y - card.top, SLOT_ANGLE, tilt, scale),
  };
}

function zoomOnto(screen) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min((vw * 0.9) / screen.width, (vh * 0.68) / (screen.height + screen.rise));
  const centerX = screen.x + screen.width / 2;
  const centerY = screen.y + (screen.height - screen.rise) / 2;
  const x = vw / 2 - scale * centerX;
  const y = vh * 0.44 - scale * centerY;

  return {
    scale,
    x,
    y,
    frame: {
      left: x + scale * screen.x,
      top: y + scale * screen.y,
      width: scale * screen.width,
      height: scale * screen.height,
      radius: scale * screen.radius,
      skew: Math.atan2(-screen.rise, screen.width),
    },
  };
}

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | inserting | open | closing
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [mood, setMood] = useState("sleepy");
  const [intro, setIntro] = useState("waiting"); // waiting | leaving | done
  const [bouncing, setBouncing] = useState(false);
  const [seated, setSeated] = useState(false);
  const [tray, setTray] = useState(null);
  const [fast, setFast] = useState(false);
  const [stripEdges, setStripEdges] = useState({ left: false, right: false });
  const [muted, setMutedState] = useState(isMuted());
  const [message, setMessage] = useState("Selam! Ben BMO. Ulaş'ın projeleri bu kartuşlarda. Birini seç, bana tak!");

  const cardRefs = useRef([]);
  const svgRef = useRef(null);
  const trayRef = useRef(null);
  const lineIndex = useRef(0);
  const recentTalks = useRef([]);
  const lastActivity = useRef(Date.now());
  const sleeping = useRef(false);
  const annoyedUntil = useRef(0);
  const started = useRef(false);
  const stripRef = useRef(null);
  const skipRef = useRef(false);
  const motionStart = useRef(0);
  const activeAnims = useRef(new Set());
  const sleepers = useRef(new Set());

  // delay sonra mutlu yüze dön; BMO meşgulse, uyuyorsa ya da sinirliyse dokunma
  const settleMood = (delay) =>
    setTimeout(() => {
      if (phaseRef.current === "idle" && !sleeping.current && Date.now() >= annoyedUntil.current) setMood("happy");
    }, delay);
  // Asenkron akışlar eski değeri görmesin diye state'in ref kopyaları
  const phaseRef = useRef("idle");
  const activeRef = useRef(null);
  const zoomRef = useRef(null);

  const goTo = (next) => {
    phaseRef.current = next;
    motionStart.current = Date.now();
    setPhase(next);
  };

  // wait gibi bekler, ama atlama istenirse hemen biter
  const pause = (n) =>
    new Promise((resolve) => {
      if (skipRef.current) return resolve();
      const done = () => {
        clearTimeout(timer);
        sleepers.current.delete(done);
        resolve();
      };
      const timer = setTimeout(done, n);
      sleepers.current.add(done);
    });

  // Atlanırken sesler üst üste binmesin
  const cue = (name) => {
    if (!skipRef.current) sfx[name]();
  };

  // Takma ya da çıkarma sürerken tıklayınca ya da Enter'a basınca kalan adımlar hemen biter
  function skipMotion() {
    const busy = phaseRef.current === "inserting" || phaseRef.current === "closing";
    if (!busy || skipRef.current || Date.now() - motionStart.current < 300) return;
    skipRef.current = true;
    flushSync(() => setFast(true));
    activeAnims.current.forEach((animation) => animation.finish());
    sleepers.current.forEach((done) => done());
  }

  function endMotion() {
    skipRef.current = false;
    setFast(false);
  }

  function start() {
    if (started.current) return;
    started.current = true;
    lastActivity.current = Date.now();
    setIntro("leaving");
    sfx.boot();
    setMood("surprised");
    settleMood(900);
    setTimeout(() => {
      setIntro("done");
      cardRefs.current[selected]?.focus({ preventScroll: true });
    }, 500);
  }

  function select(i) {
    if (i === selected) return;
    setSelected(i);
    if (phaseRef.current === "idle") {
      sfx.tick();
      setMessage(`${PROJECTS[i].title}. Takmak için Enter'a bas ya da tıkla!`);
    }
  }

  function moveSelection(step) {
    const next = wrap(selected + step);
    select(next);
    const card = cardRefs.current[next];
    card?.focus({ preventScroll: true });
    if (isNarrow()) card?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  }

  function jolt() {
    if (prefersReducedMotion() || skipRef.current) return;
    svgRef.current?.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(1.2%)" }, { transform: "translateY(0)" }],
      { duration: 180, easing: "ease-out" }
    );
  }

  // Takma: kartuşun kopyası yuvaya uçar, sonra BMO'nun çizimi onu içeri iter.
  // Çıkarma aynı adımların tersi, yay itmesiyle
  async function moveCartridge(i, direction) {
    const shell = cardRefs.current[i].querySelector(".cartridge-shell");
    const rect = shell.getBoundingClientRect();
    const { start, end } = trayHandoff(svgRef.current, rect);
    const ms = (n) => (prefersReducedMotion() || skipRef.current ? 1 : n);
    const track = (animation) => {
      activeAnims.current.add(animation);
      return animation.finished.finally(() => activeAnims.current.delete(animation));
    };

    const makeGhost = (transform) => {
      const ghost = shell.cloneNode(true);
      ghost.classList.add("cartridge-ghost");
      Object.assign(ghost.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        transform,
      });
      document.body.append(ghost);
      return ghost;
    };
    const fly = (ghost, from, to) =>
      track(
        ghost.animate([{ transform: from }, { transform: to }], {
          duration: ms(560),
          easing: "cubic-bezier(.35, .7, .35, 1)",
          fill: "forwards",
        })
      );
    const slide = (from, to, duration, easing) =>
      track(
        trayRef.current.animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${to}px)` }], {
          duration: ms(duration),
          easing,
          fill: "forwards",
        })
      );

    if (direction === "in") {
      const ghost = makeGhost(start);
      await fly(ghost, start, end);
      // flushSync: BMO'nun çizimi kopyanın yerini aynı karede alsın
      flushSync(() => setTray({ project: PROJECTS[i], offset: TRAY.hover }));
      ghost.remove();

      cue("slide");
      await slide(TRAY.hover, 0, 150, "ease-out");
      await slide(0, -TRAY_DEPTH * 0.6, 240, "cubic-bezier(.4, 0, .6, 1)");
      await slide(-TRAY_DEPTH * 0.6, -TRAY_DEPTH, 110, "cubic-bezier(.6, 0, 1, 1)");
      cue("latch");
      jolt();
      setTray(null);
    } else {
      flushSync(() => setTray({ project: PROJECTS[i], offset: -TRAY_DEPTH }));
      cue("release");
      jolt();
      await slide(-TRAY_DEPTH, -TRAY_DEPTH * 0.45, 120, "cubic-bezier(0, 0, .2, 1)");
      await slide(-TRAY_DEPTH * 0.45, TRAY.hover, 260, "cubic-bezier(.2, .7, .3, 1)");
      await pause(140);

      const ghost = makeGhost(end);
      flushSync(() => setTray(null));
      await fly(ghost, end, start);
      ghost.remove();
    }
  }

  async function insert(i) {
    if (phaseRef.current === "open") return switchTo(i);
    if (phaseRef.current !== "idle") return;

    goTo("inserting");
    setSelected(i);
    activeRef.current = i;
    setActive(i);
    setMood("surprised");
    setMessage("Oooh! Yeni bir kartuş!");
    await moveCartridge(i, "in");
    setSeated(true);

    setMood("logo");
    cue("boot");
    setMessage(`${PROJECTS[i].label} yükleniyor...`);
    await pause(700);

    const target = zoomOnto(measureScreen(svgRef.current, null));
    zoomRef.current = target;
    setZoom(target);
    cue("zoom");
    await pause(prefersReducedMotion() ? 0 : ZOOM_MS);

    goTo("open");
    endMotion();
    sfx.screenOn();
    setMessage(`İşte ${PROJECTS[i].title}!`);
  }

  function switchTo(i) {
    if (phaseRef.current !== "open" || i === activeRef.current) return;
    activeRef.current = i;
    setActive(i);
    setSelected(i);
    sfx.screenOn();
    setMessage(`İşte ${PROJECTS[i].title}!`);
  }

  async function eject() {
    if (phaseRef.current !== "open") return;
    const i = activeRef.current;

    goTo("closing");
    sfx.screenOff();
    await pause(SCREEN_OFF_MS);

    zoomRef.current = null;
    setZoom(null);
    await pause(prefersReducedMotion() ? 0 : ZOOM_MS);

    setMood("surprised");
    setSeated(false);
    await moveCartridge(i, "out");

    activeRef.current = null;
    setActive(null);
    goTo("idle");
    endMotion();
    setMood("excited");
    setMessage("Geri yerine! Başka hangisine bakalım?");
    cardRefs.current[i]?.focus({ preventScroll: true });
    settleMood(600);
  }

  function talk() {
    if (phaseRef.current !== "idle") return;

    const now = Date.now();
    if (now < annoyedUntil.current) return;

    recentTalks.current = [...recentTalks.current.filter((t) => now - t < ANNOYED_WINDOW_MS), now];
    if (recentTalks.current.length >= ANNOYED_CLICKS) {
      recentTalks.current = [];
      annoyedUntil.current = now + ANNOYED_FOR_MS;
      sfx.grumble();
      setMood("annoyed");
      setMessage("Tamam tamam, yeter! Başım döndü.");
      settleMood(ANNOYED_FOR_MS);
      return;
    }

    sfx.boop();
    setBouncing(false);
    requestAnimationFrame(() => setBouncing(true));
    setMood("excited");
    setMessage(BMO_LINES[lineIndex.current++ % BMO_LINES.length]);
    settleMood(900);
  }

  function toggleSound() {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
    if (!next) sfx.tick();
    setMessage(next ? "Sesimi kıstın. Sessizce bakıyorum." : "Ses açıldı! Bip bop!");
  }

  const step = (dir) => {
    sfx.tick();
    if (phaseRef.current === "open") switchTo(wrap(activeRef.current + dir));
    else if (phaseRef.current === "idle") moveSelection(dir);
  };

  const controls = {
    left: () => step(-1),
    right: () => step(1),
    insert: () => insert(selected),
    eject: () => (phaseRef.current === "open" ? eject() : setMessage("İçimde kartuş yok ki!")),
    talk,
    help: () => {
      sfx.boop();
      setMessage("Sarı tuşla kartuş seç, kırmızıyla tak, yeşille çıkar. Çizgiler sesi açıp kapatır!");
    },
    toggleSound,
  };

  // Her render'da yeniden atanır; aşağıdaki tek dinleyici hep güncel state'i görür
  const keyHandler = useRef(null);
  keyHandler.current = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();

    if (!started.current) {
      if (key === "enter" || key === " ") {
        e.preventDefault();
        start();
      }
      return;
    }

    const motionBusy = phaseRef.current === "inserting" || phaseRef.current === "closing";
    if (motionBusy && (key === "enter" || key === " " || key === "escape" || key === "e")) {
      e.preventDefault();
      skipMotion();
      return;
    }

    if (key === "e" || key === "escape") {
      if (phaseRef.current === "open") {
        e.preventDefault();
        eject();
      }
    } else if (key === "arrowright" || key === "arrowdown") {
      e.preventDefault();
      step(1);
    } else if (key === "arrowleft" || key === "arrowup") {
      e.preventDefault();
      step(-1);
    } else if ((key === "enter" || key === " ") && phaseRef.current === "idle") {
      const focused = document.activeElement;
      if (focused === document.body || focused?.classList.contains("cartridge")) {
        e.preventDefault();
        insert(selected);
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => keyHandler.current(e);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    window.addEventListener("pointerdown", skipMotion);
    return () => window.removeEventListener("pointerdown", skipMotion);
  }, []);

  // Telefon şeridinde kenarlara solma ipucu: kaydırılacak kartuş varsa o kenar solar
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const update = () => {
      const left = strip.scrollLeft > 4;
      const right = strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 4;
      setStripEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    };
    update();
    strip.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      strip.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Herhangi bir girdi BMO'yu uyandırır; boşta kalınca uyur
  useEffect(() => {
    const onActivity = () => {
      lastActivity.current = Date.now();
      if (!sleeping.current) return;
      sleeping.current = false;
      setMood("surprised");
      setMessage("Ah! Uyanığım, uyanığım!");
      settleMood(900);
    };
    const events = ["pointerdown", "pointermove", "keydown"];
    events.forEach((name) => window.addEventListener(name, onActivity));

    const timer = setInterval(() => {
      const quiet = Date.now() - lastActivity.current > SLEEP_AFTER_MS;
      if (quiet && started.current && phaseRef.current === "idle" && !sleeping.current) {
        sleeping.current = true;
        setMood("sleepy");
        setMessage("Zzz... (dokunursan uyanırım)");
      }
    }, 1000);

    return () => {
      events.forEach((name) => window.removeEventListener(name, onActivity));
      clearInterval(timer);
    };
  }, []);

  const isZoomed = zoom !== null;
  // BMO seçili kartuşa bakar; telefonda kartuşlar altta sıralı olduğu için bakmaz
  const look = phase === "idle" && !isNarrow()
    ? Math.max(-1, Math.min(1, (CARD_POSITIONS[selected].x - 50) / 25))
    : 0;

  useEffect(() => {
    if (!isZoomed) return;
    const onResize = () => {
      const target = zoomOnto(measureScreen(svgRef.current, zoomRef.current));
      zoomRef.current = target;
      setZoom(target);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isZoomed]);

  const stageTransform = isZoomed
    ? `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`
    : "translate(0px, 0px) scale(1)";

  const motionHint = phase === "inserting" || phase === "closing";
  const hint = phase === "open" ? HINTS.open : motionHint ? HINTS.busy : HINTS.idle;

  // Giriş ekranı ya da proje açıkken arkadaki öğeler odak almasın, ekran okuyucu görmesin
  const backgroundInert = isZoomed || intro === "waiting" ? "" : undefined;

  return (
    <main className={`app${isZoomed ? " is-zoomed" : ""}${fast ? " is-fast" : ""}`}>
      <h1 className="visually-hidden">BMO's Arcade</h1>

      <div className="stage" style={{ transform: stageTransform }} inert={backgroundInert}>
        <img className="backdrop" src={`${import.meta.env.BASE_URL}images/treehouse.jpg`} alt="" />
        <div className="backdrop-vignette" />

        <div
          className="cartridges"
          role="group"
          aria-label="Projeler"
          ref={stripRef}
          data-fade-left={stripEdges.left}
          data-fade-right={stripEdges.right}
        >
          {PROJECTS.map((project, i) => (
            <Cartridge
              key={project.id}
              ref={(el) => (cardRefs.current[i] = el)}
              project={project}
              position={CARD_POSITIONS[i]}
              index={i}
              selected={selected === i}
              inserted={active === i}
              onSelect={() => select(i)}
              onInsert={() => insert(i)}
            />
          ))}
        </div>

        <Bmo
          ref={svgRef}
          mood={mood}
          look={look}
          bouncing={bouncing}
          cartridge={active !== null ? PROJECTS[active] : null}
          seated={seated}
          tray={tray}
          trayRef={trayRef}
          controls={controls}
          onBodyClick={talk}
        />
      </div>

      <header className="topbar" inert={backgroundInert}>
        <div className="owner">
          <span className="owner-name">Ulaş Özgün Tiril</span>
          <span className="owner-tagline">BMO's Arcade · projelerim</span>
        </div>
        <nav className="topbar-actions">
          <a className="pill" href="https://github.com/ulas010" target="_blank" rel="noopener">GitHub</a>
          <button className="pill" type="button" aria-pressed={!muted} onClick={toggleSound}>
            {muted ? "Ses: Kapalı" : "Ses: Açık"}
          </button>
        </nav>
      </header>

      {(phase === "open" || phase === "closing") && isZoomed && (
        <ProjectScreen
          key={active}
          project={PROJECTS[active]}
          index={active}
          total={TOTAL}
          frame={zoom.frame}
          closing={phase === "closing"}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onEject={eject}
        />
      )}

      <DialogBox text={message} hint={hint} highlight={motionHint} />

      {intro !== "done" && <StartScreen onStart={start} leaving={intro === "leaving"} />}
    </main>
  );
}
