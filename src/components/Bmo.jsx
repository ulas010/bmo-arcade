import { forwardRef, useState } from "react";
import CartridgeArt, { CARTRIDGE_SIZE } from "./CartridgeArt";

// Bütün koordinatlar 500x500'lük referans resmin pikselleridir
export const VIEWBOX = { x: 50, y: 40, width: 410, height: 420 };

// Ekran paralelkenar: sağ kenar `rise` kadar yukarıda
export const SCREEN = { x: 180, y: 112, width: 172, height: 131, rise: 6, radius: 8, stroke: 5 };

// Kartuş yuvası: üst kenar (x, y)'den (x + width, y - rise)'a gider
// fit: kartuşun yuvayı ne kadar doldurduğu
export const SLOT = { x: 185, y: 256, width: 108, rise: 5, depth: 15, fit: 0.94 };
export const SLOT_MID = { x: SLOT.x + SLOT.width / 2, y: SLOT.y - SLOT.rise / 2 };
export const SLOT_ANGLE = Math.atan2(-SLOT.rise, SLOT.width);
const slotLineY = (x) => SLOT.y - (SLOT.rise * (x - SLOT.x)) / SLOT.width;

// Yuvanın önünde yatan kartuş: face görünen etiket yüksekliği, edge ucu,
// hover itilmeden önceki boşluk. 0 yuvaya değer, -(face + edge) tamamen içeridir
export const TRAY = { face: 30, edge: 7, hover: 14 };
export const TRAY_DEPTH = TRAY.face + TRAY.edge;

// Bakarken yüzün yana kayma miktarı (SVG birimi)
const GAZE_RANGE = 7;

const INK = "#0f2523";
const COLORS = {
  front: "#3daca6",
  side: "#4a9ca7",
  sideShade: "#3d8a94",
  top: "#7fd0ca",
  screen: "#c5e2d0",
  arm: "#6cc5c5",
  leg: "#5a8597",
};

const SPEAKER_HOLES = [[102, 134], [125, 138], [91, 151], [112, 156], [134, 162], [100, 177], [121, 181]];

const Bmo = forwardRef(function Bmo(
  { mood, look, cartridge, seated, tray, trayRef, controls, onBodyClick, bouncing },
  svgRef
) {
  const { x, y, width, height, rise, radius } = SCREEN;

  return (
    <div className={`bmo${bouncing ? " is-bouncing" : ""}`} data-mood={mood}>
      <svg ref={svgRef} viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`} role="group" aria-label="BMO, oyun konsolu">
        <ellipse cx="255" cy="438" rx="200" ry="20" fill="#000" opacity=".3" />

        <Limb d="M366 330 C392 340 410 360 424 392" />

        <g className="bmo-body" onClick={onBodyClick}>
          <path d="M72 82 Q74 70 88 68 L258 56 Q266 56 274 58 L364 82 Q372 86 366 90 L160 100 Z"
            fill={COLORS.top} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M72 82 L160 100 L160 410 L84 386 Q72 382 72 370 Z"
            fill={COLORS.side} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M72 82 L160 100 L160 118 L72 96 Z" fill={COLORS.sideShade} />
          <g fill={INK}>
            {SPEAKER_HOLES.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.2" />)}
          </g>
          <text className="bmo-side-label" transform="translate(112 288) skewY(15) rotate(90)">BMO</text>

          <path d="M160 100 L360 90 Q370 90 370 100 L366 390 Q366 400 356 400 L172 410 Q160 410 160 400 Z"
            fill={COLORS.front} stroke={INK} strokeWidth="4" strokeLinejoin="round" />

          <path
            d={`M${x + radius} ${y} L${x + width - radius} ${y - rise}
               Q${x + width} ${y - rise} ${x + width} ${y - rise + radius}
               L${x + width} ${y + height - rise - radius}
               Q${x + width} ${y + height - rise} ${x + width - radius} ${y + height - rise}
               L${x + radius} ${y + height}
               Q${x} ${y + height} ${x} ${y + height - radius}
               L${x} ${y + radius} Q${x} ${y} ${x + radius} ${y} Z`}
            fill={COLORS.screen} stroke={INK} strokeWidth={SCREEN.stroke} strokeLinejoin="round"
          />
          <g className="bmo-face">
            <g className="bmo-gaze" style={{ transform: `translateX(${look * GAZE_RANGE}px)` }}>
              <g className="bmo-eyes" fill={INK}>
                <ellipse cx="228" cy="157" rx="5.5" ry="11" />
                <ellipse cx="320" cy="150" rx="5.5" ry="11" />
              </g>
              <g className="eyes-closed" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round">
                <path d="M220 157 Q228 165 236 157" />
                <path d="M312 150 Q320 158 328 150" />
              </g>
              <path className="mouth-smile" d="M250 172 Q276 194 302 169" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path className="mouth-frown" d="M252 190 Q276 172 300 187" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path className="mouth-open" d="M248 168 Q276 214 304 165 Z" fill={INK} />
              <ellipse className="mouth-o" cx="275" cy="186" rx="10" ry="13" fill={INK} />
            </g>
            <g className="bmo-zzz">
              <text x="304" y="140">z</text>
              <text x="318" y="128">z</text>
              <text x="332" y="114">z</text>
            </g>
          </g>
          <g className="bmo-logo">
            <rect x="241" y="132" width="50" height="50" rx="10" fill={cartridge?.color ?? "#e8452c"} stroke={INK} strokeWidth="4" />
            <text x="266" y="168" className="bmo-logo-glyph">{cartridge?.glyph}</text>
            <text x="266" y="220" className="bmo-logo-label">{cartridge?.label}</text>
          </g>

          <path
            d={`M${SLOT.x} ${SLOT.y} L${SLOT.x + SLOT.width} ${SLOT.y - SLOT.rise}
               L${SLOT.x + SLOT.width} ${SLOT.y - SLOT.rise + SLOT.depth} L${SLOT.x} ${SLOT.y + SLOT.depth} Z`}
            fill="#12403c"
          />
          {seated && cartridge && <SeatedCartridge color={cartridge.color} />}
        </g>

        {/* Bacaklar gövdenin önünde: yukarı kalkan ayaklar alt kenarın üstüne biner */}
        <Leg d="M206 428 L293 428 L293 399" />
        <Leg d="M314 413 L392 417 L392 383" />

        <Limb d="M116 334 C100 366 128 404 188 424" />

        <Button label="Ses aç/kapa" onPress={controls.toggleSound} hit={<rect x="184" y="357" width="96" height="40" fill="transparent" />}>
          <rect x="188" y="376" width="44" height="11" rx="5" transform="rotate(-4 210 381)" fill="#2b358c" stroke={INK} strokeWidth="2" />
          <rect x="234" y="370" width="42" height="11" rx="5" transform="rotate(-4 255 375)" fill="#2b358c" stroke={INK} strokeWidth="2" />
        </Button>

        <Button label="Yardım" onPress={controls.help} hit={<circle cx="330" cy="250" r="19" fill="transparent" />}>
          <circle cx="330" cy="250" r="9" fill="#3354a1" stroke={INK} strokeWidth="3" />
        </Button>

        <Button label="BMO konuşsun" onPress={controls.talk} hit={<rect x="276" y="286" width="46" height="42" fill="transparent" />}>
          <path d="M280 321 L298 292 L302 294 L286 321 Z" fill={INK} />
          <path d="M286 321 L302 293 L320 321 Z" fill="#8fd3ef" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </Button>

        <Button label="Kartuşu çıkar" onPress={controls.eject} hit={<circle cx="345" cy="321" r="19" fill="transparent" />}>
          <circle cx="345" cy="321" r="13" fill="#2f7a2a" stroke={INK} strokeWidth="3" />
          <circle cx="349" cy="320" r="10" fill="#56b945" />
        </Button>

        <Button label="Kartuşu tak" onPress={controls.insert}>
          <circle cx="312" cy="358" r="24" fill="#8a3324" stroke={INK} strokeWidth="3" />
          <circle cx="318" cy="357" r="20" fill="#e91c67" />
        </Button>

        <DPad onLeft={controls.left} onRight={controls.right} />

        {tray && <TrayCartridge project={tray.project} offset={tray.offset} trayRef={trayRef} />}
      </svg>
    </div>
  );
});

export default Bmo;

// Takılı kartuşun yuvada görünen ucu
function SeatedCartridge({ color }) {
  const inset = (SLOT.width * (1 - SLOT.fit)) / 2;
  const left = SLOT.x + inset;
  const right = SLOT.x + SLOT.width - inset;
  const band = (top, bottom) =>
    `M${left} ${slotLineY(left) + top} L${right} ${slotLineY(right) + top}
     L${right} ${slotLineY(right) + bottom} L${left} ${slotLineY(left) + bottom} Z`;

  return (
    <g strokeLinejoin="round">
      <path d={band(2, 8)} fill="#b4b4be" stroke={INK} strokeWidth="1.5" />
      <path d={band(4, 6)} fill={color} />
    </g>
  );
}

// BMO'nun koordinatlarında çizilir, yuvayla her boyutta hizalı kalır; yuva çizgisinde kesilir
function TrayCartridge({ project, offset, trayRef }) {
  const width = SLOT.width * SLOT.fit;
  const left = SLOT.x - 40;
  const right = SLOT.x + SLOT.width + 40;
  const bottom = VIEWBOX.y + VIEWBOX.height;
  const ridges = [-0.3, -0.15, 0, 0.15, 0.3]
    .map((f) => `M${f * width} ${TRAY.face + 1.5} V${TRAY.face + TRAY.edge - 2}`)
    .join(" ");

  return (
    <g>
      <clipPath id="outside-slot">
        <path d={`M${left} ${slotLineY(left)} L${right} ${slotLineY(right)} L${right} ${bottom} L${left} ${bottom} Z`} />
      </clipPath>
      <g clipPath="url(#outside-slot)" pointerEvents="none">
        <g transform={`translate(${SLOT_MID.x} ${SLOT_MID.y}) rotate(${(SLOT_ANGLE * 180) / Math.PI})`}>
          <g ref={trayRef} className="tray-cartridge" style={{ transform: `translateY(${offset}px)` }}>
            <g transform={`translate(${-width / 2} 0) scale(${width / CARTRIDGE_SIZE.width} ${TRAY.face / CARTRIDGE_SIZE.height})`}>
              <CartridgeArt project={project} id="tray" />
            </g>
            <rect x={-width / 2} y="0" width={width} height={TRAY.face} rx="2" fill="none" stroke={INK} strokeWidth="1.5" />
            <rect x={-width / 2} y={TRAY.face} width={width} height={TRAY.edge} rx="2" fill="#8c8c98" stroke={INK} strokeWidth="1.5" />
            <path d={ridges} stroke="#6f6f7a" strokeWidth="1.2" />
          </g>
        </g>
      </g>
    </g>
  );
}

const isActivationKey = (e) => e.key === "Enter" || e.key === " ";

// hit: görünmez, çizimden büyük dokunma alanı
function Button({ label, onPress, hit, children }) {
  const [pressed, setPressed] = useState(false);

  const press = () => {
    setPressed(true);
    onPress?.();
  };

  return (
    <g
      className={`bmo-button${pressed ? " is-pressed" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onPointerDown={(e) => {
        e.stopPropagation();
        press();
      }}
      onKeyDown={(e) => {
        if (!isActivationKey(e)) return;
        e.preventDefault();
        e.stopPropagation();
        press();
        setTimeout(() => setPressed(false), 120);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <title>{label}</title>
      {hit}
      {children}
    </g>
  );
}

const PLUS = "M210 288 h14 v-15 h14 v15 h15 v14 h-15 v15 h-14 v-15 h-14 z";

function DPad({ onLeft, onRight }) {
  const [pressed, setPressed] = useState(null);
  const release = () => setPressed(null);

  const activate = (side, handler) => {
    setPressed(side);
    handler?.();
  };

  const half = (side, handler, label, d) => (
    <path
      d={d}
      fill="transparent"
      role="button"
      tabIndex={0}
      aria-label={label}
      onPointerDown={(e) => {
        e.stopPropagation();
        activate(side, handler);
      }}
      onKeyDown={(e) => {
        if (!isActivationKey(e)) return;
        e.preventDefault();
        e.stopPropagation();
        activate(side, handler);
        setTimeout(release, 120);
      }}
    />
  );

  return (
    <g className={`bmo-button bmo-dpad${pressed ? ` is-pressed is-pressed-${pressed}` : ""}`} onPointerUp={release} onPointerLeave={release}>
      <title>Kartuşlar arasında gez</title>
      <path d={PLUS} transform="translate(-6 2)" fill="#f2a49a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d={PLUS} fill="#ffd41f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {half("left", onLeft, "Önceki kartuş", "M192 262 H231 V327 H192 Z")}
      {half("right", onRight, "Sonraki kartuş", "M231 262 H272 V327 H231 Z")}
    </g>
  );
}

function Limb({ d }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth="22" />
      <path d={d} stroke={COLORS.arm} strokeWidth="15" />
    </g>
  );
}

function Leg({ d }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth="28" />
      <path d={d} stroke={COLORS.leg} strokeWidth="21" />
    </g>
  );
}
