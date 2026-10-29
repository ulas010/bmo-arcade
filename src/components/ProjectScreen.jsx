import { useEffect, useRef } from "react";

// BMO'nun yakınlaşılmış ekranının üstüne çizilir; frame ekranın sayfadaki konumu
export default function ProjectScreen({ project, index, total, frame, closing, onPrev, onNext, onEject }) {
  const titleRef = useRef(null);

  // Proje her açıldığında ya da değiştiğinde odak başlığa gelir; ekran okuyucu projeyi okur
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      className="screen-frame"
      style={{
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
        borderRadius: frame.radius,
        transform: `skewY(${frame.skew}rad)`,
        "--accent": project.color,
      }}
    >
      <article className={`screen-content${closing ? " is-closing" : ""}`} aria-label={project.title}>
        <header className="screen-header">
          <span>{project.label}</span>
          <span>{index + 1} / {total}</span>
        </header>

        <div className="screen-body">
          <figure className="screen-cover">
            {project.image
              ? <img src={project.image} alt={`${project.title} ekran görüntüsü`} />
              : <span className="cover-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: project.art }} />}
          </figure>

          <div className="screen-info">
            <h2 ref={titleRef} tabIndex={-1}>{project.title}</h2>
            <p>{project.description}</p>
            <ul className="screen-tags">
              {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
            <div className="screen-links">
              <a className="screen-button is-primary" href={project.repo} target="_blank" rel="noopener">GitHub'da gör</a>
              {project.demo && (
                <a className="screen-button" href={project.demo} target="_blank" rel="noopener">Canlı demo</a>
              )}
            </div>
          </div>
        </div>

        <footer className="screen-nav">
          <button type="button" className="screen-button" onClick={onPrev}>◀ Önceki</button>
          <button type="button" className="screen-button" onClick={onEject}>Çıkar (E)</button>
          <button type="button" className="screen-button" onClick={onNext}>Sonraki ▶</button>
        </footer>
      </article>
    </div>
  );
}
