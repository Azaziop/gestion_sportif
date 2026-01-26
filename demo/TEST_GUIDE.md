# Guide de test du Service Adhérent

## 🧪 Plan de test complet

---

## Étape 1: Configuration initiale

### 1.1 Vérifier l'environnement
```bash
# Vérifier Java
java -version
# Résultat attendu: Java 17+

# Vérifier Maven
./mvnw --version
# Résultat attendu: Maven 3.8+

# Vérifier Docker (optionnel)
docker --version
docker-compose --version
```

### 1.2 Démarrer la base de données
```bash
# Option 1: Docker Compose
docker-compose up -d

# Option 2: PostgreSQL local
createdb -U postgres sports_club_db

# Vérifier la connexion
psql -h localhost -U postgres -d sports_club_db -c "SELECT 1"
```

### 1.3 Vérifier la configuration
```bash
# Vérifier application.properties
cat src/main/resources/application.properties

# Vérifier les dépendances
./mvnw dependency:tree | grep -E "(spring|postgresql|lombok)"
```

---

## Étape 2: Compilation et tests unitaires

### 2.1 Compiler le projet
```bash
./mvnw clean compile
```

### 2.2 Exécuter les tests unitaires
```bash
./mvnw test

# Résultats attendus:
# [INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
```

### 2.3 Vérifier la couverture de code
```bash
./mvnw test jacoco:report

# Vérifier le rapport
open target/site/jacoco/index.html
```

---

## Étape 3: Démarrage du service

### 3.1 Démarrer le service
```bash
./mvnw spring-boot:run

# Ou
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### 3.2 Vérifier le démarrage
```bash
# Attendre le message "Started DemoApplication"
# Vérifier le health check
curl http://localhost:8080/actuator/health

# Réponse attendue:
# {"status":"UP"}
```

### 3.3 Vérifier les logs
```bash
# Consulter les logs
tail -f logs/adherent-service.log

# Chercher les messages clés
grep "Tomcat started" logs/adherent-service.log
grep "HikariPool started" logs/adherent-service.log
```

---

## Étape 4: Tests de l'API avec cURL

### 4.1 Test de création d'adhérent
```bash
curl -X POST http://localhost:8080/api/adherents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phoneNumber": "+33612345678",
    "dateOfBirth": "1990-01-15",
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  }' | jq .

# Attendu: Réponse 201 Created avec l'adhérent créé
```

### 4.2 Test de récupération
```bash
curl http://localhost:8080/api/adherents/1 | jq .

# Attendu: Réponse 200 OK avec les données de l'adhérent
```

### 4.3 Test de création en doublon (doit échouer)
```bash
curl -X POST http://localhost:8080/api/adherents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "phoneNumber": "+33612345678",
    "dateOfBirth": "1990-01-15",
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  }' | jq .

# Attendu: Réponse 409 Conflict
# Message: "Un adhérent avec l'email jean.dupont@example.com existe déjà"
```

### 4.4 Test de validation (doit échouer)
```bash
curl -X POST http://localhost:8080/api/adherents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "invalid-email",  # Email invalide
    "phoneNumber": "+33612345678",
    "dateOfBirth": "1990-01-15",
    "address": "123 Rue de la Paix"
  }' | jq .

# Attendu: Réponse 400 Bad Request
# Message: "Erreurs de validation"
```

### 4.5 Test de mise à jour
```bash
curl -X PUT http://localhost:8080/api/adherents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean-Paul",
    "city": "Lyon"
  }' | jq .

# Attendu: Réponse 200 OK
# Le firstName doit être "Jean-Paul"
# La city doit être "Lyon"
```

### 4.6 Test d'attribution d'abonnement
```bash
curl -X POST http://localhost:8080/api/adherents/1/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PREMIUM",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 50.0
  }' | jq .

# Attendu: Réponse 200 OK
# currentSubscription.type = "PREMIUM"
# currentSubscription.active = true
```

### 4.7 Test de vérification d'abonnement
```bash
curl http://localhost:8080/api/adherents/1/has-active-subscription | jq .

# Attendu: true
```

### 4.8 Test de limite hebdomadaire
```bash
curl http://localhost:8080/api/adherents/1/weekly-session-limit | jq .

# Attendu: 2147483647 (Integer.MAX_VALUE pour PREMIUM)
```

### 4.9 Test d'éligibilité pour séance
```bash
curl http://localhost:8080/api/adherents/1/eligible-for-session | jq .

# Attendu: true
```

### 4.10 Test de suspension
```bash
curl -X POST "http://localhost:8080/api/adherents/1/suspend?reason=Paiement+en+retard" | jq .

# Attendu: Réponse 200 OK
# status = "SUSPENDED"
# suspendedReason = "Paiement en retard"
```

### 4.11 Test d'éligibilité après suspension (doit être false)
```bash
curl http://localhost:8080/api/adherents/1/eligible-for-session | jq .

# Attendu: false
```

### 4.12 Test de réactivation
```bash
curl -X POST http://localhost:8080/api/adherents/1/reactivate | jq .

# Attendu: Réponse 200 OK
# status = "ACTIVE"
# suspendedReason = null
```

### 4.13 Test de désactivation
```bash
curl -X DELETE http://localhost:8080/api/adherents/1

# Attendu: Réponse 204 No Content
```

### 4.14 Test d'accès à adhérent désactivé (doit échouer)
```bash
curl http://localhost:8080/api/adherents/1

# Attendu: Réponse 200 OK mais status = "DEACTIVATED"
```

### 4.15 Test de recherche
```bash
# Créer d'abord un nouvel adhérent
curl -X POST http://localhost:8080/api/adherents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Dupont",
    "email": "marie.dupont@example.com",
    "phoneNumber": "+33612345679",
    "dateOfBirth": "1995-05-20",
    "address": "456 Avenue du Sport",
    "city": "Marseille",
    "postalCode": "13000",
    "country": "France"
  }' | jq .

# Rechercher
curl "http://localhost:8080/api/adherents/search?name=Dupont" | jq .

# Attendu: Résultat avec 2 adhérents (Jean-Paul et Marie)
```

### 4.16 Test des adhérents actifs
```bash
curl http://localhost:8080/api/adherents/active | jq .

# Attendu: Liste des adhérents avec status = "ACTIVE"
```

### 4.17 Test des statistiques
```bash
curl http://localhost:8080/api/adherents/statistics | jq .

# Attendu:
# {
#   "activeAdherents": 1,
#   "suspendedAdherents": 0,
#   "expiredAdherents": 0,
#   "deactivatedAdherents": 1,
#   "totalAdherents": 2
# }
```

---

## Étape 5: Tests avec Postman

### 5.1 Importer la collection
1. Ouvrir Postman
2. Cliquer sur "Import"
3. Sélectionner `postman_collection.json`

### 5.2 Exécuter les tests
1. Sélectionner chaque dossier
2. Cliquer sur "Run"
3. Vérifier que tous les tests passent

### 5.3 Tests d'environnement
- Base URL: `http://localhost:8080`
- Vérifier les variables d'environnement
- Tester les pré-conditions et post-conditions

---

## Étape 6: Tests de performance

### 6.1 Test de charge simple
```bash
# Créer 100 adhérents
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/adherents \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"Adhérent$i\",
      \"lastName\": \"Test$i\",
      \"email\": \"adherent$i@example.com\",
      \"phoneNumber\": \"+3361234567$i\",
      \"dateOfBirth\": \"1990-01-15\",
      \"address\": \"Rue de la Paix\",
      \"city\": \"Paris\",
      \"postalCode\": \"75001\",
      \"country\": \"France\"
    }" &
done

# Attendre que tous les processus se terminent
wait

# Vérifier les statistiques
curl http://localhost:8080/api/adherents/statistics | jq .
```

### 6.2 Test de temps de réponse
```bash
# Mesurer le temps d'une requête
time curl http://localhost:8080/api/adherents/active > /dev/null

# Résultat attendu: < 500ms
```

---

## Étape 7: Tests de la base de données

### 7.1 Vérifier les tables
```bash
# Connecter à PostgreSQL
psql -h localhost -U postgres -d sports_club_db

# Lister les tables
\dt

# Vérifier le schéma de Adherent
\d adherents

# Vérifier les données
SELECT COUNT(*) FROM adherents;
SELECT * FROM adherents LIMIT 5;
```

### 7.2 Vérifier les triggers et indexes
```bash
# Vérifier les indexes
SELECT * FROM pg_indexes WHERE tablename = 'adherents';

# Vérifier les contraintes
SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'adherents';
```

---

## Étape 8: Tests de sécurité

### 8.1 Test CORS
```bash
curl -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:8080/api/adherents
```

### 8.2 Test de validation
```bash
# Injection SQL (doit être protégé)
curl "http://localhost:8080/api/adherents/search?name='; DROP TABLE adherents; --"

# Doit retourner une liste vide ou une erreur de validation
```

### 8.3 Test d'authentification
```bash
# Sans credentials (doit accéder selon la config)
curl http://localhost:8080/api/adherents

# Avec credentials
curl -u admin:admin123 http://localhost:8080/api/adherents
```

---

## Étape 9: Tests des logs

### 9.1 Vérifier les logs
```bash
# Chercher les erreurs
grep ERROR logs/adherent-service.log

# Chercher les appels de service
grep "Appel de AdherentService" logs/adherent-service.log

# Chercher les temps d'exécution
grep "exécuté avec succès" logs/adherent-service.log
```

### 9.2 Vérifier les timestamps
```bash
# Vérifier le format des logs
head -20 logs/adherent-service.log
```

---

## Étape 10: Tests de comportement métier

### 10.1 Test BASIC vs PREMIUM
```bash
# Créer deux adhérents
BASIC_ID=10
PREMIUM_ID=11

# Attribuer abonnement BASIC au premier
curl -X POST http://localhost:8080/api/adherents/$BASIC_ID/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BASIC",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 20.0
  }' | jq .

# Attribuer abonnement PREMIUM au second
curl -X POST http://localhost:8080/api/adherents/$PREMIUM_ID/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PREMIUM",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 50.0
  }' | jq .

# Vérifier les limites
curl http://localhost:8080/api/adherents/$BASIC_ID/weekly-session-limit
# Attendu: 3

curl http://localhost:8080/api/adherents/$PREMIUM_ID/weekly-session-limit
# Attendu: 2147483647
```

### 10.2 Test du cycle de vie complet
```bash
# 1. Créer adhérent
ID=$(curl -X POST http://localhost:8080/api/adherents \
  -H "Content-Type: application/json" \
  -d '...' | jq -r '.id')

# 2. Attribuer abonnement
curl -X POST http://localhost:8080/api/adherents/$ID/subscription ...

# 3. Vérifier éligibilité
curl http://localhost:8080/api/adherents/$ID/eligible-for-session
# Attendu: true

# 4. Suspendre
curl -X POST "http://localhost:8080/api/adherents/$ID/suspend?reason=Test"

# 5. Vérifier éligibilité (doit être false)
curl http://localhost:8080/api/adherents/$ID/eligible-for-session
# Attendu: false

# 6. Réactiver
curl -X POST http://localhost:8080/api/adherents/$ID/reactivate

# 7. Vérifier éligibilité (doit être true)
curl http://localhost:8080/api/adherents/$ID/eligible-for-session
# Attendu: true

# 8. Désactiver
curl -X DELETE http://localhost:8080/api/adherents/$ID

# 9. Accéder (doit retourner DEACTIVATED)
curl http://localhost:8080/api/adherents/$ID | jq '.status'
# Attendu: "DEACTIVATED"
```

---

## Checklist finale

- [ ] Tous les tests unitaires passent
- [ ] Base de données opérationnelle
- [ ] Service démarre sans erreur
- [ ] Health check répond 200
- [ ] Création d'adhérent fonctionne
- [ ] Lecture d'adhérent fonctionne
- [ ] Mise à jour d'adhérent fonctionne
- [ ] Suppression d'adhérent fonctionne
- [ ] Attribution d'abonnement fonctionne
- [ ] Suspension/réactivation fonctionne
- [ ] Recherche fonctionne
- [ ] Statistiques fonctionne
- [ ] Gestion d'erreur correcte
- [ ] Logs générés correctement
- [ ] Base de données mise à jour correctement
- [ ] Collection Postman importe correctement
- [ ] Tests de performance acceptables
- [ ] Pas d'erreurs de sécurité
- [ ] Documentation complète
- [ ] Prêt pour la production ✅

---

**Date: 24 janvier 2026**

*En cas de problème, consultez les fichiers de documentation ou les logs d'erreur.*
