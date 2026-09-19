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

/** Tradiciniai turnyrai — turinys; lenteles / sezonus pildysime vėliau. */
export const tournaments: Tournament[] = [
  {
    slug: "pamario-taure",
    title: "Pamario taurė",
    season: "Tradicija",
    status: "archyvas",
    format: "Vienetai / bendruomeninis turnyras",
    description:
      "Vienas ilgiausiai rengiamų „Verdenos“ turnyrų. 2017 m. vyko jau 8-oji „Pamario“ taurė. 2023 m. dalyvavo 23 žaidėjai, varžybos truko šešias dienas.",
    rules: [
      "Ilgametė Šilutės krašto teniso turnyrų tradicija.",
      "Vienetų ir bendruomeninės varžybos pagal sezono nuostatus.",
    ],
    schedule: ["Datos skelbiamos prieš kiekvieną sezono turnyrą."],
    tables: [],
    tablesNote: "Naujausio sezono lenteles ir rezultatus skelbsime čia.",
    links: [{ label: "Apie turnyrus", href: "/turnyrai#tradicijos" }],
  },
  {
    slug: "viktoro-buciaus-taure",
    title: "Viktoro Bučiaus taurė",
    season: "Tradicija",
    status: "archyvas",
    format: "Vienetai",
    description:
      "Turnyras skirtas klubo įkūrėjui ir ilgamečiam puoselėtojui Viktorui Bučiui. 2020 m. — 20 dalyvių; 2022 m. taurę iškovojo Mantas Mirauskas.",
    rules: ["Organizuoja TK Verdena klubo bendruomenė."],
    schedule: ["Datos skelbiamos sezono metu."],
    tables: [],
    tablesNote: "Rezultatai ir nugalėtojai — atnaujinama sezono eigoje.",
    links: [{ label: "Apie turnyrus", href: "/turnyrai#tradicijos" }],
  },
  {
    slug: "misriu-poru-turnyras",
    title: "Mišrių porų turnyras",
    season: "Tradicija",
    status: "archyvas",
    format: "Mišrios poros",
    description:
      "Mišrių porų varžybos — viena iš klubo sezono tradicijų. 2023 m. sezonas buvo atidarytas būtent tokiu turnyru.",
    rules: ["Mišrios poros pagal sezono nuostatus."],
    schedule: ["Dažnai sezono atidarymo ar vasaros renginys."],
    tables: [],
    tablesNote: "Porų sąrašai ir rezultatai bus čia.",
    links: [{ label: "Apie turnyrus", href: "/turnyrai#tradicijos" }],
  },
  {
    slug: "seimu-turnyras",
    title: "Šeimų turnyras",
    season: "Tradicija",
    status: "archyvas",
    format: "Šeimos",
    description:
      "„Verdena“ turi seną šeimų teniso tradiciją — varžybos minimos tiek klubo istorijoje, tiek ankstesnių sezonų apžvalgose.",
    rules: ["Šeimų komandos ir kartų žaidimas."],
    schedule: ["Datos skelbiamos sezono metu."],
    tables: [],
    tablesNote: "Šeimų turnyro rezultatai — netrukus.",
    links: [{ label: "Apie turnyrus", href: "/turnyrai#tradicijos" }],
  },
];

export function getTournament(slug: string) {
  return tournaments.find((item) => item.slug === slug);
}
