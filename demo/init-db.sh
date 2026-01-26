#!/bin/bash

# Script pour initialiser la base de données PostgreSQL localement
# Ce script crée la base de données et initialise les schémas

echo "==========================================="
echo "Initialisation de la base de données"
echo "==========================================="

# Variables
DB_NAME="sports_club_db"
DB_USER="postgres"
DB_PASSWORD="password"
DB_HOST="localhost"
DB_PORT="5432"

# Vérifier si PostgreSQL est en cours d'exécution
echo "🔍 Vérification de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL CLI n'est pas installée"
    echo "Veuillez installer PostgreSQL ou utiliser Docker Compose"
    exit 1
fi

# Créer la base de données
echo "📦 Création de la base de données '$DB_NAME'..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER \
    -c "CREATE DATABASE $DB_NAME;"

if [ $? -eq 0 ]; then
    echo "✅ Base de données créée/vérifiée avec succès!"
else
    echo "❌ Erreur lors de la création de la base de données"
    exit 1
fi

echo ""
echo "==========================================="
echo "Initialisation terminée!"
echo "==========================================="
echo "Informations de connexion:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "Connection string:"
echo "  jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
