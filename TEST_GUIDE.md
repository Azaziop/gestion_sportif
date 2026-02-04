# Guide de Test - Corrections Subscription et Adherent

## Configuration
- **Backend**: Spring Boot 3 sur http://localhost:8080
- **Frontend**: React/TypeScript sur http://localhost:5173
- **Database**: PostgreSQL

---

## Test 1: Créer un Abonnement

### Étapes Frontend
1. Accédez à **Admin Dashboard** → **Gestion des Abonnements**
2. Remplissez le formulaire:
   - Type: Sélectionner **BASIC** ou **PREMIUM**
   - Prix: Entrer un montant (ex: 29.99€)
3. Cliquez **Créer**
4. Vérifiez que:
   - ✅ Le message "Abonnement créé avec succès" apparaît
   - ✅ L'abonnement s'ajoute au tableau
   - ✅ La badge affiche le type (BASIC=bleu, PREMIUM=violet)

### Vérification Backend (logs)
```
Création abonnement: BASIC
```

### Requête cURL
```bash
curl -X POST http://localhost:8080/api/subscriptions \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BASIC",
    "price": 29.99
  }' | jq '.'
```

**Réponse attendue**:
```json
{
  "id": 1,
  "type": "BASIC",
  "price": 29.99,
  "weeklySessions": 3,
  "weeklySessionsUsed": 0,
  "createdAt": "2025-01-31T...",
  "updatedAt": "2025-01-31T...",
  "active": true
}
```

---

## Test 2: Modifier un Abonnement

### Étapes Frontend
1. Dans **Gestion des Abonnements**
2. Trouvez l'abonnement créé dans le tableau
3. Cliquez sur la ligne (ou implémentez un bouton "Modifier")
4. Modifiez les champs:
   - Type: Changer de BASIC à PREMIUM
   - Prix: Changer le montant
5. Cliquez **Enregistrer**
6. Vérifiez que:
   - ✅ Les champs sont mis à jour
   - ✅ La badge change de couleur si le type change
   - ✅ `weeklySessions` devient illimité pour PREMIUM

### Requête cURL
```bash
curl -X PUT http://localhost:8080/api/subscriptions/1 \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PREMIUM",
    "price": 49.99
  }' | jq '.'
```

**Réponse attendue**:
```json
{
  "id": 1,
  "type": "PREMIUM",
  "price": 49.99,
  "weeklySessions": 2147483647,
  "weeklySessionsUsed": 0,
  "updatedAt": "2025-01-31T..."
}
```

---

## Test 3: Modifier un Adhérent avec Photo

### Étapes Frontend
1. Allez sur **Admin Dashboard** → **Liste des Adhérents**
2. Cliquez sur **Modifier** pour un adhérent
3. Scrollez jusqu'à la section **Photo de profil**
4. Cliquez sur l'upload et sélectionnez une image (JPEG, PNG, WebP)
5. Vérifiez:
   - ✅ Aperçu circulaire de la photo s'affiche
   - ✅ Modifiez également l'adresse (rue, ville, code postal, pays)
6. Cliquez **Enregistrer les modifications**
7. Vérifiez:
   - ✅ Message de succès
   - ✅ Photo réapparaît au rechargement

### Requête cURL (avec photo base64)
```bash
# Convertir une image en base64
base64 -i /chemin/vers/photo.jpg | tr -d '\n' > photo_base64.txt

# Envoyer la modification
curl -X PUT http://localhost:8080/api/adherents/1 \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France",
    "photo": "'"$(cat photo_base64.txt)"'"
  }' | jq '.'
```

**Réponse attendue**:
```json
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France",
  "photo": "...(base64)...",
  "currentSubscription": {...},
  "status": "ACTIVE",
  "updatedAt": "2025-01-31T..."
}
```

---

## Test 4: Vérifier les Photos dans AdherentList

### Étapes Frontend
1. Allez sur **Liste des Adhérents**
2. Vérifiez que:
   - ✅ Les photos s'affichent dans les avatars
   - ✅ Les initiales s'affichent si pas de photo
   - ✅ Les badges de type d'abonnement s'affichent à côté du statut

### Attendu
```
[Photo/Avatar] Jean Dupont | Status Badge | Subscription Type Badge
                            | ACTIVE (vert) | BASIC (bleu) ou PREMIUM (violet)
```

---

## Test 5: Vérifier AdherentDetails

### Étapes Frontend
1. Cliquez sur un adhérent dans la liste
2. Vérifiez les informations affichées:
   - ✅ Photo complète s'affiche
   - ✅ Adresse complète (rue, ville, code postal, pays)
   - ✅ Type d'abonnement avec limite (3 séances pour BASIC, ∞ pour PREMIUM)
   - ✅ Status avec couleur appropriée

### Attendu
```
┌─────────────────┐
│     [Photo]     │
│  Jean Dupont    │
│  jean@example.com│
│  +33 6 12 34... │
│  123 Rue...     │
│  75001 Paris    │
│  France         │
│                 │
│ Status: ACTIVE  │
│ Subscription:   │
│  BASIC - 3/sem  │
└─────────────────┘
```

---

## Checklist de Validation

### Backend
- [ ] Créer un abonnement fonctionne (weeklySessions initialisé)
- [ ] Modifier un abonnement fonctionne (type change les sessions)
- [ ] Modifier adresse adhérent fonctionne
- [ ] Modifier photo adhérent fonctionne
- [ ] Aucune erreur 500 dans les logs
- [ ] Compilation sans erreur (sauf warnings dépreciation)

### Frontend
- [ ] Upload photo fonctionne
- [ ] Prévisualisation photo s'affiche
- [ ] Photos s'affichent dans la liste
- [ ] Badges subscription s'affichent correctement
- [ ] Modification adhérent complète fonctionne
- [ ] Pas d'erreurs TypeScript/React dans console

### Base de Données
- [ ] Table subscriptions: colonne `weeklySessions` remplie
- [ ] Table adherents: colonne `photo` contient le base64
- [ ] Table adherents: colonnes adresse remplies correctement

---

## Dépannage

### Photo ne s'affiche pas
1. Vérifiez que le base64 est valide: `data:image/jpeg;base64,...`
2. Vérifiez la colonne `photo` en BD: `SELECT id, LENGTH(photo) FROM adherents;`
3. Check logs backend pour les erreurs

### Subscription creation échoue
1. Vérifiez le type envoyé: `"BASIC"` ou `"PREMIUM"` (majuscules)
2. Vérifiez le prix > 0
3. Vérifiez que ce type n'existe pas déjà

### Adresse ne s'affiche pas
1. Vérifiez `address`, `city`, `postalCode`, `country` ne sont pas null
2. Vérifiez la modification a été envoyée au backend
3. Vérifiez la réponse inclut tous les champs

---

## Commandes Utiles

### Vérifier les données de test
```sql
-- Abonnements
SELECT id, type, price, weeklySessions FROM subscriptions;

-- Adhérents avec photos
SELECT id, firstName, lastName, address, city, LENGTH(photo) as photo_size FROM adherents;

-- Adhérents avec abonnements
SELECT a.id, a.firstName, a.lastName, s.type, s.price, s.weeklySessions 
FROM adherents a 
LEFT JOIN subscriptions s ON a.subscription_id = s.id;
```

### Réinitialiser les données de test
```sql
DELETE FROM subscriptions WHERE id > 2;
DELETE FROM adherents WHERE photo IS NOT NULL;
```

---

## Notes
- Les photos sont stockées en base64 dans PostgreSQL (colonne BYTEA)
- Les modifications sont atomiques (une seule transaction)
- Aucune suppression/cascade n'est appliquée aux photos
- Les validations sont côté serveur (Spring Validation)
