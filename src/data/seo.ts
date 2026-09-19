export type PageSeoOverride = {
  title?: string;
  description?: string;
  keywords?: string;
};

export type SeoSettings = {
  siteUrl: string;
  titleDefault: string;
  titleTemplate: string;
  description: string;
  keywords: string;
  ogImage: string;
  pages: Record<string, PageSeoOverride>;
};

export const defaultSeo: SeoSettings = {
  siteUrl: "https://verdena.lt",
  titleDefault: "TK Verdena | Teniso klubas Šilutėje nuo 1991 m.",
  titleTemplate: "%s — TK Verdena",
  description:
    "Šilutės lauko teniso klubas „Verdena“ — teniso bendruomenė, turnyrai ir daugiau nei 35 metų teniso tradicijų Šilutėje.",
  keywords:
    "TK Verdena, tenisas Šilutė, teniso klubas Šilutė, lauko tenisas Šilutė, teniso turnyrai Šilutėje, Šilutės teniso klubas Verdena, Verdena",
  ogImage: "/images/og-share.png",
  pages: {
    "/": {
      title: "TK Verdena | Teniso klubas Šilutėje nuo 1991 m.",
      description:
        "Šilutės lauko teniso klubas „Verdena“ — teniso bendruomenė, turnyrai ir daugiau nei 35 metų teniso tradicijų Šilutėje.",
      keywords: "TK Verdena, tenisas Šilutė, teniso klubas Šilutė, Verdena",
    },
    "/apie": {
      title: "Apie mus",
      description: "Mus vienija tenisas. „Verdena“ — Šilutės krašto teniso bendruomenė nuo 1991 m.",
    },
    "/istorija": {
      title: "Istorija",
      description: "35 metai „Verdenos“ — nuo 1991 m. įkūrimo iki turnyrų ir bendruomenės šiandien.",
    },
    "/turnyrai": {
      title: "Turnyrai",
      description: "Varžybos — „Verdenos“ DNR. Pamario taurė, Viktoro Bučiaus taurė, mišrios poros ir šeimų turnyrai.",
      keywords: "teniso turnyrai Šilutėje, Pamario taurė, Viktoro Bučiaus taurė",
    },
    "/naujienos": {
      title: "Naujienos",
      description: "Aktualijos iš TK Verdena — turnyrai, bendruomenė ir sezono akimirkos.",
    },
    "/galerija": {
      title: "Galerija",
      description: "TK Verdena nuotraukos — turnyrai, bendruomenė ir klubo istorija.",
    },
    "/naryste": {
      title: "Prisijungti prie Verdenos",
      description: "Tapkite Šilutės teniso klubo „Verdena“ nariu — nesvarbu, ar žaidžiate daugelį metų, ar pirmą kartą.",
    },
    "/kontaktai": {
      title: "Kontaktai",
      description: "Šilutės lauko teniso sporto klubas „Verdena“ — kontaktai Šilutėje.",
      keywords: "Verdena kontaktai, tenisas Šilutė",
    },
    "/reitingai": {
      title: "Reitingai",
      description: "TK Verdena žaidėjų reitingai.",
    },
    "/zaidejai": {
      title: "Žaidėjai",
      description: "TK Verdena žaidėjai.",
    },
    "/nariai": {
      title: "Klubo nariai",
      description: "TK Verdena narių bendruomenė.",
    },
    "/parama": {
      title: "Parama 2%",
      description: "Skirkite 2% GPM Šilutės teniso klubui „Verdena“.",
    },
    "/prisijungti": {
      title: "Prisijungti",
      description: "Prisijunkite prie TK Verdena paskyros.",
    },
    "/registracija": {
      title: "Svetainės paskyra",
      description: "Sukurkite paskyrą verdena.lt.",
    },
    "/spauda": {
      title: "Spauda",
      description: "„Verdena“ spaudoje ir istoriniuose šaltiniuose.",
    },
    "/video": {
      title: "Video",
      description: "TK Verdena video.",
    },
  },
};
