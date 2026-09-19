export type NewsItem = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  excerpt: string;
  image: string;
  body: string[];
  tag: string;
  online?: boolean;
  relatedHref?: string;
  relatedLabel?: string;
};

export const news: NewsItem[] = [
  {
    slug: "hegelmann-rezultatai-2026",
    title: "Rezultatai — „Hegelmann Group“ Tennis Tournament",
    date: "2026-09-11",
    dateLabel: "2026 m. rugsėjo 11 d.",
    excerpt: "Paskelbti 2026 m. vasaros tęstinio turnyro finaliniai rezultatai ir prizininkai.",
    image: "/images/news/hegelmann-results.png",
    tag: "Rezultatai",
    relatedHref: "/turnyrai/hegelmann-2026",
    relatedLabel: "Hegelmann turnyro lentelės ir tvarkaraštis",
    body: [
      "Paskelbti 2026 m. vasaros tęstinio dvejetų ir vienetų turnyro „Hegelmann Group“ Tennis Tournament finaliniai rezultatai ir prizininkai.",
      "Pagrindinis turnyro rėmėjas — Hegelmann Group. Dėkojame visiems dalyviams, teisėjams ir savanoriams, kurie visą sezoną kūrė šią šventę.",
      "Išsamias lenteles ir tvarkaraštį rasite Hegelmann turnyro puslapyje.",
    ],
  },
  {
    slug: "tradiciskai-neodenta",
    title: "Tradiciškai — NEODENTA",
    date: "2026-08-26",
    dateLabel: "2026 m. rugpjūčio 26 d.",
    excerpt: "Startuoja tęstinis žiemos dvejetų ir vienetų turnyras NEODENTA. Registracija atidaryta.",
    image: "/images/news/neodenta.jpg",
    tag: "Registracija",
    online: true,
    relatedHref: "/turnyrai/neodenta-2026-27",
    relatedLabel: "NEODENTA nuostatai, lentelės ir registracija",
    body: [
      "Startuojame tradiciškai. Tęstinis žiemos dvejetų ir vienetų turnyras NEODENTA jau antrą dešimtmetį kviečia jungtis į teniso bendruomenę.",
      "Registracija — laišku klubui. Nuostatai, lentelės ir tvarkaraštis: NEODENTA turnyro puslapyje.",
    ],
  },
  {
    slug: "summer-gala-hegelmann",
    title: "Summer Gala — „Hegelmann Group“ Tennis Tournament",
    date: "2026-08-25",
    dateLabel: "2026 m. rugpjūčio 25 d.",
    excerpt: "Rugsėjo 12-oji — diena, kai skelbsime trofėjų nugalėtojus ir lygų prizininkus.",
    image: "/images/news/summer-gala.png",
    tag: "Renginys",
    relatedHref: "/turnyrai/hegelmann-2026",
    relatedLabel: "Hegelmann turnyro puslapis",
    body: [
      "Summer Gala — rugsėjo 12-oji. Data, kada skelbsime 2026 m. tęstinio vasaros „Hegelmann Group“ Tennis Tournament trofėjų nugalėtojus ir lygų prizininkus.",
      "Visi finaliniai ir paguodos susitikimai vyks nuo 10.00 iki 18.00 val. TS aikštyne. Iškilmingi apdovanojimai — 19.00 val. D. ir G. stadiono lounge erdvėje.",
      "Pagrindinis turnyro rėmėjas — Hegelmann Group.",
    ],
  },
  {
    slug: "kalviu-taure-nugaletojos",
    title: "„Kalvių taurė“ — nugalėtojos",
    date: "2026-05-27",
    dateLabel: "2026 m. gegužės 27 d.",
    excerpt: "Nugalėtojos — Viktorija Banaitytė ir Kristina Varkalienė. Sveikiname visas prizininkes.",
    image: "/images/news/kalviu.jpg",
    tag: "Rezultatai",
    body: [
      "„Kalvių taurės“ nugalėtojos — Viktorija Banaitytė ir Kristina Varkalienė.",
      "Sveikiname ir dėkojame visiems organizatoriams, rėmėjams ir dalyviams už puikią šventę, kuri sujungė visus jaukiam vakarojimui prie Kalvio ežero.",
      "Turnyrą administruoja Kauno teniso klubas.",
    ],
  },
  {
    slug: "vasara-belvilyje-rezultatai",
    title: "„Vasara Belvilyje“ — rezultatai",
    date: "2026-05-17",
    dateLabel: "2026 m. gegužės 17 d.",
    excerpt: "Paskelbti vasaros sezono atidarymo turnyro nugalėtojai visose lygose.",
    image: "/images/news/belvilis.jpg",
    tag: "Rezultatai",
    body: [
      "Paskelbti vasaros sezono atidarymo turnyro „Vasara Belvilyje“ rezultatai moterų, mix ir vyrų lygose.",
      "Sveikiname prizininkus ir visus, kurie bandė prišaukti šilumą. Pagrindinis turnyro rėmėjas — Belvilis.",
      "Dėkojame turnyro draugams, kurie visada mielai jungiasi prie klubo švenčių.",
    ],
  },
  {
    slug: "lenteles-ir-tvarkarastis",
    title: "Lentelės ir tvarkaraštis",
    date: "2026-05-15",
    dateLabel: "2026 m. gegužės 15 d.",
    excerpt: "Sveikiname visus prisijungusius į vasaros atidarymo turnyrą „Vasara Belvilyje“.",
    image: "/images/news/lenteles.jpg",
    tag: "Turnyras",
    body: [
      "Sveikiname visus prisijungusius į vasaros atidarymo turnyrą „Vasara Belvilyje“. Pagrindinis rėmėjas — Belvilis.",
      "Lentelės parengtos vyrų Power, Middle ir Challenger, moterų Middle ir mix lygoms.",
      "Visiems gražių, sportinių kovų ir smagaus vakarojimo.",
    ],
  },
  {
    slug: "hegelmann-lenteles",
    title: "Lentelės — „Hegelmann Group“ Tennis Tournament",
    date: "2026-04-23",
    dateLabel: "2026 m. balandžio 23 d.",
    excerpt: "Mažasis gimtadienis su 197 svečiais. Jau penktą vasaros sezoną skamba Hegelmann turnyras.",
    image: "/images/news/hegelmann-lenteles.jpg",
    tag: "Turnyras",
    body: [
      "Mažasis gimtadienis su 197 svečiais. Jau penktą vasaros sezoną skamba tęstinis dvejetų ir vienetų „Hegelmann Group“ Tennis Tournament.",
      "Finalinė turnyro diena — rugsėjo 12 d. Lentelės: Hegelmann turnyro puslapyje.",
      "Gražios vasaros ir atkaklių susitikimų.",
    ],
  },
  {
    slug: "neodenta-prizininkai",
    title: "NEODENTA — prizininkai",
    date: "2026-04-21",
    dateLabel: "2026 m. balandžio 21 d.",
    excerpt: "Sveikiname visus žiemos tęstinio NEODENTA turnyro prizininkus.",
    image: "/images/news/neodenta-prizininkai.jpg",
    tag: "Rezultatai",
    body: [
      "Sveikiname visus žiemos tęstinio NEODENTA turnyro prizininkus. Dėkojame visiems prisijungusiems ir kviečiame vasarą leisti kartu su klubo turnyrais.",
      "Vasarą laukia tęstinis dvejetų ir vienetų turnyras „Hegelmann Group“ Tennis Tournament — nuo gegužės 11 d. iki rugsėjo 12 d.",
      "Iki pasimatymo aikštelėje.",
    ],
  },
  {
    slug: "vasara-belvilyje-lygos",
    title: "Turnyro „Vasara Belvilyje“ — lygos",
    date: "2026-04-07",
    dateLabel: "2026 m. balandžio 7 d.",
    excerpt: "Paskelbtos vyrų, moterų ir mix lygos vasaros sezono atidarymo turnyrui.",
    image: "/images/news/belvilis.jpg",
    tag: "Turnyras",
    relatedHref: "/turnyrai/vasara-belvilyje",
    relatedLabel: "Vasara Belvilyje turnyras",
    body: [
      "Paskelbtos „Vasara Belvilyje“ lygos: vyrų Power, Middle ir Challenger, moterų Middle ir mix.",
      "Kviečiame sekti lenteles ir tvarkaraštį turnyro puslapyje. Pagrindinis rėmėjas — Belvilis.",
    ],
  },
  {
    slug: "sventos-velykos-2026",
    title: "Su Šv. Velykomis!",
    date: "2026-04-05",
    dateLabel: "2026 m. balandžio 5 d.",
    excerpt: "Kauno teniso klubas sveikina visus narius ir draugus su Šv. Velykomis.",
    image: "/images/hero/outdoor.jpg",
    tag: "Klubas",
    body: [
      "Kauno teniso klubas sveikina visus narius, rėmėjus ir teniso bendruomenę su Šv. Velykomis.",
      "Linkime ramybės, sveikatos ir greito sugrįžimo į aikšteles.",
    ],
  },
];

export function getNews(slug: string) {
  return news.find((item) => item.slug === slug);
}
