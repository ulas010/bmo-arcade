const GITHUB_USER = "ulas010";

const rawFile = (repo, path) => `https://raw.githubusercontent.com/${GITHUB_USER}/${repo}/HEAD/${path}`;
const repoUrl = (repo) => `https://github.com/${GITHUB_USER}/${repo}`;

// Ekran görüntüsü olmayan repolar için yedek kapaklar
const ART = {
  chart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#fff4cc"/>
    <g fill="#1d1009"><rect x="18" y="50" width="14" height="28"/><rect x="40" y="34" width="14" height="44"/>
    <rect x="62" y="44" width="14" height="34"/><rect x="84" y="18" width="14" height="60"/></g>
    <path d="M14 78 H106" stroke="#1d1009" stroke-width="3"/>
    <path d="M22 44 L47 28 L69 38 L92 12" stroke="#e8452c" stroke-width="4" fill="none"/></svg>`,
  books: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#e7defc"/>
    <g stroke="#1d1009" stroke-width="3"><rect x="16" y="20" width="16" height="56" fill="#7a5cff"/>
    <rect x="34" y="28" width="14" height="48" fill="#ffd93b"/><rect x="50" y="16" width="18" height="60" fill="#3fb6ff"/>
    <rect x="70" y="26" width="14" height="50" fill="#ff7bb0" transform="rotate(10 77 76)"/></g>
    <path d="M10 78 H110" stroke="#1d1009" stroke-width="4"/></svg>`,
  checklist: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#dff3ff"/>
    <g stroke="#1d1009" stroke-width="3" fill="#fff"><rect x="18" y="16" width="14" height="14"/><rect x="18" y="38" width="14" height="14"/><rect x="18" y="60" width="14" height="14"/></g>
    <path d="M21 23 l4 4 l8 -10 M21 45 l4 4 l8 -10" stroke="#3bd16f" stroke-width="4" fill="none"/>
    <g fill="#1d1009"><rect x="42" y="20" width="56" height="6" rx="3"/><rect x="42" y="42" width="44" height="6" rx="3"/><rect x="42" y="64" width="50" height="6" rx="3"/></g></svg>`,
};

export const PROJECTS = [
  {
    id: "porsche",
    title: "Porsche Supercar",
    label: "PORSCHE",
    glyph: "P",
    color: "#e8452c",
    description: "Porsche süper sporları için hayran sitesi: kaydırmayla ilerleyen 3D sahne, model karşılaştırma ve ön sipariş sayfası.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: rawFile("porsche-supercar-site", "images/hero.webp"),
    repo: repoUrl("porsche-supercar-site"),
    demo: "https://ulas010.github.io/porsche-supercar-site/",
  },
  {
    id: "pandas",
    title: "Pandas Veri Analizi",
    label: "PANDAS",
    glyph: "D",
    color: "#f2c230",
    description: "pandas ve matplotlib ile hazırlanmış Python veri analizi defterleri.",
    tags: ["Python", "pandas", "matplotlib", "Jupyter"],
    art: ART.chart,
    repo: repoUrl("pandas-data-analysis"),
  },
  {
    id: "library",
    title: "Kütüphane Yönetimi",
    label: "KÜTÜPHANE",
    glyph: "K",
    color: "#7a5cff",
    description: "C# Windows Forms ile yazılmış, SQL Server kullanan kütüphane yönetimi masaüstü uygulaması.",
    tags: ["C#", "Windows Forms", "SQL Server"],
    art: ART.books,
    repo: repoUrl("library-management-csharp"),
  },
  {
    id: "snake",
    title: "Snake Oyunu",
    label: "YILAN",
    glyph: "S",
    color: "#3bd16f",
    description: "C# ve Windows Forms ile yapılmış klasik Yılan oyunu.",
    tags: ["C#", "Windows Forms"],
    image: rawFile("snake-game", "screenshots/gameplay.jpg"),
    repo: repoUrl("snake-game"),
  },
  {
    id: "blog",
    title: "Kişisel Blog",
    label: "BLOG",
    glyph: "B",
    color: "#ff7bb0",
    description: "HTML, CSS, Bootstrap 5 ve JavaScript ile yapılmış, mobil uyumlu kişisel web sitesi.",
    tags: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
    image: rawFile("personal-blog", "img/sunset-city.jpg"),
    repo: repoUrl("personal-blog"),
    demo: "https://ulas010.github.io/personal-blog/",
  },
  {
    id: "todo",
    title: "To-Do Uygulaması",
    label: "TO-DO",
    glyph: "T",
    color: "#3fb6ff",
    description: "Frontend stajımda HTML, CSS ve JavaScript (Fetch API) ile yaptığım yapılacaklar listesi uygulaması.",
    tags: ["HTML", "CSS", "JavaScript", "Fetch API"],
    art: ART.checklist,
    repo: repoUrl("todo-app"),
  },
];

// Masaüstünde kartuşların BMO çevresindeki yeri (ekranın yüzdesi)
export const CARD_POSITIONS = [
  { x: 30, y: 38, tilt: -4 },
  { x: 22, y: 58, tilt: 3 },
  { x: 29, y: 76, tilt: -2 },
  { x: 70, y: 36, tilt: 4 },
  { x: 78, y: 56, tilt: -3 },
  { x: 71, y: 76, tilt: 2 },
];
