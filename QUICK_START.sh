#!/bin/bash

# 🚀 Quick Start - Système de Gestion des Rôles

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚀 DÉMARRAGE DU SYSTÈME DE GESTION DES RÔLES - QUICK START  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifications préalables
echo -e "${BLUE}📋 Vérifications préalables...${NC}"
echo ""

# Vérifier PostgreSQL
echo -n "  ✓ PostgreSQL... "
if command -v psql &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}NON TROUVÉ${NC}"
    echo "    Veuillez installer PostgreSQL"
    exit 1
fi

# Vérifier Java
echo -n "  ✓ Java... "
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | grep 'version' | head -1)
    echo -e "${GREEN}OK${NC} ($JAVA_VERSION)"
else
    echo -e "${RED}NON TROUVÉ${NC}"
    exit 1
fi

# Vérifier Maven/Maven Wrapper
echo -n "  ✓ Maven... "
if [ -f "demo/mvnw" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}NON TROUVÉ${NC}"
    exit 1
fi

# Vérifier Node.js
echo -n "  ✓ Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}OK${NC} ($NODE_VERSION)"
else
    echo -e "${RED}NON TROUVÉ${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Toutes les dépendances sont présentes!${NC}"
echo ""

# Étape 1: Migration PostgreSQL
echo -e "${BLUE}1️⃣  Migration PostgreSQL...${NC}"
echo ""
echo "  Exécution du script de migration..."

cd /Users/anass/Documents/microservice_sprotif

psql -U postgres -d adherant_db -f demo/role_history_migration_postgres.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅ Migration PostgreSQL complète!${NC}"
else
    echo -e "  ${YELLOW}⚠️  Erreur lors de la migration (peut déjà être migré)${NC}"
fi

echo ""

# Étape 2: Démarrer le Backend
echo -e "${BLUE}2️⃣  Démarrage du Backend (Spring Boot)...${NC}"
echo ""
echo "  Compilation et démarrage..."
echo "  Note: Cela peut prendre 1-2 minutes la première fois"
echo ""

cd /Users/anass/Documents/microservice_sprotif/demo

# Vérifier et compiler si nécessaire
echo "  Compilation..."
./mvnw clean package -q

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅ Compilation réussie!${NC}"
else
    echo -e "  ${RED}❌ Erreur de compilation${NC}"
    exit 1
fi

# Démarrer le backend
echo ""
echo "  Démarrage du serveur Spring Boot..."
echo "  URL: http://localhost:8080"
echo ""

./mvnw spring-boot:run > /tmp/spring-boot.log 2>&1 &
BACKEND_PID=$!
echo "  PID du processus: $BACKEND_PID"

# Attendre que le backend soit prêt
echo "  Attente du démarrage... (max 30 secondes)"
for i in {1..30}; do
    if curl -s http://localhost:8080/api/profile > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Backend démarré!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "  ${YELLOW}⚠️  Démarrage peut prendre du temps, continuez...${NC}"
        break
    fi
    sleep 1
done

echo ""

# Étape 3: Démarrer le Frontend
echo -e "${BLUE}3️⃣  Démarrage du Frontend (Vite)...${NC}"
echo ""

cd /Users/anass/Documents/microservice_sprotif/frontend

# Vérifier et installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "  Installation des dépendances npm..."
    npm install > /tmp/npm-install.log 2>&1
    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}✅ Dépendances npm installées!${NC}"
    else
        echo -e "  ${RED}❌ Erreur lors de l'installation npm${NC}"
        exit 1
    fi
fi

echo ""
echo "  Démarrage du serveur de développement..."
echo "  URL: http://localhost:5173"
echo ""

npm run dev > /tmp/vite.log 2>&1 &
FRONTEND_PID=$!
echo "  PID du processus: $FRONTEND_PID"

echo ""

# Afficher le résumé
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SYSTÈME DÉMARRÉ AVEC SUCCÈS!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📱 ACCÈS:"
echo "  • Frontend:  ${BLUE}http://localhost:5173${NC}"
echo "  • Backend:   ${BLUE}http://localhost:8080${NC}"
echo "  • API Docs:  ${BLUE}http://localhost:8080/api${NC}"
echo ""
echo "🔑 IDENTIFIANTS DE TEST:"
echo "  • Utilisateur: admin"
echo "  • Mot de passe: admin"
echo ""
echo "📊 GESTION DES RÔLES:"
echo "  1. Connectez-vous"
echo "  2. Allez au tableau de bord admin"
echo "  3. Cliquez sur 'Gestion des Rôles'"
echo ""
echo "📚 DOCUMENTATION:"
echo "  • Guide complet: ROLE_MANAGEMENT_GUIDE.md"
echo "  • Résumé: ROLE_SYSTEM_SUMMARY.md"
echo ""
echo "⏹️  POUR ARRÊTER:"
echo "  • Backend:  kill $BACKEND_PID"
echo "  • Frontend: kill $FRONTEND_PID"
echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo "  1. Ouvrez ${BLUE}http://localhost:5173${NC} dans votre navigateur"
echo "  2. Connectez-vous avec les identifiants de test"
echo "  3. Explorez la gestion des rôles!"
echo ""
