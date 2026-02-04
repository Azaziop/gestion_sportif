#!/bin/bash

# Script de test rapide des 5 fonctionnalités
# Usage: ./QUICK_TEST.sh

echo "=================================================="
echo "🚀 QUICK TEST - 5 Fonctionnalités Implémentées"
echo "=================================================="
echo ""

# Vérifications
echo "1️⃣  Vérification des prérequis..."
echo ""

if ! command -v java &> /dev/null; then
    echo "❌ Java non trouvé. Installez Java 17+"
    exit 1
fi
echo "✓ Java: $(java -version 2>&1 | head -1)"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trouvé. Installez Node.js 18+"
    exit 1
fi
echo "✓ Node.js: $(node -v)"

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client non trouvé"
    exit 1
fi
echo "✓ PostgreSQL: $(psql --version)"

echo ""
echo "2️⃣  Structure du projet..."
echo ""

if [ -d "demo" ] && [ -d "frontend" ]; then
    echo "✓ Backend trouvé (demo/)"
    echo "✓ Frontend trouvé (frontend/)"
else
    echo "❌ Structure incorrecte. Êtes-vous dans le bon répertoire?"
    exit 1
fi

echo ""
echo "3️⃣  Vérification de la compilation..."
echo ""

# Vérifier que le backend compile
cd demo
if ./mvnw clean compile -q 2>/dev/null; then
    echo "✓ Backend compile sans erreurs"
else
    echo "⚠️  Erreurs de compilation backend"
fi
cd ..

# Vérifier que le frontend compile
cd frontend
if npm run build > /dev/null 2>&1; then
    echo "✓ Frontend build réussie"
else
    echo "⚠️  Erreurs de build frontend"
fi
cd ..

echo ""
echo "4️⃣  URLs de démarrage..."
echo ""
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""

echo "5️⃣  Credentials de test..."
echo ""
echo "Email:    admin"
echo "Password: Admin123!"
echo ""

echo "=================================================="
echo "✅ PRÊT À TESTER!"
echo "=================================================="
echo ""
echo "Démarrer le projet:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd demo"
echo "  ./mvnw spring-boot:run"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Les 5 Fonctionnalités:"
echo "  1. 📋 Certificats Médicaux (dans AdherentDetails)"
echo "  2. 🚫 Suspensions (dans AdherentDetails)"
echo "  3. 💳 Abonnements (Menu → Abonnements)"
echo "  4. 📊 Rapports (Menu → Rapports)"
echo "  5. 👥 Gestion Rôles (Menu → Gestion Rôles)"
echo ""
echo "Documentation: INDEX_FEATURES.md"
echo "=================================================="
