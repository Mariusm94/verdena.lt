/** Galerija — Verdenos FB cover + teniso hero medžiaga; albumą plėsime iš klubo archyvo. */
export const galleryAlbums: {
  year: string;
  title: string;
  photos: { src: string; alt: string }[];
}[] = [
  {
    year: "2026",
    title: "Verdena — aikštelė ir bendruomenė",
    photos: [
      { src: "/images/gallery/cover-rakete.jpg", alt: "Raketė ir kamuoliukai ant molio korto" },
      { src: "/images/gallery/bendruomene.jpg", alt: "Klubo bendruomenė ant korto" },
      { src: "/images/gallery/kortas-aukso-valanda.jpg", alt: "Teniso kortas aukso valandoje" },
      { src: "/images/gallery/rakete-kamuoliukai.jpg", alt: "Raketė ir kamuoliukai saulėlydyje" },
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
