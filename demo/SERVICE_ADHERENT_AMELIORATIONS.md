# Améliorations du Service Adhèrent - Conformité Cahier des Charges

## 📋 Résumé des améliorations

Les modifications suivantes ont été apportées pour rendre le Service Adhèrent 100% conforme au cahier des charges.

---

## ✅ 1. Validation du Certificat Médical

### Modifications dans `Adherent.java`

**Nouveaux champs :**
- `medicalCertificate` : Maintenant **obligatoire** (`nullable = false`)
- `medicalCertificateExpiryDate` : Date d'expiration du certificat (**obligatoire**)

**Nouvelles méthodes :**
```java
public boolean hasMedicalCertificateValid() {
    if (medicalCertificate == null || medicalCertificateExpiryDate == null) {
        return false;
    }
    return !LocalDate.now().isAfter(medicalCertificateExpiryDate);
}
```

**Validation améliorée :**
```java
public boolean isEligibleForSession() {
    return hasActiveSubscription() && 
           status != AdherentStatus.SUSPENDED && 
           hasMedicalCertificateValid();
}
```

Un adhérent peut maintenant s'inscrire à une séance **uniquement si** :
- ✅ Son abonnement est actif
- ✅ Il n'est pas suspendu
- ✅ Son certificat médical est valide (non expiré)

---

## ✅ 2. Job Batch pour Expiration Automatique des Abonnements

### Nouveau fichier : `SubscriptionExpirationScheduler.java`

**Fonctionnalité :**
- Exécution **automatique tous les jours à minuit** (00h00)
- Passe les adhérents en statut `EXPIRED` quand leur abonnement arrive à échéance

**Cron Expression :**
```java
@Scheduled(cron = "0 0 0 * * ?")
public void scheduleExpiredSubscriptionsJob()
```

**Activation :**
- Ajout de `@EnableScheduling` dans `DemoApplication.java`

**Flow d'exécution :**
```
Minuit (00h00)
    ↓
Scheduler lance le Job Batch
    ↓
Recherche des adhérents avec abonnement expiré
    ↓
Mise à jour automatique du statut → EXPIRED
    ↓
Logs dans la console
```

---

## ✅ 3. Gestion des Limites de Séances Hebdomadaires

### Modifications dans `Subscription.java`

**Nouveaux champs :**
```java
private Integer weeklySessionsUsed = 0;
private Integer lastSessionWeek;
```

**Nouvelles méthodes :**

| Méthode | Description |
|---------|-------------|
| `canBookSession()` | Vérifie si l'adhérent peut réserver une séance supplémentaire |
| `incrementWeeklySessionCount()` | Incrémente le compteur après une réservation |
| `decrementWeeklySessionCount()` | Décrémente en cas d'annulation |
| `getRemainingWeeklySessions()` | Retourne le nombre de séances restantes |
| `resetWeeklyCounterIfNeeded()` | Réinitialise automatiquement chaque nouvelle semaine |

**Logique de limitation :**
- **BASIC** : Maximum 3 séances par semaine
- **PREMIUM** : Illimité (retourne `Integer.MAX_VALUE`)

**Reset automatique :**
- Le compteur se réinitialise automatiquement chaque lundi (début de semaine)

**Exemple d'utilisation (pour Service Réservation futur) :**
```java
Subscription sub = adherent.getCurrentSubscription();

if (sub.canBookSession()) {
    // Créer la réservation
    sub.incrementWeeklySessionCount();
    // ...
} else {
    throw new IllegalStateException("Limite de séances hebdomadaires atteinte");
}
```

---

## ✅ 4. Validation Bean Validation (JSR 380)

### Annotations ajoutées sur les entités

#### `Adherent.java`
```java
@NotBlank(message = "Le prénom est obligatoire")
@Size(min = 2, max = 50)
private String firstName;

@Email(message = "L'email doit être valide")
private String email;

@Pattern(regexp = "^[+]?[0-9]{10,15}$")
private String phoneNumber;

@Past(message = "La date de naissance doit être dans le passé")
private LocalDate dateOfBirth;

@NotNull(message = "Le certificat médical est obligatoire")
private byte[] medicalCertificate;

@Future(message = "La date d'expiration doit être dans le futur")
private LocalDate medicalCertificateExpiryDate;
```

#### `Subscription.java`
```java
@NotNull(message = "Le type d'abonnement est obligatoire")
private SubscriptionType type;

@Positive(message = "Le prix doit être positif")
private Double price;
```

#### `AdherentController.java`
```java
@Validated // Activation de la validation au niveau du controller
public class AdherentController {
    
    @PostMapping
    public ResponseEntity<Adherent> createAdherent(@Valid @RequestBody Adherent adherent) {
        // ...
    }
}
```

**Avantages :**
- Validation automatique côté serveur
- Messages d'erreur personnalisés en français
- Retourne automatiquement un HTTP 400 (Bad Request) en cas d'erreur

---

## 📊 Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                   Service Adhèrent                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   Adherent   │──────│ Subscription │                     │
│  │              │ 1:1  │              │                     │
│  │ - firstName  │      │ - type       │ BASIC (3/semaine)  │
│  │ - lastName   │      │ - startDate  │ PREMIUM (illimité) │
│  │ - email      │      │ - endDate    │                     │
│  │ - medical... │      │ - price      │                     │
│  │ - photo      │      │ - sessions   │                     │
│  └──────────────┘      └──────────────┘                     │
│         │                      │                             │
│         ├──────────────────────┴────────────────┐           │
│         │                                        │           │
│  ┌──────▼──────┐                        ┌───────▼───────┐  │
│  │   Status    │                        │  Validation   │  │
│  │             │                        │               │  │
│  │ - ACTIVE    │                        │ - Certificat  │  │
│  │ - EXPIRED   │◄───┐                   │ - Email       │  │
│  │ - SUSPENDED │    │                   │ - Téléphone   │  │
│  │ - DEACTIVATED│   │                   │ - Date        │  │
│  └─────────────┘    │                   └───────────────┘  │
│                      │                                       │
│              ┌───────┴────────┐                             │
│              │  Batch Job     │                             │
│              │  (00h00)       │                             │
│              │                │                             │
│              │ Expire auto    │                             │
│              └────────────────┘                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Conformité Cahier des Charges

| Exigence | Avant | Maintenant | Statut |
|----------|-------|------------|--------|
| Cycle de vie membre | ✅ | ✅ | Complet |
| Données personnelles | ✅ | ✅ | Complet |
| Certificat médical | ⚠️ Optionnel | ✅ Obligatoire + validation date | **Amélioré** |
| Photo | ✅ | ✅ | Complet |
| Statut adhésion | ✅ | ✅ | Complet |
| Expiration automatique | ❌ | ✅ Batch quotidien | **Ajouté** |
| Types abonnement | ✅ | ✅ | Complet |
| Limites BASIC/PREMIUM | ⚠️ Défini | ✅ Implémenté + compteur | **Amélioré** |
| Validation stricte | ⚠️ Partielle | ✅ Bean Validation complète | **Amélioré** |
| Spring Batch | ✅ Config | ✅ Job + Scheduler | **Complété** |
| Spring AOP | ✅ | ✅ | Complet |
| Spring Security | ✅ | ✅ | Complet |
| PostgreSQL | ✅ | ✅ | Complet |

---

## 🚀 Prochaines Étapes (Services futurs)

### Service Cours (à implémenter)
- Définir les séances/cours avec titre, description, type
- Gérer les coaches et salles
- Capacité maximale par séance
- Éligibilité (séances premium uniquement pour abonnés premium)

### Service Réservation (à implémenter)
- Utiliser `subscription.canBookSession()` avant de créer une réservation
- Appeler `subscription.incrementWeeklySessionCount()` après réservation
- Appeler `subscription.decrementWeeklySessionCount()` en cas d'annulation
- Vérifier la capacité maximale
- Gérer la liste d'attente

**Communication entre services :**
- Service Réservation → appelle Service Adhèrent via REST pour vérifier l'éligibilité
- Service Adhèrent → publie événements JMS (ex: `AdherentSuspendedEvent`) vers Service Réservation

---

## 🧪 Tests Recommandés

### Tests à effectuer :

1. **Certificat médical expiré**
   ```bash
   POST /api/adherents
   {
     "medicalCertificateExpiryDate": "2025-01-01" // Date passée
   }
   → Doit échouer avec erreur validation
   ```

2. **Compteur séances hebdomadaires**
   ```java
   // Créer abonnement BASIC
   // Réserver 3 séances → OK
   // Réserver 4ème séance → canBookSession() = false
   ```

3. **Batch expiration**
   ```bash
   # Attendre minuit OU déclencher manuellement le job
   # Vérifier que les adhérents avec endDate < aujourd'hui passent en EXPIRED
   ```

4. **Validations**
   ```bash
   POST /api/adherents avec email invalide
   → HTTP 400 avec message d'erreur
   ```

---

## 📝 Nouveaux Endpoints Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/adherents` | GET | Liste paginée (inchangé) |
| `/api/adherents/{id}` | GET | Détails (inchangé) |
| `/api/adherents/{id}` | PUT | **Validation stricte** activée |
| `/api/adherents/{id}/subscription` | POST | **Validation stricte** activée |

---

## 🔧 Configuration

### Application Properties
Aucune nouvelle configuration requise. Le scheduler utilise la configuration par défaut de Spring Boot.

### Logs
Les logs du batch apparaîtront automatiquement dans la console :
```
[INFO] 🔄 Lancement automatique du job de traitement des abonnements expirés
[INFO] Démarrage du traitement des abonnements expirés
[INFO] Traitement des abonnements expirés terminé
[INFO] ✅ Job de traitement des abonnements expirés terminé avec succès
```

---

## 📚 Documentation Technique

### Nouvelles Classes Créées
1. `SubscriptionExpirationScheduler` - Scheduler Spring pour le batch quotidien

### Classes Modifiées
1. `Adherent` - Ajout certificat médical obligatoire + validations
2. `Subscription` - Ajout compteur séances hebdomadaires + méthodes
3. `AdherentController` - Activation validation `@Valid`
4. `DemoApplication` - Activation `@EnableScheduling`

### Dépendances Maven
Aucune nouvelle dépendance requise. Utilise :
- `spring-boot-starter-validation` (déjà présent)
- `spring-boot-starter-batch` (déjà présent)

---

## ✅ Conclusion

Le **Service Adhèrent est désormais 100% conforme** au cahier des charges avec :
- ✅ Validation stricte des données
- ✅ Certificat médical obligatoire et contrôle de validité
- ✅ Expiration automatique des abonnements
- ✅ Gestion complète des limites BASIC/PREMIUM
- ✅ Prêt pour intégration avec Service Cours et Service Réservation

**Compilation réussie :** ✅ `BUILD SUCCESS`
