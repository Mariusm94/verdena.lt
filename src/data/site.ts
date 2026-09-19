export const club = {
  name: "TK Verdena",
  shortName: "TK Verdena",
  founded: 1991,
  foundedDate: "1991 m. gegužės 2 d.",
  email: "zilwa72@gmail.com",
  phone: "+370 614 42 313",
  facebook: "",
  address: "Gluosnių g. 13B, Šilutė",
  company: "Šilutės lauko teniso sporto klubas „Verdena“",
  code: "177334615",
  bank: "",
  iban: "",
  founders: ["Viktoras Bučius"],
  foundersGenitive: "Viktoro Bučiaus",
  contactPerson: "Žilvinas Petrošius",
  tagline: "Tenisas Šilutėje nuo 1991 m.",
};

export const stats = [
  {
    value: "35",
    label: "metai",
    text: "Teniso tradicijų Šilutės krašte — nuo pirmųjų žingsnių korte iki turnyrinių kovų.",
  },
  {
    value: "1991",
    label: "pradžia",
    text: "Gegužės 2 d. įsteigiamas Šilutės lauko teniso klubas „Verdena“.",
  },
  {
    value: "50+",
    label: "narių",
    text: "Pastarųjų metų klubo istorijoje — daugiau nei pusšimtis narių.",
  },
  {
    value: "8+",
    label: "turnyrų",
    text: "Didesni turnyrai per aktyvų sezoną, greta mažesnių bendruomeninių varžybų.",
  },
];

export const nav: {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}[] = [
  { label: "Apie mus", href: "/apie" },
  { label: "Istorija", href: "/istorija" },
  { label: "Turnyrai", href: "/turnyrai" },
  { label: "Naujienos", href: "/naujienos" },
  { label: "Galerija", href: "/galerija" },
  { label: "Kontaktai", href: "/kontaktai" },
];

export const sponsors: { name: string; src: string; href: string }[] = [];

/** Žmonės / istoriniai vaidmenys — ne dabartinė „trenerių“ sekcija. */
export const board = [
  { name: "Viktoras Bučius", role: "Klubo įkūrėjas ir garbės prezidentas" },
  { name: "Česlovas Normantas", role: "Vienas įkūrėjų, buvęs prezidentas" },
  { name: "Žilvinas Petrošius", role: "Kontaktinis asmuo / vadovas" },
];

export const people = [
  {
    name: "Viktoras Bučius",
    role: "Klubo įkūrėjas ir garbės prezidentas",
    text: "Vienas žmonių, nuo kurių prasidėjo „Verdenos“ istorija. Aktyvus stalo tenisininkas, vėliau pasirinkęs lauko tenisą. Klubui vadovavo 1991–2008 m., daugelį metų prisidėjo prie turnyrų organizavimo, teisėjavimo, reitingų vedimo ir klubo istorijos fiksavimo.",
  },
  {
    name: "Česlovas Normantas",
    role: "Vienas „Verdenos“ įkūrėjų ir buvęs klubo prezidentas",
    text: "Kūno kultūros mokytojas, mokęs tenisą tiek moksleivius, tiek suaugusiuosius. 2008–2009 m. vadovavo „Verdenai“, yra tapęs Lietuvos teniso varžybų nugalėtoju ir prizininku.",
  },
];

export const tournamentTraditions = [
  {
    title: "Pamario taurė",
    text: "Vienas ilgiausiai rengiamų „Verdenos“ turnyrų. 2017 m. vyko jau 8-oji „Pamario“ taurė. 2023 m. turnyre dalyvavo 23 žaidėjai, o varžybos truko šešias dienas.",
  },
  {
    title: "Viktoro Bučiaus taurė",
    text: "Turnyras skirtas klubo įkūrėjui ir ilgamečiam jo puoselėtojui. 2020 m. varžėsi 20 dalyvių, o 2022 m. taurę iškovojo Mantas Mirauskas.",
  },
  {
    title: "Mišrių porų turnyrai",
    text: "Mišrių porų varžybos tapo viena iš klubo sezono tradicijų — pavyzdžiui, 2023 m. sezonas buvo atidarytas būtent tokiu turnyru.",
  },
  {
    title: "Šeimų turnyrai",
    text: "„Verdena“ turi seną šeimų teniso tradiciją — šeimų varžybos minimos tiek klubo istorijoje, tiek ankstesnių sezonų apžvalgose.",
  },
];
