import { forwardRef } from "react";
import CartridgeArt, { CARTRIDGE_SIZE } from "./CartridgeArt";

const Cartridge = forwardRef(function Cartridge(
  { project, position, index, selected, inserted, onSelect, onInsert },
  ref
) {
  const className = ["cartridge", selected && "is-selected", inserted && "is-inserted"].filter(Boolean).join(" ");

  return (
    <div className="cartridge-slot" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
      <button
        ref={ref}
        type="button"
        className={className}
        aria-label={`${project.title} kartuşu`}
        style={{ "--accent": project.color, "--tilt": `${position.tilt}deg`, "--delay": `${-index * 0.7}s` }}
        onMouseEnter={onSelect}
        onFocus={onSelect}
        onClick={onInsert}
      >
        <svg className="cartridge-shell" viewBox={`0 0 ${CARTRIDGE_SIZE.width} ${CARTRIDGE_SIZE.height}`} aria-hidden="true">
          <CartridgeArt project={project} id="card" />
        </svg>
        <span className="cartridge-title">
          <span className="title-full">{project.title}</span>
          <span className="title-short">{project.label}</span>
        </span>
      </button>
    </div>
  );
});

export default Cartridge;
