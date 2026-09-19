export const club = {
  name: "Verdėnos teniso klubas",
  shortName: "VTK",
  founded: 0,
  foundedDate: "",
  email: "info@verdena.lt",
  phone: "",
  facebook: "",
  address: "",
  company: "Verdėnos teniso klubas",
  code: "",
  bank: "",
  iban: "",
  founders: [] as string[],
  foundersGenitive: "",
};

export const stats = [
  {
    value: "—",
    label: "metų",
    text: "Verdėnos teniso klubo istorija ir bendruomenė — turinį atnaujinsime kartu.",
  },
  {
    value: "—",
    label: "turnyrų",
    text: "Turnyrai, lygos ir rezultatai — greitai perkursime pagal Verdėnos sezoną.",
  },
  {
    value: "—",
    label: "narių",
    text: "Klubo nariai, reitingai ir žaidėjai — struktūra jau paruošta.",
  },
  {
    value: "verdena.lt",
    label: "svetainė",
    text: "Nauja svetainė startuoja ant to paties modernaus pagrindo kaip Kauno projektas.",
  },
];

export const nav = [
  {
    label: "Klubas",
    href: "/apie",
    children: [
      { label: "Apie klubą", href: "/apie" },
      { label: "Istorija", href: "/istorija" },
      { label: "Nariai", href: "/nariai" },
      { label: "Tapti nariu", href: "/naryste" },
      { label: "Istorija spaudoje", href: "/spauda" },
      { label: "Parama 2%", href: "/parama" },
    ],
  },
  { label: "Turnyrai", href: "/turnyrai" },
  { label: "Aktualijos", href: "/naujienos" },
  {
    label: "Galerija",
    href: "/galerija",
    children: [
      { label: "Nuotraukos", href: "/galerija" },
      { label: "Video", href: "/video" },
    ],
  },
  { label: "Reitingai", href: "/reitingai" },
  { label: "Žaidėjai", href: "/zaidejai" },
  { label: "Kontaktai", href: "/kontaktai" },
];

export const sponsors: { name: string; src: string; href: string }[] = [];

export const board: { name: string; role: string }[] = [
  { name: "Valdyba", role: "Kontaktus ir sudėtį papildysime" },
];
