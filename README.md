# Microservice Sprotif

## Vue d’ensemble
Ce dépôt regroupe une architecture microservices pour la gestion d’un club sportif (adhérents, cours, réservations). Les services sont fédérés par un **API Gateway**, un **Config Server**, et un **Eureka Server** pour la découverte de services.

## Contexte et objectif
Ce projet vise à découpler les domaines métier (adhésion, cours, réservations) en services autonomes. L’objectif est de **faciliter l’évolution**, **améliorer la maintenabilité**, et **permettre le déploiement indépendant** de chaque composant.

## Fonctionnalités principales
- Gestion des adhérents (création, mise à jour, statut, suspension).
- Gestion des abonnements (type, durée, validité).
- Gestion des cours/séances (capacité, disponibilité, niveau d’accès).
- Réservations et liste d’attente.
- Authentification JWT et propagation du contexte utilisateur.
- Routage centralisé et configuration distribuée.

## Technologies utilisées
- **Backend** : Java, Spring Boot, Spring Web, Spring Data JPA
- **Cloud** : Spring Cloud Gateway, Config Server, Eureka
- **Sécurité** : JWT
- **Base de données** : PostgreSQL
- **Frontend** : React + Vite
- **Docs & diagrammes** : Mermaid

> **Remarque** : La configuration du Gateway référence `auth-service` et `user-service`, mais leurs sources ne sont pas présentes dans ce dépôt. Ils sont donc listés comme services externes/attendus.

## Architecture globale

```mermaid
flowchart LR
  subgraph Client
    FE[Frontend Vite React]
  end

  FE -->|HTTP| GW[API Gateway]

  GW -->|Routes| AD[Adherent Service]
  GW -->|Routes| CO[Cours Service]
  GW -->|Routes| RS[Reservation Service (sport)]
  GW -.->|Routes| AU[Auth Service*]
  GW -.->|Routes| US[User Service*]

  CS[Config Server] --> GW
  CS --> AD
  CS --> CO
  CS --> RS
  CS -.-> AU
  CS -.-> US

  EU[Eureka Server] <--> GW
  EU <--> AD
  EU <--> CO
  EU <--> RS
  EU -.-> AU
  EU -.-> US

  AD --> DB1[(adherent_db)]
  CO --> DB2[(cours_db)]
  RS --> DB3[(reservation_db)]
  US -.-> DB4[(user_db*)]
```

## Services (résumé)

| Service | Rôle | Port | Base de données |
|---|---|---|---|
| API Gateway | Routage + filtres JWT (WebFlux) | 8080 | — |
| Adherent Service | Gestion adhérents, abonnements, utilisateurs | 8081 | adherent_db |
| Cours Service | Gestion cours/séances | 8084 | cours_db |
| Reservation Service (sport) | Réservations + liste d’attente | 8085 | reservation_db |
| Config Server | Configuration centralisée | — | — |
| Eureka Server | Découverte de services | — | — |
| Auth Service* | Authentification | — | — |
| User Service* | Profil utilisateur | 8083 | user_db |

> *Services référencés dans la configuration mais absents du code source dans ce dépôt.

---

# Documentation par service

## 1) API Gateway
**Chemin** : services/api-gateway

**Responsabilités**
- Routage des requêtes vers les microservices.
- Filtrage JWT global (validation + propagation des headers utilisateurs).
- CORS centralisé.

**Classes clés**
- `ApiGatewayApplication`
- `SecurityConfig`
- `JwtGlobalFilter`
- `JwtService`

**Diagramme de classes**

```mermaid
classDiagram
  class ApiGatewayApplication
  class SecurityConfig
  class JwtGlobalFilter
  class JwtService

  JwtGlobalFilter --> JwtService
  ApiGatewayApplication ..> SecurityConfig
```

---

## 2) Adherent Service
**Chemin** : services/adherent-service

**Responsabilités**
- CRUD des adhérents.
- Gestion des abonnements (types, durée, règles métier).
- Authentification interne (utilisateurs + JWT).

**Classes clés**
- Domaine : `Adherent`, `Subscription`, `User`
- Services : `AdherentService`, `SubscriptionService`, `AuthService`
- Repositories : `AdherentRepository`, `SubscriptionRepository`, `UserRepository`
- Sécurité : `JwtService`

**Diagramme de classes**

```mermaid
classDiagram
  class Adherent {
    Long id
    Long userId
    String firstName
    String lastName
    String email
    String phoneNumber
    LocalDate dateOfBirth
    AdherentStatus status
    SubscriptionType subscriptionType
    Double subscriptionPrice
    LocalDate subscriptionStartDate
    LocalDate subscriptionEndDate
  }

  class Subscription {
    Long id
    Long adherentId
    SubscriptionType type
    Double price
    Integer weeklySessions
    Integer durationMonths
    LocalDate startDate
    LocalDate endDate
  }

  class User {
    Long id
    String username
    String password
    String email
    String role
  }

  class AdherentStatus
  class SubscriptionType

  class AdherentService
  class SubscriptionService
  class AuthService

  class AdherentRepository
  class SubscriptionRepository
  class UserRepository
  class JwtService

  Adherent --> AdherentStatus
  Adherent --> SubscriptionType
  Subscription --> SubscriptionType

  Adherent "1" --> "0..*" Subscription : adherentId

  AdherentService --> AdherentRepository
  SubscriptionService --> SubscriptionRepository
  AuthService --> UserRepository
  AuthService --> JwtService

  AdherentRepository --> Adherent
  SubscriptionRepository --> Subscription
  UserRepository --> User
```

**Architecture de base de données**

```mermaid
erDiagram
  ADHERENTS {
    BIGINT id PK
    BIGINT user_id
    VARCHAR first_name
    VARCHAR last_name
    VARCHAR email
    VARCHAR phone_number
    DATE date_of_birth
    VARCHAR status
    VARCHAR subscription_type
    DOUBLE subscription_price
    DATE subscription_start_date
    DATE subscription_end_date
  }

  SUBSCRIPTIONS {
    BIGINT id PK
    BIGINT adherent_id
    VARCHAR type
    DOUBLE price
    INT weekly_sessions
    INT duration_months
    DATE start_date
    DATE end_date
  }

  USERS {
    BIGINT id PK
    VARCHAR username
    VARCHAR password
    VARCHAR email
    VARCHAR role
  }

  ADHERENTS ||--o{ SUBSCRIPTIONS : "adherent_id"
  USERS ||--o{ ADHERENTS : "user_id (logique)"
```

---

## 3) Cours Service
**Chemin** : services/service-cours/backend

**Responsabilités**
- Création et planification des cours.
- Contrôle de capacité et disponibilité.
- Accès selon abonnement (niveau d’accès).

**Classes clés**
- Domaine : `Cours`, `NiveauAcces`
- Services : `CoursService`, `CoursServiceImpl`
- Repository : `CoursRepository`

**Diagramme de classes**

```mermaid
classDiagram
  class Cours {
    Long id
    String titre
    String description
    String type
    String coach
    String salle
    Integer capaciteMax
    NiveauAcces niveau
    LocalDateTime dateHeure
    Integer duree
    Boolean actif
    Integer nombreInscrits
  }

  class NiveauAcces
  class CoursService
  class CoursServiceImpl
  class CoursRepository

  Cours --> NiveauAcces
  CoursService <|.. CoursServiceImpl
  CoursServiceImpl --> CoursRepository
  CoursRepository --> Cours
```

**Architecture de base de données**

```mermaid
erDiagram
  COURS {
    BIGINT id PK
    VARCHAR titre
    VARCHAR description
    VARCHAR type
    VARCHAR coach
    VARCHAR salle
    INT capacite_max
    VARCHAR niveau
    TIMESTAMP date_heure
    INT duree
    BOOLEAN actif
    INT nombre_inscrits
  }
```

---

## 4) Reservation Service (sport)
**Chemin** : services/sport

**Responsabilités**
- Réservations de séances (création/annulation/statuts).
- Gestion de la liste d’attente.
- Vérification d’éligibilité.

**Classes clés**
- Domaine : `Reservation`, `WaitingList`, `ReservationStatus`
- Services : `ReservationService`, `WaitingListService`
- Repositories : `ReservationRepository`, `WaitingListRepository`

**Diagramme de classes**

```mermaid
classDiagram
  class Reservation {
    Long id
    Long adherentId
    Long coursId
    ReservationStatus statut
    LocalDateTime dateReservation
    LocalDateTime dateAnnulation
    String motifAnnulation
  }

  class WaitingList {
    Long id
    Long adherentId
    Long coursId
    Integer position
    LocalDateTime dateAjout
    LocalDateTime dateConfirmation
  }

  class ReservationStatus
  class ReservationService
  class WaitingListService
  class ReservationRepository
  class WaitingListRepository

  Reservation --> ReservationStatus
  ReservationService --> ReservationRepository
  WaitingListService --> WaitingListRepository
  ReservationRepository --> Reservation
  WaitingListRepository --> WaitingList
```

**Architecture de base de données**

```mermaid
erDiagram
  RESERVATIONS {
    BIGINT id PK
    BIGINT adherent_id
    BIGINT cours_id
    VARCHAR statut
    TIMESTAMP date_reservation
    TIMESTAMP date_annulation
    VARCHAR motif_annulation
  }

  WAITING_LIST {
    BIGINT id PK
    BIGINT adherent_id
    BIGINT cours_id
    INT position
    TIMESTAMP date_ajout
    TIMESTAMP date_confirmation
  }
```

---

## 5) Config Server
**Chemin** : services/config-server

**Responsabilités**
- Centraliser la configuration de tous les services (ports, DB, JWT, CORS, routes Gateway).

**Diagramme de classes**

```mermaid
classDiagram
  class ConfigServerApplication
```

---

## 6) Eureka Server
**Chemin** : services/eureka-server

**Responsabilités**
- Registre de service pour la découverte dynamique (service registry).

**Diagramme de classes**

```mermaid
classDiagram
  class EurekaServerApplication
```

---

## 7) Frontend (UI)
**Chemin** : frontend

**Responsabilités**
- Interface utilisateur (authentification, gestion adhérents, cours, réservations).
- Consommation des APIs via l’API Gateway.

---

## Architecture de base de données (globale)
Chaque service possède sa base dédiée. Les relations inter-domaines passent par des **identifiants** (ex: `adherent_id`, `cours_id`) et non par des clés étrangères inter-bases.

```mermaid
flowchart LR
  AD[(adherent_db)]
  CO[(cours_db)]
  RS[(reservation_db)]
  US[(user_db*)]

  AD -- adherent_id --> RS
  CO -- cours_id --> RS
  US -- user_id --> AD
```

---

## Notes & conventions
- Les diagrammes Mermaid sont rendus automatiquement par GitHub et VS Code.
- Les services communiquent via HTTP REST et utilisent PostgreSQL pour la persistance.
- JWT est utilisé pour l’authentification et l’autorisation côté Gateway et services.
