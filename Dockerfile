# Étape 1 : Construire l'application
FROM node:18-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers pour le build
COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape 2 : Préparer l'image pour exécuter l'application
FROM node:18-alpine

WORKDIR /app

# Copier uniquement le build et les dépendances nécessaires
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Démarrer l'application en mode production
CMD ["npm", "start"]
