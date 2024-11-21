# Construire les images Docker
build:
	docker-compose build

# Lancer les conteneurs
up:
	docker-compose up -d

# Arrêter les conteneurs
down:
	docker-compose down

# Regénérer les images Docker et relancer les conteneurs
rebuild:
	docker-compose down
	docker-compose build
	docker-compose up -d

# Afficher les logs
logs:
	docker-compose logs -f
