# Utilisez une image de base Node.js
FROM node:18.5

# Définissez le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copiez les fichiers de l'application dans le conteneur
COPY package*.json ./
COPY index.js ./
COPY views ./views

# Installez les dépendances de l'application
RUN npm install

# Exposez le port sur lequel l'application s'exécute
EXPOSE 3000

# Démarrez l'application lorsque le conteneur démarre
CMD ["node", "index.js"]
