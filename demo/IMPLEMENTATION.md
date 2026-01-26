# Service Adhérent - Guide d'Implémentation

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Structure du projet](#structure-du-projet)
3. [Installation et configuration](#installation-et-configuration)
4. [Démarrage du service](#démarrage-du-service)
5. [API REST](#api-rest)
6. [Architecture](#architecture)
7. [Tests](#tests)
8. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

Le **Service Adhérent** est un microservice Spring Boot conçu pour gérer:
- ✅ Le cycle de vie complet des adhérents
- ✅ Les profils utilisateur et données personnelles
- ✅ Les abonnements (BASIC/PREMIUM)
- ✅ La gestion des statuts d'adhésion
- ✅ Les vérifications d'éligibilité
- ✅ Le traitement des abonnements expirés

### Caractéristiques principales
- **Sécurisé** : Spring Security + validation des données
- **Performant** : JPA avec optimisations Hibernate
- **Observable** : AOP logging + Spring Actuator
- **Scalable** : Architecture microservice prête
- **Testable** : Tests unitaires complets

---

## 📁 Structure du projet

```
demo/
├── src/
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── model/
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Adherent.java
│   │   │   │   │   └── Subscription.java
│   │   │   │   └── enums/
│   │   │   │       ├── AdherentStatus.java
│   │   │   │       └── SubscriptionType.java
│   │   │   ├── repository/
│   │   │   │   ├── AdherentRepository.java
│   │   │   │   └── SubscriptionRepository.java
│   │   │   ├── service/
│   │   │   │   ├── AdherentService.java
│   │   │   │   └── mapper/
│   │   │   │       └── AdherentMapper.java
│   │   │   ├── controller/
│   │   │   │   └── AdherentController.java
│   │   │   ├── dto/
│   │   │   │   ├── CreateAdherentRequest.java
│   │   │   │   ├── UpdateAdherentRequest.java
│   │   │   │   ├── AdherentResponse.java
│   │   │   │   ├── SubscriptionDTO.java
│   │   │   │   └── AdherentStatistics.java
│   │   │   ├── exception/
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── ResourceAlreadyExistsException.java
│   │   │   │   ├── InvalidOperationException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── aspect/
│   │   │   │   └── LoggingAspect.java
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── batch/
│   │   │   │   └── BatchConfig.java
│   │   │   ├── scheduler/
│   │   │   │   └── AdherentScheduler.java
│   │   │   └── DemoApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/example/demo/
│           └── service/
│               └── AdherentServiceTest.java
├── target/                    # Généré après la compilation
├── pom.xml                    # Dépendances Maven
├── Dockerfile                 # Configuration Docker
├── docker-compose.yml         # Orchestration des conteneurs
├── postman_collection.json    # Collection API pour tests
├── start-service.sh          # Script de démarrage
├── init-db.sh               # Script d'initialisation DB
└── SERVICE_ADHERENT_README.md # Documentation détaillée
```

---

## 🔧 Installation et configuration

### Prérequis
- **Java 17+** : Compilateur et runtime
- **Maven 3.8+** : Gestionnaire de dépendances
- **PostgreSQL 12+** : Base de données (ou Docker)
- **Docker & Docker Compose** : Optionnel mais recommandé

### Étape 1: Cloner et préparer le projet

```bash
cd /Users/anass/Documents/microservice_sprotif/demo
```

### Étape 2: Configurer la base de données

#### Option A: Avec Docker Compose (Recommandé)
```bash
# Démarrer PostgreSQL et Adminer
docker-compose up -d

# Vérifier que les conteneurs sont en cours d'exécution
docker-compose ps

# Accéder à Adminer pour visualiser la BD
# URL: http://localhost:8081
```

#### Option B: PostgreSQL local
```bash
# Créer manuellement la base de données
createdb -U postgres sports_club_db

# Ou utiliser le script
bash init-db.sh
```

### Étape 3: Mettre à jour application.properties si nécessaire

```properties
# Vérifier les paramètres de connexion BD
spring.datasource.url=jdbc:postgresql://localhost:5432/sports_club_db
spring.datasource.username=postgres
spring.datasource.password=password
```

### Étape 4: Construire le projet

```bash
# Compiler et télécharger les dépendances
./mvnw clean compile

# Ou sur Windows
mvnw.cmd clean compile
```

---

## 🚀 Démarrage du service

### Option 1: Avec Maven
```bash
./mvnw spring-boot:run
```

### Option 2: Construire et exécuter le JAR
```bash
# Construire le JAR
./mvnw clean package

# Exécuter le JAR
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### Option 3: Avec Docker
```bash
# Construire l'image
docker build -t adhérent-service .

# Exécuter le conteneur
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/sports_club_db \
  adhérent-service
```

### Option 4: Utiliser le script de démarrage
```bash
bash start-service.sh
```

### Vérifier le démarrage
```bash
# Vérifier que le service est en cours d'exécution
curl http://localhost:8080/actuator/health

# Réponse attendue:
# {"status":"UP","components":{"db":{"status":"UP"},...}}
```

---

## 🔌 API REST

### Authentication (optionnel)
- **Username** : `admin`
- **Password** : `admin123`

### Endpoints principaux

#### 1. Créer un adhérent
```bash
POST /api/adherents
Content-Type: application/json

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
  }'
```

#### 2. Récupérer un adhérent
```bash
GET /api/adherents/{id}
GET /api/adherents/email/{email}

curl http://localhost:8080/api/adherents/1
curl http://localhost:8080/api/adherents/email/jean.dupont@example.com
```

#### 3. Lister les adhérents actifs
```bash
GET /api/adherents/active

curl http://localhost:8080/api/adherents/active
```

#### 4. Rechercher des adhérents
```bash
GET /api/adherents/search?name=Dupont

curl "http://localhost:8080/api/adherents/search?name=Dupont"
```

#### 5. Mettre à jour un adhérent
```bash
PUT /api/adherents/{id}
Content-Type: application/json

curl -X PUT http://localhost:8080/api/adherents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean-Paul",
    "city": "Lyon"
  }'
```

#### 6. Attribuer un abonnement
```bash
POST /api/adherents/{id}/subscription
Content-Type: application/json

curl -X POST http://localhost:8080/api/adherents/1/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PREMIUM",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 50.0
  }'
```

#### 7. Suspendre un adhérent
```bash
POST /api/adherents/{id}/suspend?reason={raison}

curl -X POST "http://localhost:8080/api/adherents/1/suspend?reason=Paiement+en+retard"
```

#### 8. Réactiver un adhérent
```bash
POST /api/adherents/{id}/reactivate

curl -X POST http://localhost:8080/api/adherents/1/reactivate
```

#### 9. Désactiver un adhérent
```bash
DELETE /api/adherents/{id}

curl -X DELETE http://localhost:8080/api/adherents/1
```

#### 10. Vérifier l'abonnement actif
```bash
GET /api/adherents/{id}/has-active-subscription

curl http://localhost:8080/api/adherents/1/has-active-subscription
```

#### 11. Vérifier l'éligibilité pour une séance
```bash
GET /api/adherents/{id}/eligible-for-session

curl http://localhost:8080/api/adherents/1/eligible-for-session
```

#### 12. Obtenir la limite de séances hebdomadaires
```bash
GET /api/adherents/{id}/weekly-session-limit

curl http://localhost:8080/api/adherents/1/weekly-session-limit
```

#### 13. Obtenir les statistiques
```bash
GET /api/adherents/statistics

curl http://localhost:8080/api/adherents/statistics
```

### Importer la collection Postman
```bash
# Dans Postman, importer le fichier
postman_collection.json
```

---

## 🏗️ Architecture

### Couches du service

```
┌─────────────────────────────────────┐
│          API REST (HTTP)            │  AdherentController
├─────────────────────────────────────┤
│         Exception Handler           │  GlobalExceptionHandler
├─────────────────────────────────────┤
│      Business Logic (Métier)        │  AdherentService
├─────────────────────────────────────┤
│       AOP (Logging, Tracing)        │  LoggingAspect
├─────────────────────────────────────┤
│         Data Access (JPA)           │  AdherentRepository
├─────────────────────────────────────┤
│          Database Layer             │  PostgreSQL
└─────────────────────────────────────┘
```

### Patterns utilisés
- **Repository Pattern** : Abstraction de la persistence
- **Service Pattern** : Logique métier isolée
- **DTO Pattern** : Séparation client-serveur
- **Mapper Pattern** : Conversion Entity/DTO
- **Aspect-Oriented Programming** : Préoccupations transversales

---

## 🧪 Tests

### Exécuter les tests unitaires
```bash
./mvnw test
```

### Résultats attendus
```
[INFO] --- maven-surefire-plugin:3.0.0-M9:test (default-test) @ demo ---
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.345 s
```

### Ajouter des tests d'intégration
```bash
# Démarrer le service
./mvnw spring-boot:run

# Dans un autre terminal
./mvnw verify
```

---

## 📦 Déploiement

### Déploiement Docker

#### 1. Construire l'image
```bash
docker build -t adhérent-service:1.0 .
```

#### 2. Créer un docker-compose de production
```bash
# Copier et modifier docker-compose.yml
cp docker-compose.yml docker-compose.prod.yml

# Éditer le fichier pour la production
```

#### 3. Déployer
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Déploiement Kubernetes (optionnel)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adhérent-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: adhérent-service
  template:
    metadata:
      labels:
        app: adhérent-service
    spec:
      containers:
      - name: adhérent-service
        image: adhérent-service:1.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_DATASOURCE_URL
          value: jdbc:postgresql://postgres-service:5432/sports_club_db
```

---

## 🔍 Troubleshooting

### Erreur: "Connection refused"
```bash
# Vérifier que PostgreSQL est en cours d'exécution
docker-compose ps

# Ou
psql -h localhost -U postgres
```

### Erreur: "Port 8080 already in use"
```bash
# Trouver le processus utilisant le port
lsof -i :8080

# Ou changer le port dans application.properties
server.port=8081
```

### Erreur: "ClassNotFoundException"
```bash
# Nettoyer et reconstruire
./mvnw clean compile
```

---

## 📚 Documentation supplémentaire

- [API Documentation](SERVICE_ADHERENT_README.md)
- [Postman Collection](postman_collection.json)
- [Logs](logs/adhérent-service.log)
- [Application Properties](src/main/resources/application.properties)

---

## ✅ Checklist de démarrage

- [ ] Java 17+ installé et configuré
- [ ] Maven 3.8+ installé et configuré
- [ ] PostgreSQL/Docker Compose configuré
- [ ] Projet cloné et préparé
- [ ] Application properties configurée
- [ ] Base de données créée
- [ ] Service démarré et accessible
- [ ] Tests unitaires réussis
- [ ] API testée via Postman/cURL
- [ ] Logs vérifiés dans les fichiers

---

**Dernière mise à jour** : 24 janvier 2026
