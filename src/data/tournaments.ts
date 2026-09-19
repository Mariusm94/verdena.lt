export type TournamentLink = { label: string; href: string };

export type Tournament = {
  slug: string;
  title: string;
  season: string;
  status: "vyksta" | "registracija" | "archyvas";
  format: string;
  sponsor?: string;
  description: string;
  rules: string[];
  schedule: string[];
  tables: { title: string; rows: { place: string; name: string; note?: string }[] }[];
  tablesNote?: string;
  registerSubject?: string;
  coverImage?: string;
  links: TournamentLink[];
};

export const tournaments: Tournament[] = [
  {
    slug: "neodenta-2026-27",
    title: "NEODENTA žiemos turnyras",
    season: "2026 / 27",
    status: "registracija",
    format: "Tęstinis dvejetų ir vienetų",
    sponsor: "Neodenta",
    description:
      "Tradiciškai startuojantis žiemos sezonas. Jau antrą dešimtmetį NEODENTA kviečia jungtis į teniso bendruomenę visą žiemą.",
    rules: [
      "Turnyras — tęstinis žiemos dvejetų ir vienetų ciklas visam 2026–2027 m. sezonui.",
      "Dalyvauti gali klubo nariai ir kviestiniai žaidėjai, užsiregistravę online forma šioje skiltyje.",
      "Lygos ir poros skelbiamos po registracijos pabaigos. Žaidžiama pagal klubo nuostatus ir teisėjų sprendimus aikštelėje.",
      "Pagrindinis rėmėjas — Neodenta.",
    ],
    schedule: [
      "Sezonas: 2026 m. ruduo — 2027 m. pavasaris.",
      "Konkretūs mačų laikai skelbiami užsiregistravusiems žaidėjams el. paštu ir atnaujinami šioje skiltyje.",
    ],
    tables: [],
    tablesNote:
      "Žiemos sezono lentelės pildomos prasidėjus mačams. Iki tol kviečiame registruotis.",
    registerSubject: "Registracija — NEODENTA 2026/27",
    links: [
      { label: "Registracija", href: "/turnyrai/neodenta-2026-27#registracija" },
      { label: "Nuostatai", href: "/turnyrai/neodenta-2026-27#nuostatai" },
      { label: "Lentelės", href: "/turnyrai/neodenta-2026-27#lenteles" },
      { label: "Tvarkaraštis", href: "/turnyrai/neodenta-2026-27#tvarkarastis" },
    ],
  },
  {
    slug: "termopalas-2026-27",
    title: "HARD tennis CUP — Termopalas",
    season: "2026 / 27",
    status: "vyksta",
    format: "Hard aikštelės, dvejetai",
    sponsor: "Termopalas",
    description:
      "Kietos dangos žiemos turnyras tiems, kurie nori tempu ir tikslumu žaisti visą šaltąjį sezoną.",
    rules: [
      "Formatas — dvejetai kietoje (hard) dangoje.",
      "Žaidžiama tęstiniu ritmu visą 2026–2027 m. žiemą.",
      "Pagrindinis rėmėjas — Termopalas.",
    ],
    schedule: [
      "Sezonas: 2026 / 27 žiema.",
      "Artimiausi mačai derinami su poromis ir skelbiami užsiregistravusiems.",
    ],
    tables: [],
    tablesNote: "Turnyrinės lentelės pildomos po sužaistų mačų. Rezultatus siųskite klubui.",
    registerSubject: "HARD tennis CUP Termopalas 2026/27",
    links: [
      { label: "Lentelės", href: "/turnyrai/termopalas-2026-27#lenteles" },
      { label: "Tvarkaraštis", href: "/turnyrai/termopalas-2026-27#tvarkarastis" },
      { label: "Nuostatai", href: "/turnyrai/termopalas-2026-27#nuostatai" },
    ],
  },
  {
    slug: "dextera-2026-27",
    title: "DEXTERA CUP",
    season: "2026 / 27",
    status: "vyksta",
    format: "Tęstinis dvejetų turnyras",
    sponsor: "Dextera",
    description: "Tęstinis dvejetų turnyras, kuriame poros grįžta į aikštelę visą sezoną.",
    rules: [
      "Tęstinis dvejetų ciklas. Poros žaidžia visą sezoną toje pačioje lygoje.",
      "Rezultatai fiksuojami klubo lentelėse po kiekvieno mačo.",
    ],
    schedule: ["Sezonas 2026 / 27. Mačų datos derinamos su poromis."],
    tables: [],
    tablesNote: "Lygų lentelės atnaujinamos sezono eigoje.",
    links: [
      { label: "Lentelės", href: "/turnyrai/dextera-2026-27#lenteles" },
      { label: "Nuostatai", href: "/turnyrai/dextera-2026-27#nuostatai" },
    ],
  },
  {
    slug: "cheatless-2026-27",
    title: "CHEATLESS CUP",
    season: "2026 / 27",
    status: "vyksta",
    format: "Tęstinis dvejetų turnyras",
    description: "Dar vienas žiemos dvejetų ciklas — atkaklios kovos ir nuolatinis ritmas.",
    rules: ["Tęstinis dvejetų turnyras 2026–2027 m. žiemą.", "Žaidžiama pagal klubo dvejetų nuostatus."],
    schedule: ["Sezonas 2026 / 27."],
    tables: [],
    tablesNote: "Lentelės pildomos po sužaistų mačų.",
    links: [
      { label: "Lentelės", href: "/turnyrai/cheatless-2026-27#lenteles" },
      { label: "Nuostatai", href: "/turnyrai/cheatless-2026-27#nuostatai" },
    ],
  },
  {
    slug: "kalviu-taure",
    title: "Kalvių taurė",
    season: "2026",
    status: "archyvas",
    format: "Moterų dvejetai",
    description:
      "Nugalėtojos — Viktorija Banaitytė ir Kristina Varkalienė. Šventė prie Kalvio ežero.",
    rules: [
      "Moterų dvejetų turnyras prie Kalvio ežero.",
      "Turnyrą administravo Kauno teniso klubas.",
    ],
    schedule: ["Finalinė šventė — 2026 m. gegužės 27 d."],
    tables: [
      {
        title: "Finalas",
        rows: [
          { place: "1", name: "Viktorija Banaitytė / Kristina Varkalienė", note: "Nugalėtojos" },
        ],
      },
    ],
    links: [
      { label: "Rezultatai", href: "/turnyrai/kalviu-taure#lenteles" },
      { label: "Naujiena", href: "/naujienos/kalviu-taure-nugaletojos" },
    ],
  },
  {
    slug: "hegelmann-2026",
    title: "Hegelmann Group Tennis Tournament",
    season: "2026",
    status: "archyvas",
    format: "Vasaros tęstinis dvejetų ir vienetų",
    sponsor: "Hegelmann Group",
    description:
      "Penktasis vasaros sezonas, Summer Gala ir 197 svečiai. Finalinė diena — rugsėjo 12 d.",
    rules: [
      "Tęstinis vasaros dvejetų ir vienetų turnyras. Penktasis sezonas su Hegelmann Group.",
      "Lygos: mix, moterų dvejetai ir vienetai, vyrų dvejetai ir vienetai (Masters, Power, Middle, Challenger, Light).",
      "Pagrindinis rėmėjas — Hegelmann Group.",
    ],
    schedule: [
      "Sezonas: 2026 m. gegužės 11 d. — rugsėjo 12 d.",
      "Summer Gala — rugsėjo 12 d.: finalai ir paguoda 10.00–18.00 val. TS aikštyne.",
      "Apdovanojimai — 19.00 val. D. ir G. stadiono lounge erdvėje.",
    ],
    tables: [],
    tablesNote:
      "Ieškokite pagal vardą — atsidarys lygos vieta, grupės lentelė, playoffai ir visi mačai.",
    links: [
      { label: "Lentelės", href: "/turnyrai/hegelmann-2026#lenteles" },
      { label: "Tvarkaraštis", href: "/turnyrai/hegelmann-2026#tvarkarastis" },
      { label: "Rezultatai", href: "/naujienos/hegelmann-rezultatai-2026" },
    ],
  },
  {
    slug: "vasara-belvilyje",
    title: "Vasara Belvilyje",
    season: "2026",
    status: "archyvas",
    format: "Sezono atidarymas",
    sponsor: "Belvilis",
    description: "Vasaros sezono atidarymas su Power, Middle, Challenger ir mix lygomis.",
    rules: [
      "Vasaros sezono atidarymo turnyras.",
      "Lygos: moterys Middle, mix Middle, vyrai Power, Middle ir Challenger.",
      "Pagrindinis rėmėjas — Belvilis.",
    ],
    schedule: ["Atidarymas — 2026 m. gegužės 16 d.", "Rezultatai paskelbti gegužės 17 d."],
    tables: [
      {
        title: "Lygos",
        rows: [
          { place: "—", name: "Moterys Middle" },
          { place: "—", name: "Mix Middle" },
          { place: "—", name: "Vyrai Power" },
          { place: "—", name: "Vyrai Middle" },
          { place: "—", name: "Vyrai Challenger" },
        ],
      },
    ],
    tablesNote: "Prizininkai pasveikinti 2026 m. gegužės 17 d. naujienoje.",
    links: [
      { label: "Lentelės", href: "/turnyrai/vasara-belvilyje#lenteles" },
      { label: "Rezultatai", href: "/naujienos/vasara-belvilyje-rezultatai" },
    ],
  },
  {
    slug: "neodenta-2025-26",
    title: "NEODENTA žiemos turnyras",
    season: "2025 / 26",
    status: "archyvas",
    format: "Tęstinis dvejetų ir vienetų",
    sponsor: "Neodenta",
    description: "Užbaigtas žiemos ciklas. Sveikiname visus prizininkus.",
    rules: ["Tęstinis žiemos dvejetų ir vienetų turnyras. Rėmėjas — Neodenta."],
    schedule: ["Sezonas 2025 / 26. Prizininkai paskelbti 2026 m. balandžio 21 d."],
    tables: [],
    tablesNote:
      "Visos lygos, vietos ir mačai — ieškokite pagal vardą arba naršykite grupes žemiau.",
    links: [
      { label: "Lentelės", href: "/turnyrai/neodenta-2025-26#lenteles" },
      { label: "Prizininkai", href: "/naujienos/neodenta-prizininkai" },
      { label: "Nuostatai", href: "/turnyrai/neodenta-2025-26#nuostatai" },
    ],
  },
  {
    slug: "hegelmann-2025",
    title: "Hegelmann Group Tennis Tournament",
    season: "2025",
    status: "archyvas",
    format: "Vasaros tęstinis dvejetų ir vienetų",
    sponsor: "Hegelmann Group",
    description: "Ketvirtasis vasaros sezonas su Hegelmann Group — lygos ir visi sužaisti mačai.",
    rules: [
      "Tęstinis vasaros dvejetų ir vienetų turnyras.",
      "Pagrindinis rėmėjas — Hegelmann Group.",
    ],
    schedule: ["Sezonas 2025 m. vasara."],
    tables: [],
    tablesNote: "Lygos, vietos ir mačai — ieškokite pagal vardą arba naršykite grupes.",
    links: [
      { label: "Lentelės", href: "/turnyrai/hegelmann-2025#lenteles" },
      { label: "Nuostatai", href: "/turnyrai/hegelmann-2025#nuostatai" },
    ],
  },
];

export function getTournament(slug: string) {
  return tournaments.find((item) => item.slug === slug);
}
