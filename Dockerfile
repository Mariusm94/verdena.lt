FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN chmod +x docker-entrypoint.sh \
  && npx prisma generate \
  && npm run build

ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/prod.db"
ENV AUTH_TRUST_HOST="true"
EXPOSE 3000
VOLUME /data

CMD ["./docker-entrypoint.sh"]
