#!/bin/sh
set -e

echo ">> Prisma schema sync…"
npx prisma db push

USER_COUNT="$(node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.user.count().then(c=>{console.log(c); return p.\$disconnect()}).catch(async e=>{console.log(0); await p.\$disconnect(); process.exit(0)})")"

if [ "$USER_COUNT" = "0" ]; then
  echo ">> Tuščia DB — paleidžiamas pradinis seed…"
  npx prisma db seed
else
  echo ">> DB jau turi duomenų (userių: $USER_COUNT) — seed praleistas."
fi

echo ">> Startuojama aplikacija…"
exec npm start
