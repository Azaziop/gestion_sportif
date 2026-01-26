#!/bin/bash

echo "🚀 Démarrage du Frontend TypeScript..."
echo ""

cd "$(dirname "$0")/frontend"

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo "✅ Démarrage du serveur de développement sur http://localhost:5173"
echo "⚠️  Assurez-vous que le backend est en cours d'exécution sur http://localhost:8080"
echo ""

npm run dev
