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

/** Naujienas pildysime admin'e / vėliau. */
export const news: NewsItem[] = [];
