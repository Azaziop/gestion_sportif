#!/bin/bash

# Script de démarrage du Service Adhérent
# Usage: ./start-service.sh

echo "========================================="
echo "Démarrage du Service Adhérent"
echo "========================================="

# Vérifier si Docker Compose est disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose n'est pas installé"
    exit 1
fi

# Démarrer la base de données
echo "🚀 Démarrage de la base de données PostgreSQL..."
docker-compose up -d

# Attendre que la base de données soit prête
echo "⏳ Attente que la base de données soit prête..."
sleep 10

# Vérifier la connexion à la base de données
echo "🔍 Vérification de la connexion à la base de données..."
docker-compose exec -T postgres pg_isready -U postgres

if [ $? -eq 0 ]; then
    echo "✅ Base de données prête!"
else
    echo "❌ Erreur: La base de données n'est pas accessible"
    exit 1
fi

# Démarrer le service
echo "🚀 Démarrage du Service Adhérent..."
./mvnw spring-boot:run

echo "✅ Service Adhérent démarré avec succès!"
echo "📊 Interface Adminer disponible sur: http://localhost:8081"
echo "🔗 Service disponible sur: http://localhost:8080"
