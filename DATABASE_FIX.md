# Correction du Problème de Base de Données - Subscriptions

## Problème
```
ERROR: null value in column "end_date" of relation "subscriptions" violates not-null constraint
```

## Cause
La table `subscriptions` en base de données possède les colonnes `start_date` et `end_date` qui ne peuvent pas être NULL, mais l'entité Subscription Java n'avait pas ces champs, causant un conflit lors de l'insertion.

## Solution Appliquée

### 1. Mise à jour du modèle Subscription.java
- ✅ Ajout des champs `startDate` et `endDate` (type `LocalDate`)
- ✅ Initialisation automatique dans `@PrePersist`:
  - `startDate` = date du jour (LocalDate.now())
  - `endDate` = date du jour + 1 an (LocalDate.now().plusYears(1))
- ✅ Ajout des getters/setters

### 2. Réinitialiser la Base de Données

**Option A : Mode CREATE-DROP (Recommandé pour développement)**
```properties
# Dans application.properties:
spring.jpa.hibernate.ddl-auto=create-drop
```
Cela supprimera et recréera les tables au démarrage.

**Option B : Garder les données existantes**
Modifier directement en PostgreSQL:
```sql
-- Se connecter à la BD
psql -U postgres -d microservice_sprotif

-- Ajouter les colonnes s'elles n'existent pas
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 year';

-- Mettre à jour les contraintes
ALTER TABLE subscriptions 
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date SET NOT NULL;
```

**Option C : Script SQL complet (si les tables sont corrompues)**
```sql
-- Supprimer les tables (perte de données!)
DROP TABLE IF EXISTS adherent_subscriptions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS adherents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Redémarrer l'application pour recréer les tables
```

## Configuration Hibernate

Le fichier `application.properties` actuellement configuré avec:
```properties
spring.jpa.hibernate.ddl-auto=update
```

**Recommandations:**
- **Développement** : Changer en `create-drop` ou `create`
- **Production** : Utiliser `validate` + migrations Flyway/Liquibase

## Procédure Recommandée

### 1. Arrêter l'application backend
```bash
# Dans le terminal Run: DemoApplication, appuyez sur Ctrl+C
```

### 2. Réinitialiser PostgreSQL
```bash
# Option simple : Supprimer la DB et la recréer
dropdb -U postgres microservice_sprotif
createdb -U postgres microservice_sprotif
```

### 3. Relancer l'application
L'application recréera toutes les tables avec le bon schéma (y compris start_date et end_date)

### 4. Tester la création d'un abonnement
```bash
curl -X POST http://localhost:8080/api/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BASIC",
    "price": 29.99
  }'
```

## Structure de la Table Subscriptions (Après correction)

| Colonne | Type | NOT NULL | Notes |
|---------|------|----------|-------|
| id | BIGINT | ✓ | PK, Auto-increment |
| type | VARCHAR(20) | ✓ | ENUM: BASIC, PREMIUM |
| price | DOUBLE | ✓ | Montant en €  |
| weekly_sessions_limit | INTEGER |  | 3 pour BASIC, ∞ pour PREMIUM |
| start_date | DATE | ✓ | Date de début (auto: aujourd'hui) |
| end_date | DATE | ✓ | Date de fin (auto: +1 an) |
| created_at | TIMESTAMP | ✓ | Auto: maintenant |
| updated_at | TIMESTAMP |  | Auto: maintenant |
| weekly_sessions_used | INTEGER |  | Compteur sessions cette semaine |
| last_session_week | INTEGER |  | Numéro de la dernière semaine |

## Vérification en Base de Données

```sql
-- Vérifier la structure
\d subscriptions

-- Vérifier les données
SELECT id, type, price, start_date, end_date 
FROM subscriptions 
ORDER BY id DESC LIMIT 5;
```

## Status Après Correction

✅ Entité Subscription mise à jour avec start_date/end_date
✅ Initialisation automatique des dates
✅ Getters/Setters ajoutés
✅ Compilation Java sans erreurs
⏳ À faire : Réinitialiser la BD et tester la création d'abonnements

## Notes

- Les dates sont initialisées automatiquement via `@PrePersist` si non fournies
- Les abonnements sont par défaut valides pendant 1 an
- Les données historiques seront perdues si vous réinitialisez la BD
