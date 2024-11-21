# Étape 1 : Construction de l'application
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Lancer l'application
FROM node:18
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package*.json ./
RUN npm install --production

# Configurer Next.js pour écouter sur le port 3001
ENV PORT=3001

EXPOSE 3001
CMD ["npm", "run", "start", "--", "-p", "3001"]
