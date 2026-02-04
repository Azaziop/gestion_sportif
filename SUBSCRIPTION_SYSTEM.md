# Système de Gestion des Abonnements

## Vue d'ensemble
Le système gère les types d'abonnements (BASIC, PREMIUM) avec des limites de séances hebdomadaires et les statuts d'adhésion (ACTIF, EXPIRÉ, SUSPENDU, DÉSACTIVÉ).

## Types d'Abonnements

### BASIC
- **Limites**: 3 séances par semaine
- **Cas d'usage**: Adhérents occasionnels
- **Réservation**: Vérification automatique du nombre de séances utilisées

### PREMIUM
- **Limites**: Illimité
- **Cas d'usage**: Adhérents très actifs
- **Réservation**: Aucune limite de réservation

## Statuts d'Adhésion

| Statut | Description | Couleur |
|--------|-------------|---------|
| **ACTIVE** | Adhésion valide et actuelle | Vert ✅ |
| **EXPIRED** | L'abonnement a expiré | Orange ⏱️ |
| **SUSPENDED** | Adhésion temporairement suspendue | Rouge 🚫 |
| **DEACTIVATED** | Compte désactivé/supprimé | Gris ❌ |

## Gestion des Réservations

### Vérification avant réservation
```java
public boolean canBookSession() {
    // Vérification du statut actif
    if (!isActive()) return false;
    
    // Réinitialisation du compteur si nouvelle semaine
    resetWeeklyCounterIfNeeded();
    
    // Premium: toujours autorisé
    if (type == PREMIUM) return true;
    
    // Basic: vérifier la limite
    return weeklySessionsUsed < 3;
}
```

### Compteur hebdomadaire
- Réinitialisé automatiquement chaque semaine
- Suivi via `weeklySessionsUsed` et `lastSessionWeek`
- Incrémenté à chaque réservation réussie
- Peut être décrémenté en cas d'annulation

## Endpoints API

### Gestion des Types d'Abonnement
```
GET /api/subscriptions/types/available
Retourne: ["BASIC", "PREMIUM"]
```

### Gestion des Abonnements
```
GET /api/subscriptions                   # Lister tous les abonnements (Public)
POST /api/subscriptions                  # Créer un abonnement (Admin)
GET /api/subscriptions/{id}              # Obtenir un abonnement (Public)
PUT /api/subscriptions/{id}              # Mettre à jour un abonnement (Admin)
DELETE /api/subscriptions/{id}           # Supprimer un abonnement (Admin)
PATCH /api/subscriptions/{id}/price      # Mettre à jour le prix (Admin)
GET /api/subscriptions/type/{type}       # Obtenir par type (Public)
```

## Frontend - Composants

### SubscriptionManager
- Formulaire de création/modification avec dropdown de type
- Affichage du type avec badge coloré (bleu=BASIC, violet=PREMIUM)
- Affichage de la limite de séances/semaine
- Actions de suppression pour les admins

### AdherentDetails
- Affichage du type d'abonnement avec limite hebdomadaire
- Statut actif/inactif avec indicateur visuel
- Information sur la limite (3 séances vs illimité)

### AdherentList
- Statut d'adhésion avec couleur (ACTIVE=vert, SUSPENDED=rouge, etc.)
- Type d'abonnement avec badge (BASIC=bleu, PREMIUM=violet)
- Filtrage par statut (ACTIVE, EXPIRED, SUSPENDED, DEACTIVATED)

## Base de Données

### Table `subscriptions`
```sql
- id (PK)
- type (ENUM: BASIC, PREMIUM)
- price (Double)
- weekly_sessions_limit (Integer, nullable)
- weekly_sessions_used (Integer)
- last_session_week (Integer)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## Flux de Travail Typique

1. **Admin crée les types d'abonnement**
   - BASIC: 9.99€/mois, 3 séances/semaine
   - PREMIUM: 19.99€/mois, illimité

2. **Adhérent choisit un abonnement**
   - Lors de son inscription
   - Le système associe l'abonnement à son profil

3. **Système gère les réservations**
   - Vérification automatique du nombre de séances
   - Incrémentation du compteur hebdomadaire
   - Réinitialisation chaque semaine

4. **Admin peut modifier les statuts**
   - Suspendre un adhérent (ACTIVE → SUSPENDED)
   - Réactiver un adhérent (SUSPENDED → ACTIVE)
   - Gérer l'expiration (ACTIVE → EXPIRED)

## Sécurité

- Les endpoints de **lecture** des abonnements sont **publics** (pas d'authentification requise)
- Les endpoints de **création/modification/suppression** nécessitent le rôle **ADMIN**
- Les adhérents ne peuvent voir que leurs propres réservations
- Admin peut gérer tous les abonnements et statuts
