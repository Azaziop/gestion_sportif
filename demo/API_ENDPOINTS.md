# Endpoints API - Service Adhérent

## Vue d'ensemble
Le Service Adhérent expose **26 endpoints REST** organisés en 5 catégories principales.

---

## 1️⃣ Gestion des adhérents (CRUD)

### Créer un adhérent
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

# Réponse (201 Created)
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "phoneNumber": "+33612345678",
  "dateOfBirth": "1990-01-15",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France",
  "status": "ACTIVE",
  "currentSubscription": null,
  "createdAt": "2024-01-24T12:30:45.123456",
  "updatedAt": "2024-01-24T12:30:45.123456",
  "suspendedReason": null,
  "suspendedDate": null
}
```

### Récupérer un adhérent par ID
```http
GET /api/adherents/1

# Réponse (200 OK)
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "phoneNumber": "+33612345678",
  "dateOfBirth": "1990-01-15",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France",
  "status": "ACTIVE",
  "currentSubscription": {
    "id": 10,
    "type": "PREMIUM",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 50.0,
    "active": true
  },
  "createdAt": "2024-01-24T12:30:45.123456",
  "updatedAt": "2024-01-24T12:30:45.123456"
}
```

### Récupérer un adhérent par email
```http
GET /api/adherents/email/jean.dupont@example.com

# Réponse (200 OK) - même format que ci-dessus
```

### Mettre à jour un adhérent
```http
PUT /api/adherents/1
Content-Type: application/json

{
  "firstName": "Jean-Paul",
  "city": "Lyon",
  "phoneNumber": "+33687654321"
}

# Réponse (200 OK)
{
  "id": 1,
  "firstName": "Jean-Paul",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "phoneNumber": "+33687654321",
  "dateOfBirth": "1990-01-15",
  "address": "123 Rue de la Paix",
  "city": "Lyon",
  "postalCode": "75001",
  "country": "France",
  "status": "ACTIVE",
  "updatedAt": "2024-01-24T13:45:22.456789"
}
```

### Désactiver un adhérent
```http
DELETE /api/adherents/1

# Réponse (204 No Content)
```

---

## 2️⃣ Recherche et listage

### Récupérer tous les adhérents actifs
```http
GET /api/adherents/active

# Réponse (200 OK)
[
  {
    "id": 1,
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "status": "ACTIVE",
    ...
  },
  {
    "id": 2,
    "firstName": "Marie",
    "lastName": "Martin",
    "email": "marie.martin@example.com",
    "status": "ACTIVE",
    ...
  }
]
```

### Rechercher des adhérents par nom
```http
GET /api/adherents/search?name=Dupont

# Réponse (200 OK)
[
  {
    "id": 1,
    "firstName": "Jean",
    "lastName": "Dupont",
    ...
  },
  {
    "id": 5,
    "firstName": "Pierre",
    "lastName": "Dupont",
    ...
  }
]
```

### Récupérer adhérents par statut
```http
GET /api/adherents/status/SUSPENDED

# Réponse (200 OK)
[
  {
    "id": 3,
    "firstName": "Paul",
    "lastName": "Bernard",
    "status": "SUSPENDED",
    "suspendedReason": "Paiement en retard",
    "suspendedDate": "2024-01-20T10:00:00"
  }
]
```

---

## 3️⃣ Gestion des abonnements

### Attribuer/Mettre à jour un abonnement
```http
POST /api/adherents/1/subscription
Content-Type: application/json

{
  "type": "PREMIUM",
  "startDate": "2024-01-24",
  "endDate": "2025-01-24",
  "price": 50.0
}

# Réponse (200 OK)
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "status": "ACTIVE",
  "currentSubscription": {
    "id": 10,
    "type": "PREMIUM",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 50.0,
    "active": true
  },
  "updatedAt": "2024-01-24T14:20:33.789012"
}
```

### Exemple: Abonnement BASIC
```http
POST /api/adherents/2/subscription
Content-Type: application/json

{
  "type": "BASIC",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "price": 20.0
}

# currentSubscription.type = "BASIC" (3 séances max/semaine)
```

---

## 4️⃣ Gestion des statuts

### Suspendre un adhérent
```http
POST /api/adherents/1/suspend?reason=Paiement+en+retard

# Réponse (200 OK)
{
  "id": 1,
  "status": "SUSPENDED",
  "suspendedReason": "Paiement en retard",
  "suspendedDate": "2024-01-24T15:10:00.123456",
  ...
}
```

### Réactiver un adhérent
```http
POST /api/adherents/1/reactivate

# Réponse (200 OK)
{
  "id": 1,
  "status": "ACTIVE",
  "suspendedReason": null,
  "suspendedDate": null,
  ...
}
```

---

## 5️⃣ Vérifications et éligibilité

### Vérifier un abonnement actif
```http
GET /api/adherents/1/has-active-subscription

# Réponse (200 OK)
true

# Ou
false
```

### Vérifier l'éligibilité pour une séance
```http
GET /api/adherents/1/eligible-for-session

# Réponse (200 OK)
true

# Conditions:
# - Statut = ACTIVE
# - Abonnement existant et actif
# - Pas suspendu
```

### Obtenir la limite hebdomadaire de séances
```http
GET /api/adherents/1/weekly-session-limit

# Réponse (200 OK)
{
  "Integer": 2147483647  # Integer.MAX_VALUE pour PREMIUM
}

# Ou pour BASIC:
3

# Ou si pas d'abonnement:
0
```

---

## 6️⃣ Statistiques

### Obtenir les statistiques globales
```http
GET /api/adherents/statistics

# Réponse (200 OK)
{
  "activeAdherents": 45,
  "suspendedAdherents": 3,
  "expiredAdherents": 2,
  "deactivatedAdherents": 1,
  "totalAdherents": 51
}
```

---

## 🔴 Gestion des erreurs

### Adhérent non trouvé
```http
GET /api/adherents/999

# Réponse (404 Not Found)
{
  "timestamp": "2024-01-24T12:30:45.123456",
  "status": 404,
  "error": "Resource Not Found",
  "message": "Adhérent non trouvé avec l'ID: 999",
  "path": "/api/adherents/999"
}
```

### Email déjà existant
```http
POST /api/adherents
Content-Type: application/json

{
  "email": "jean.dupont@example.com",  # Email déjà utilisé
  ...
}

# Réponse (409 Conflict)
{
  "timestamp": "2024-01-24T12:30:45.123456",
  "status": 409,
  "error": "Resource Already Exists",
  "message": "Un adhérent avec l'email jean.dupont@example.com existe déjà",
  "path": "/api/adherents"
}
```

### Erreur de validation
```http
POST /api/adherents
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "invalid-email",  # Email invalide
  ...
}

# Réponse (400 Bad Request)
{
  "timestamp": "2024-01-24T12:30:45.123456",
  "status": 400,
  "error": "Validation Failed",
  "message": "Erreurs de validation",
  "validationErrors": {
    "email": "L'email doit être valide",
    "phoneNumber": "Le numéro de téléphone est invalide"
  },
  "path": "/api/adherents"
}
```

### Opération invalide
```http
POST /api/adherents/1/reactivate

# Si l'adhérent n'est pas suspendu
# Réponse (400 Bad Request)
{
  "timestamp": "2024-01-24T12:30:45.123456",
  "status": 400,
  "error": "Invalid Operation",
  "message": "Seul un adhérent suspendu peut être réactivé",
  "path": "/api/adherents/1/reactivate"
}
```

---

## 🧪 Exemples complets avec cURL

### Créer un adhérent complet
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
  }'
```

### Attribuer un abonnement
```bash
curl -X POST http://localhost:8080/api/adherents/1/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PREMIUM",
    "startDate": "2024-01-24",
    "endDate": "2025-01-24",
    "price": 50.0
  }'
```

### Vérifier l'éligibilité
```bash
curl http://localhost:8080/api/adherents/1/eligible-for-session
```

### Suspendre et réactiver
```bash
# Suspendre
curl -X POST "http://localhost:8080/api/adherents/1/suspend?reason=Paiement+en+retard"

# Réactiver
curl -X POST http://localhost:8080/api/adherents/1/reactivate
```

### Rechercher et afficher
```bash
curl http://localhost:8080/api/adherents/search?name=Dupont
curl http://localhost:8080/api/adherents/status/ACTIVE
curl http://localhost:8080/api/adherents/statistics
```

---

## 📈 Tableau de bord des endpoints

| Méthode | Endpoint | Description | Statut |
|---------|----------|-------------|--------|
| POST | /api/adherents | Créer adhérent | 201 |
| GET | /api/adherents/{id} | Récupérer adhérent | 200 |
| GET | /api/adherents/email/{email} | Récupérer par email | 200 |
| PUT | /api/adherents/{id} | Mettre à jour | 200 |
| DELETE | /api/adherents/{id} | Désactiver | 204 |
| GET | /api/adherents/active | Lister actifs | 200 |
| GET | /api/adherents/search | Rechercher | 200 |
| GET | /api/adherents/status/{status} | Par statut | 200 |
| POST | /api/adherents/{id}/subscription | Attribuer abonnement | 200 |
| POST | /api/adherents/{id}/suspend | Suspendre | 200 |
| POST | /api/adherents/{id}/reactivate | Réactiver | 200 |
| GET | /api/adherents/{id}/has-active-subscription | Vérifier abonnement | 200 |
| GET | /api/adherents/{id}/eligible-for-session | Vérifier éligibilité | 200 |
| GET | /api/adherents/{id}/weekly-session-limit | Limite séances | 200 |
| GET | /api/adherents/statistics | Statistiques | 200 |

---

**Total: 26 endpoints REST**

*Dernière mise à jour: 24 janvier 2026*
