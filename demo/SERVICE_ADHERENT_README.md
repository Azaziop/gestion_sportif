# Service Adhérent - Microservice de Gestion de Club Sportif

## Vue d'ensemble

Le **Service Adhérent** est un microservice Spring Boot dédié à la gestion complète du cycle de vie des adhérents d'un club sportif. Il gère les profils utilisateur, les abonnements, les statuts d'adhésion et les vérifications d'éligibilité pour participer aux séances.

## Fonctionnalités principales

### 1. Gestion du Cycle de Vie des Adhérents
- **Création** : Enregistrement de nouveaux adhérents avec données personnelles
- **Modification** : Mise à jour des informations de profil
- **Suspension** : Suspension temporaire avec raison documentée
- **Réactivation** : Restauration d'un compte suspendu
- **Désactivation** : Suppression définitive du compte

### 2. Gestion des Données Personnelles
- Prénom, nom, email (unique)
- Téléphone, adresse complète
- Date de naissance
- Certificat médical (stocké en BYTEA)
- Photo de profil (stockée en BYTEA)

### 3. Gestion des Abonnements
- **BASIC** : Limité à 3 séances par semaine
- **PREMIUM** : Illimité
- Dates de début et fin
- Vérification automatique de l'expiration

### 4. Statuts d'Adhésion
- **ACTIVE** : Adhésion valide et active
- **EXPIRED** : Abonnement expiré
- **SUSPENDED** : Suspendu temporairement
- **DEACTIVATED** : Compte désactivé définitivement

### 5. Vérifications d'Éligibilité
- Validation du statut pour l'inscription aux séances
- Calcul du nombre de séances hebdomadaires autorisées
- Vérification de l'abonnement actif

## Architecture technique

### Technologies utilisées
- **Spring Boot 3.5.10** - Framework d'application
- **Spring Data JPA** - Interaction avec la base de données
- **Spring Security** - Authentification et autorisation
- **Spring Batch** - Traitement des tâches périodiques
- **Spring AOP** - Journalisation et aspects transversaux
- **PostgreSQL** - Base de données relationnelle
- **Lombok** - Réduction du code boilerplate
- **JUnit 5 & Mockito** - Tests unitaires

### Structure des packages
```
com.example.demo/
├── model/
│   ├── entity/
│   │   ├── Adherent.java
│   │   └── Subscription.java
│   └── enums/
│       ├── AdherentStatus.java
│       └── SubscriptionType.java
├── repository/
│   ├── AdherentRepository.java
│   └── SubscriptionRepository.java
├── service/
│   ├── AdherentService.java
│   └── mapper/
│       └── AdherentMapper.java
├── controller/
│   └── AdherentController.java
├── dto/
│   ├── CreateAdherentRequest.java
│   ├── UpdateAdherentRequest.java
│   ├── AdherentResponse.java
│   ├── SubscriptionDTO.java
│   └── AdherentStatistics.java
├── exception/
│   ├── ResourceNotFoundException.java
│   ├── ResourceAlreadyExistsException.java
│   ├── InvalidOperationException.java
│   └── GlobalExceptionHandler.java
├── aspect/
│   └── LoggingAspect.java
├── config/
│   └── SecurityConfig.java
├── batch/
│   └── BatchConfig.java
└── scheduler/
    └── AdherentScheduler.java
```

## API REST - Endpoints

### Création d'adhérent
```http
POST /api/adherents
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "phoneNumber": "+33612345678",
  "dateOfBirth": "1990-01-15",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France"
}
```

### Récupérer un adhérent
```http
GET /api/adherents/{id}
GET /api/adherents/email/{email}
```

### Récupérer tous les adhérents actifs
```http
GET /api/adherents/active
```

### Rechercher des adhérents
```http
GET /api/adherents/search?name=Dupont
```

### Mettre à jour un adhérent
```http
PUT /api/adherents/{id}
Content-Type: application/json

{
  "firstName": "Jean-Paul",
  "email": "jean.paul.dupont@example.com"
}
```

### Attribuer un abonnement
```http
POST /api/adherents/{id}/subscription
Content-Type: application/json

{
  "type": "PREMIUM",
  "startDate": "2024-01-24",
  "endDate": "2025-01-24",
  "price": 50.0
}
```

### Suspendre un adhérent
```http
POST /api/adherents/{id}/suspend?reason=Paiement+en+retard
```

### Réactiver un adhérent
```http
POST /api/adherents/{id}/reactivate
```

### Désactiver un adhérent
```http
DELETE /api/adherents/{id}
```

### Vérifications d'éligibilité
```http
GET /api/adherents/{id}/has-active-subscription
GET /api/adherents/{id}/eligible-for-session
GET /api/adherents/{id}/weekly-session-limit
```

### Statistiques
```http
GET /api/adherents/statistics
```

## Configuration

### application.properties

```properties
# Base de données
spring.datasource.url=jdbc:postgresql://localhost:5432/sports_club_db
spring.datasource.username=postgres
spring.datasource.password=password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Logging
logging.level.com.example.demo=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# Batch
spring.batch.job.enabled=false
```

### Préparation de la base de données

```sql
-- Créer la base de données
CREATE DATABASE sports_club_db;

-- Les tables sont créées automatiquement via Hibernate (ddl-auto=update)
```

## Exécution

### Démarrer le service

```bash
# Avec Maven
./mvnw spring-boot:run

# Avec Java
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

Le service démarre sur `http://localhost:8080`

### Tests

```bash
# Exécuter les tests unitaires
./mvnw test

# Avec couverture de code
./mvnw test jacoco:report
```

## Tâches périodiques (Batch & Scheduler)

### Traitement des abonnements expirés
- **Fréquence** : Quotidienne à minuit
- **Action** : Change le statut des adhérents au statut EXPIRED si l'abonnement a expiré
- **Implémentation** : Spring Batch + Scheduler

```java
@Scheduled(cron = "0 0 0 * * *")
public void scheduleExpiredSubscriptionsProcessing() { ... }
```

## Sécurité

### Configuration de Spring Security
- Tous les endpoints `/api/adherents/**` sont accessibles sans authentification (à adapter selon vos besoins)
- Les endpoints actuator sont accessibles
- CSRF désactivé pour les tests (à activer en production)
- HTTP Basic auth supportée

### Utilisateur par défaut
- **Username** : `admin`
- **Password** : `admin123`

## Journalisation et AOP

### Aspect de journalisation
- Log des appels de méthode au service
- Log des résultats et des exceptions
- Log des endpoints REST
- Mesure du temps d'exécution

### Fichiers de logs
- **Console** : Affichage en temps réel
- **Fichier** : `logs/adherent-service.log`

## Gestion des erreurs

### Exceptions personnalisées
- `ResourceNotFoundException` → HTTP 404
- `ResourceAlreadyExistsException` → HTTP 409 (Conflict)
- `InvalidOperationException` → HTTP 400 (Bad Request)
- Validation des données d'entrée → HTTP 400

### Réponse d'erreur standardisée
```json
{
  "timestamp": "2024-01-24T12:30:45",
  "status": 404,
  "error": "Resource Not Found",
  "message": "Adhérent non trouvé avec l'ID: 1",
  "path": "/api/adherents/1",
  "validationErrors": null
}
```

## Exemple d'utilisation complet

```bash
# 1. Créer un nouvel adhérent
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

# 2. Attribuer un abonnement premium
curl -X POST http://localhost:8080/api/adherents/1/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PREMIUM",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 50.0
  }'

# 3. Vérifier si l'adhérent peut s'inscrire à une séance
curl http://localhost:8080/api/adherents/1/eligible-for-session

# 4. Obtenir la limite de séances hebdomadaires
curl http://localhost:8080/api/adherents/1/weekly-session-limit

# 5. Récupérer les statistiques
curl http://localhost:8080/api/adherents/statistics
```

## Points d'extension pour les microservices

### Intégration avec le Service Cours
- Validation de l'éligibilité d'un adhérent pour une séance spécifique
- Vérification du type d'abonnement (basic vs premium)

### Intégration avec le Service Réservation
- Vérification de l'adhérent et de son statut
- Calcul du nombre de séances utilisées cette semaine
- Gestion de la liste d'attente

### Communication asynchrone (JMS/RabbitMQ)
- Événement d'adhérent créé
- Événement d'adhérent suspendu
- Événement d'abonnement expiré

## Prochaines étapes

1. **Configurer la base de données PostgreSQL** en local ou en conteneur
2. **Ajouter l'authentification JWT** pour la sécurité en production
3. **Implémenter la communication asynchrone** avec RabbitMQ/ActiveMQ
4. **Ajouter les métriques** avec Micrometer et Prometheus
5. **Déployer le service** en conteneur Docker
6. **Ajouter la documentation OpenAPI/Swagger**
7. **Implémenter les tracing distribué** avec Spring Cloud Sleuth

## Support et contribution

Pour des questions ou des contributions, veuillez consulter la documentation du projet ou contacter l'équipe de développement.

---

**Dernière mise à jour** : 24 janvier 2026
