/** Galerija — atrinktos FB albumų grupinės / bendruomenės nuotraukos pagal metus. */
export const galleryAlbums: {
  year: string;
  title: string;
  photos: { src: string; alt: string }[];
}[] = [
  {
    year: "2020+",
    title: "Bendruomenė šiandien",
    photos: [
      { src: "/images/gallery/2020s/bendruomene.jpg", alt: "Verdenos nariai ant molio korto" },
      { src: "/images/gallery/2020s/2020s-01.jpg", alt: "Klubo turnyrų akimirka" },
      { src: "/images/gallery/2020s/2020s-02.jpg", alt: "Verdenos bendruomenė" },
      { src: "/images/gallery/2020s/2020s-03.jpg", alt: "Turnyro dalyviai" },
      { src: "/images/gallery/cover-rakete.jpg", alt: "Raketė ir kamuoliukai ant molio korto" },
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
      { src: "/images/gallery/2014/2014-05.jpg", alt: "Šv. Valentino 2014 taurės ir lentelė" },
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
