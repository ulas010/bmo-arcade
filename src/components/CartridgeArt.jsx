// Game Boy tarzı kartuş, 228×260'lık kutuda (gerçeği yaklaşık 57×65 mm)
export const CARTRIDGE_SIZE = { width: 228, height: 260 };

const SHELL = "#b4b4be";
const SHELL_DARK = "#8c8c98";
const INK = "#26262e";

const artSource = (project) =>
  project.image ?? `data:image/svg+xml;utf8,${encodeURIComponent(project.art)}`;

// id: aynı proje sayfada iki yerde çizilince clip-path kimlikleri çakışmasın
export default function CartridgeArt({ project, id }) {
  const clipId = `cart-art-${project.id}-${id}`;

  return (
    <g>
      <path
        d="M8 0 H190 L228 38 V244 Q228 260 212 260 H16 Q0 260 0 244 V8 Q0 0 8 0 Z"
        fill={SHELL}
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <g stroke={SHELL_DARK} strokeWidth="4" strokeLinecap="round">
        <path d="M22 14 H176 M22 24 H176 M22 34 H176" />
      </g>

      <rect x="20" y="50" width="188" height="172" rx="8" fill={INK} />
      <rect x="27" y="57" width="174" height="158" rx="4" fill={project.color} />
      <clipPath id={clipId}>
        <rect x="35" y="65" width="158" height="112" rx="3" />
      </clipPath>
      <rect x="35" y="65" width="158" height="112" rx="3" fill="#fff" />
      <image
        href={artSource(project)}
        x="35"
        y="65"
        width="158"
        height="112"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <rect x="40" y="183" width="148" height="30" rx="6" fill={INK} />
      <text x="114" y="205" className="cartridge-art-label">{project.label}</text>

      <path d="M102 234 H126 L114 249 Z" fill={SHELL_DARK} />
    </g>
  );
}
