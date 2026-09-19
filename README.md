# verdena.lt — Verdėnos teniso klubas

Next.js 16 + Prisma (SQLite) + NextAuth svetainė. Dublikatas nuo Kauno teniso klubo projekto — greitam perkurimui.

## Greitas startas

```bash
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

http://localhost:3000

## Kas jau pakeista

- Prekinis ženklas / SEO bazė → **Verdėnos teniso klubas**, `https://verdena.lt`
- Klubo kontaktai ir statistika — placeholder’iai (užpildysime)
- Rėmėjai išvalyti

## Kas dar Kauno turinys (perkursime)

- Turnyrai, naujienos, galerija, reitingai, nariai, logo / hero nuotraukos

Admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` iš `.env`
