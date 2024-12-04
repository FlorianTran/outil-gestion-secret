# outil-gestion-secret
Projet de gestion de secret sécurisé avec une interface web.
Back-end : Nest.js
Front-end : Next.js
Base de données : PostgreSQL

# Construire les conteneurs
build:
	docker-compose build

# Lancer tous les services
up:
	docker-compose up -d

# Arrêter tous les services et supprime les volumes
down:
	docker-compose down -v

# Regénérer les conteneurs
rebuild:
	docker-compose down -v
	docker-compose build
	docker-compose up -d

# Afficher les logs
logs:
	docker-compose logs -f