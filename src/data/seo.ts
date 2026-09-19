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
  titleDefault: "Verdėnos teniso klubas",
  titleTemplate: "%s — Verdėnos teniso klubas",
  description:
    "Verdėnos teniso klubas — turnyrai, narystė, reitingai, galerija ir klubo bendruomenė.",
  keywords:
    "Verdėnos teniso klubas, tenisas Verdėna, VTK, teniso turnyrai, teniso klubas Lietuva, verdena.lt",
  ogImage: "/images/og-share.png",
  pages: {
    "/": {
      title: "Verdėnos teniso klubas",
      description: "Verdėnos teniso klubas — turnyrai, narystė, reitingai ir bendruomenė.",
      keywords: "Verdėnos teniso klubas, tenisas Verdėna, VTK, verdena.lt",
    },
    "/turnyrai": {
      title: "Turnyrai",
      description: "Verdėnos teniso klubo turnyrai — registracija, lygos, tvarkaraščiai ir rezultatai.",
      keywords: "teniso turnyrai Verdėna, VTK turnyrai, registracija",
    },
    "/naujienos": {
      title: "Aktualijos",
      description: "Naujienos ir aktualijos iš Verdėnos teniso klubo.",
    },
    "/reitingai": {
      title: "Reitingai",
      description: "Verdėnos teniso klubo žaidėjų reitingai ir statistika.",
      keywords: "teniso reitingai Verdėna, VTK reitingai",
    },
    "/zaidejai": {
      title: "Žaidėjai",
      description: "Verdėnos teniso klubo žaidėjai ir karjeros statistika.",
    },
    "/nariai": {
      title: "Klubo nariai",
      description: "Verdėnos teniso klubo narių sąrašas.",
    },
    "/naryste": {
      title: "Tapti nariu",
      description: "Kaip tapti Verdėnos teniso klubo nariu — sąlygos ir kontaktai.",
    },
    "/kontaktai": {
      title: "Kontaktai",
      description: "Verdėnos teniso klubo kontaktai — adresas, el. paštas.",
      keywords: "Verdėnos teniso klubas kontaktai, verdena.lt",
    },
    "/apie": {
      title: "Apie klubą",
      description: "Apie Verdėnos teniso klubą — istorija, bendruomenė ir vertybės.",
    },
    "/istorija": {
      title: "Klubo istorija",
      description: "Verdėnos teniso klubo istorijos chronologija.",
    },
    "/galerija": {
      title: "Galerija",
      description: "Verdėnos teniso klubo nuotraukų galerija.",
    },
    "/video": {
      title: "Video",
      description: "Verdėnos teniso klubo video įrašai.",
    },
    "/spauda": {
      title: "Istorija spaudoje",
      description: "Verdėnos tenisas spaudoje — straipsniai ir publikacijos.",
    },
    "/parama": {
      title: "Parama 2%",
      description: "Skirkite 2% GPM Verdėnos teniso klubui.",
    },
    "/prisijungti": {
      title: "Prisijungti",
      description: "Prisijunkite prie Verdėnos teniso klubo paskyros.",
    },
    "/registracija": {
      title: "Svetainės paskyra",
      description: "Sukurkite paskyrą Verdėnos teniso klubo svetainėje.",
    },
  },
};
