/** Galerija — FB bendruomenės / žmonių nuotraukos pagal metus (be lentelių, dekorų, still-life). */
export const galleryAlbums: {
  year: string;
  title: string;
  photos: { src: string; alt: string }[];
}[] = [
  {
    year: "2026",
    title: "Bendruomenė ant korto",
    photos: [
      { src: "/images/gallery/2026/2026-07.jpg", alt: "Didelė Verdenos grupė ant molio korto" },
      { src: "/images/gallery/2026/2026-10.jpg", alt: "Klubo nariai kartu ant korto" },
      { src: "/images/gallery/2026/2026-01.jpg", alt: "Nariai po turnyro ant korto" },
      { src: "/images/gallery/2026/2026-02.jpg", alt: "Apdovanojimų akimirka su dalyviais" },
      { src: "/images/gallery/2026/2026-03.jpg", alt: "Turnyro nugalėtojai ir organizatoriai" },
      { src: "/images/gallery/2026/2026-04.jpg", alt: "Verdenos nariai su prizais" },
      { src: "/images/gallery/2026/2026-05.jpg", alt: "Šventinė akimirka po mačo" },
      { src: "/images/gallery/2026/2026-06.jpg", alt: "Apdovanojimai ant molio korto" },
      { src: "/images/gallery/2026/2026-08.jpg", alt: "Verdenos bendruomenė 2026" },
      { src: "/images/gallery/2026/2026-09.jpg", alt: "Klubo nariai turnyre" },
    ],
  },
  {
    year: "2025",
    title: "Sezono susibūrimai",
    photos: [
      { src: "/images/gallery/2025/2025-06.jpg", alt: "Moterų grupė ant molio korto" },
      { src: "/images/gallery/2025/2025-07.jpg", alt: "Žaidėjos po mačo" },
      { src: "/images/gallery/2025/2025-08.jpg", alt: "Bendruomenės akimirka ant korto" },
      { src: "/images/gallery/2025/2025-09.jpg", alt: "Verdenos nariai turnyre" },
      { src: "/images/gallery/2025/2025-10.jpg", alt: "Šventinė akimirka su raketėmis" },
      { src: "/images/gallery/2025/2025-01.jpg", alt: "Verdena #1 — nugalėtojai" },
      { src: "/images/gallery/2025/2025-02.jpg", alt: "Naktinis tenisas ir bendruomenė" },
      { src: "/images/gallery/2025/2025-03.jpg", alt: "Dalyviai po varžybų" },
      { src: "/images/gallery/2025/2025-04.jpg", alt: "Klubo nariai kartu" },
      { src: "/images/gallery/2025/2025-05.jpg", alt: "Draugiška akimirka po mačo" },
    ],
  },
  {
    year: "2024",
    title: "Vasaros sezonas",
    photos: [
      { src: "/images/gallery/2024/2024-01.jpg", alt: "Bendruomenė prie stalo po mačų" },
      { src: "/images/gallery/2024/2024-03.jpg", alt: "Žaidimas ant lauko korto" },
      { src: "/images/gallery/2024/2024-04.jpg", alt: "Turnyro dalyviai kortuose" },
      { src: "/images/gallery/2024/2024-05.jpg", alt: "Verdenos nariai varžybose" },
      { src: "/images/gallery/2024/2024-06.jpg", alt: "Žaidėja ant korto" },
      { src: "/images/gallery/2024/2024-07.jpg", alt: "Klubo dienos akimirka" },
      { src: "/images/gallery/2024/2024-08.jpg", alt: "Pokalbiai tarp mačų" },
      { src: "/images/gallery/2024/2024-09.jpg", alt: "Sezono atmosfera 2024" },
      { src: "/images/gallery/2024/2024-02.jpg", alt: "Teniso diena Šilutėje" },
    ],
  },
  {
    year: "2017",
    title: "Ledo turnyras",
    photos: [
      { src: "/images/gallery/2017/2017-04.jpg", alt: "Žaidėjai ant snieguoto korto" },
      { src: "/images/gallery/2017/2017-01.jpg", alt: "Ledo turnyro akimirka" },
      { src: "/images/gallery/2017/2017-02.jpg", alt: "Žieminis tenisas Šilutėje" },
      { src: "/images/gallery/2017/2017-05.jpg", alt: "Ledo turnyro dalyviai" },
      { src: "/images/gallery/2017/2017-03.jpg", alt: "Turnyro atmosfera 2017" },
    ],
  },
  {
    year: "2016",
    title: "Klubo šventė",
    photos: [
      { src: "/images/gallery/2016/2016-04.jpg", alt: "Apdovanojimai ir bendruomenė" },
      { src: "/images/gallery/2016/2016-05.jpg", alt: "Šventės akimirka" },
      { src: "/images/gallery/2016/2016-06.jpg", alt: "Klubo vakaro svečiai" },
      { src: "/images/gallery/2016/2016-01.jpg", alt: "Verdenos renginys 2016" },
      { src: "/images/gallery/2016/2016-02.jpg", alt: "Bendruomenės susibūrimas" },
    ],
  },
  {
    year: "2014",
    title: "Šv. Valentino turnyras",
    photos: [
      { src: "/images/gallery/2014/2014-01.jpg", alt: "Mišrių dvejetų pora salėje" },
      { src: "/images/gallery/2014/2014-03.jpg", alt: "Turnyro dalyviai su raketėmis" },
      { src: "/images/gallery/2014/2014-02.jpg", alt: "Verdenos žaidėjai 2014" },
      { src: "/images/gallery/2014/2014-04.jpg", alt: "Turnyro komandinė nuotrauka" },
    ],
  },
];

export const videos: {
  title: string;
  description: string;
  youtubeId: string;
  image: string;
}[] = [];

export const pressItems: {
  title: string;
  text: string;
  href?: string;
}[] = [];

export const timeline = [
  {
    year: "1991",
    title: "Verdenos pradžia",
    text: "1991 m. gegužės 2 d. įsteigiamas Šilutės lauko teniso klubas „Verdena“. Vienas klubo įkūrėjų Viktoras Bučius tampa pirmuoju prezidentu ir klubui vadovauja iki 2008 m.",
  },
  {
    year: "2004",
    title: "Pirmasis oficialus moterų turnyras",
    text: "Surengtas pirmasis oficialus klubo moterų turnyras. Dalyvavo 11 žaidėjų, nugalėjo Gintarė Steponkutė. Moterų tenisas ilgainiui tapo svarbia „Verdenos“ bendruomenės dalimi.",
  },
  {
    year: "2011",
    title: "Verdenai — 20",
    text: "Klubas švenčia veiklos dvidešimtmetį. Tuo metu skelbta apie maždaug 100 klubo narių, iš kurių 32 buvo moterys.",
  },
  {
    year: "2014",
    title: "Tenisas visoms kartoms",
    text: "Renginiuose — vyrų, moterų, vaikų, šeimų bei senjorų turnyrai. Minimos vaikų vienetų, dvejetų ir mišrios varžybos, „Pamario“ taurė bei šeimų turnyras.",
  },
  {
    year: "2017",
    title: "Auganti bendruomenė",
    text: "Reitingų lentelėje registruotas 51 tenisininkas. 8-ojoje „Pamario“ taurėje — 28 žaidėjai, varžybos vyko penkiose aikštelėse.",
  },
  {
    year: "2020",
    title: "Teniso tradicijos tęsiasi",
    text: "Viktoro Bučiaus taurėje — rekordiniai 20 žaidėjų. Surengtas ir mišrių porų turnyras (10 porų).",
  },
  {
    year: "2021",
    title: "30 metų kartu",
    text: "„Verdena“ pasiekia dar vieną etapą — 30 metų nuo klubo įkūrimo.",
  },
  {
    year: "2022",
    title: "Vienas aktyviausių sezonų",
    text: "Per sezoną — 8 didesni turnyrai ir mažesnės varžybos. Vien „Pamario taurėje 2022“ varžėsi 24 vyrai ir 19 moterų. Klubas vienijo daugiau nei pusšimtį narių.",
  },
  {
    year: "2023",
    title: "56 klubo nariai",
    text: "36 vyrai ir 20 moterų — iš viso 56 nariai. Klubo prezidente išrinkta teniso trenerė Gitana Mėgelaitienė. Nuspręsta prezidentus rotuoti kas dvejus metus.",
  },
  {
    year: "2026",
    title: "35 metai Verdenos",
    text: "35 metai žmonių. 35 metai turnyrų. 35 metai pergalių ir pralaimėjimų. 35 metai teniso Šilutėje.",
  },
];
