// İlk tıklamadan önceki başlık ekranı; bu tıklama tarayıcının ses iznini de açar
export default function StartScreen({ onStart, leaving }) {
  return (
    <div className={`start${leaving ? " is-leaving" : ""}`} onClick={onStart}>
      <p className="start-title" aria-hidden="true">BMO's Arcade</p>
      <p className="start-sub">Ulaş Özgün Tiril · projelerim</p>
      <button className="start-press" type="button" autoFocus>
        PRESS START
      </button>
    </div>
  );
}
