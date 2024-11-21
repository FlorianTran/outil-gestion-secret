# Construire les conteneurs
build:
	docker-compose build

# Lancer tous les services
up:
	docker-compose up -d

# Arrêter tous les services
down:
	docker-compose down

# Regénérer les conteneurs
rebuild:
	docker-compose down
	docker-compose build
	docker-compose up -d

# Afficher les logs
logs:
	docker-compose logs -f

# Accéder au bash du backend
backend exec-bash:
	docker exec -it backend bash

# Accéder au bash du frontend
frontend exec-bash:
	docker exec -it frontend bash
