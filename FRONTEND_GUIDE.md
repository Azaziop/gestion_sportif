# 🎨 Frontend TypeScript - Guide Complet

## 📋 Vue d'ensemble

Le frontend est une application **React TypeScript** moderne utilisant **Vite** comme outil de build. L'application communique avec le backend Spring Boot via des API REST.

---

## 🚀 Démarrage rapide

### Option 1 : Script automatique
```bash
./start-frontend.sh
```

### Option 2 : Manuel
```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur **http://localhost:5173**

---

## 📁 Architecture du projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── AdherentList.tsx       # Liste avec pagination et filtres
│   │   ├── AdherentForm.tsx       # Formulaire de création
│   │   └── AdherentDetails.tsx    # Vue détails + actions
│   ├── services/
│   │   └── api.ts                 # Client Axios + toutes les méthodes API
│   ├── types/
│   │   └── index.ts               # Types et interfaces TypeScript
│   ├── App.tsx                    # Composant racine avec routing
│   ├── main.tsx                   # Point d'entrée
│   └── index.css                  # Styles Tailwind
├── .env                           # Variables d'environnement
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🛠️ Stack technique

| Technologie | Version | Usage |
|------------|---------|-------|
| React | 18.3+ | Framework UI |
| TypeScript | 5.6+ | Typage statique |
| Vite | 7.3+ | Build tool & dev server |
| Tailwind CSS | 3.4+ | Framework CSS utility-first |
| Axios | 1.7+ | Client HTTP |
| PostCSS | 8.4+ | Transformation CSS |

---

## 🎯 Fonctionnalités implémentées

### 1️⃣ Liste des adhérents (`AdherentList.tsx`)
- ✅ Affichage paginé (10 par page)
- ✅ Filtrage par statut (ALL, ACTIVE, INACTIVE, SUSPENDED)
- ✅ Badges colorés pour les statuts
- ✅ Navigation pagination (précédent/suivant)
- ✅ Actions : Voir détails, Supprimer
- ✅ Confirmation de suppression

### 2️⃣ Formulaire de création (`AdherentForm.tsx`)
- ✅ Validation des champs requis
- ✅ Grid layout responsive (2-3 colonnes)
- ✅ Gestion des erreurs API
- ✅ États de chargement
- ✅ Champs :
  - Prénom, Nom
  - Email (unique)
  - Téléphone
  - Date de naissance
  - Adresse complète (rue, ville, code postal, pays)

### 3️⃣ Détails de l'adhérent (`AdherentDetails.tsx`)
- ✅ Vue complète des informations personnelles
- ✅ Affichage de l'abonnement actif
- ✅ Informations de suspension (si applicable)
- ✅ Actions contextuelles :
  - Suspendre (avec raison)
  - Réactiver
- ✅ Dates de création/modification

---

## 🔌 Service API (`api.ts`)

Le service API centralise toutes les communications avec le backend :

```typescript
adherentService.createAdherent(data)           // POST /api/adherents
adherentService.getAdherent(id)                // GET /api/adherents/{id}
adherentService.getAdherentByEmail(email)      // GET /api/adherents/email/{email}
adherentService.updateAdherent(id, data)       // PUT /api/adherents/{id}
adherentService.deleteAdherent(id)             // DELETE /api/adherents/{id}
adherentService.getAllAdherents(page, size)    // GET /api/adherents?page=0&size=10
adherentService.getAdherentsByStatus(status)   // GET /api/adherents/status/{status}
adherentService.suspendAdherent(id, reason)    // PATCH /api/adherents/{id}/suspend
adherentService.reactivateAdherent(id)         // PATCH /api/adherents/{id}/reactivate
adherentService.getStatistics()                // GET /api/adherents/statistics
```

---

## 📐 Types TypeScript (`types/index.ts`)

Tous les types correspondent exactement aux entités Java :

### Enums
```typescript
enum AdherentStatus { ACTIVE, INACTIVE, SUSPENDED }
enum SubscriptionType { BASIC, STANDARD, PREMIUM }
```

### Interfaces principales
```typescript
interface Adherent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  status: AdherentStatus;
  currentSubscription: Subscription | null;
  createdAt: string;
  updatedAt: string;
  suspendedReason?: string;
  suspendedDate?: string;
}

interface Subscription {
  id: number;
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  price: number;
  active: boolean;
}
```

---

## 🎨 Design et UX

### Couleurs des statuts
- 🟢 **ACTIVE** : Vert (bg-green-100)
- ⚪ **INACTIVE** : Gris (bg-gray-100)
- 🔴 **SUSPENDED** : Rouge (bg-red-100)

### Couleurs des abonnements
- 🔵 **BASIC** : Bleu (bg-blue-100)
- 🟣 **STANDARD** : Violet (bg-purple-100)
- 🟡 **PREMIUM** : Jaune (bg-yellow-100)

### Layout
- Header bleu (#2563eb) avec titre
- Container centré avec max-width
- Cartes avec ombres (shadow-md)
- Footer gris foncé

---

## ⚙️ Configuration

### Variables d'environnement (`.env`)
```env
VITE_API_URL=http://localhost:8080/api
```

### Tailwind Config (`tailwind.config.js`)
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

---

## 🔄 CORS - Configuration Backend

Le backend a été mis à jour pour autoriser les requêtes depuis le frontend :

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",  // Vite dev server
        "http://localhost:3000"   // Alternative
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## 📝 Scripts npm disponibles

```json
{
  "dev": "vite",              // Serveur de développement
  "build": "tsc -b && vite build",  // Build production
  "preview": "vite preview",   // Prévisualiser le build
  "lint": "eslint ."          // Vérification du code
}
```

---

## 🧪 Workflow de développement

1. **Démarrer le backend** :
   ```bash
   cd demo
   ./mvnw spring-boot:run
   ```

2. **Démarrer le frontend** :
   ```bash
   cd frontend
   npm run dev
   ```

3. **Accéder à l'application** :
   - Frontend : http://localhost:5173
   - Backend API : http://localhost:8080/api
   - H2 Console : http://localhost:8080/h2-console

---

## 🐛 Debugging

### Erreur CORS
Si vous voyez des erreurs CORS dans la console :
1. Vérifiez que le backend est démarré
2. Vérifiez la configuration CORS dans `SecurityConfig.java`
3. Vérifiez que `VITE_API_URL` est correct dans `.env`

### Erreur 404 API
1. Vérifiez que le backend est accessible sur http://localhost:8080
2. Testez manuellement : `curl http://localhost:8080/api/adherents`

### Erreur de compilation TypeScript
1. Vérifiez que tous les imports sont corrects
2. Lancez `npm run build` pour voir les erreurs détaillées

---

## 📦 Build pour production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/` :
- HTML, CSS, JS minifiés
- Assets optimisés
- Prêt pour déploiement

Pour tester le build :
```bash
npm run preview
```

---

## 🔐 Sécurité

- Les endpoints `/api/adherents/**` sont publics (pas d'authentification requise)
- CORS configuré pour localhost uniquement
- Validation côté client ET serveur
- Protection CSRF désactivée (à activer en production)

---

## 📈 Améliorations futures possibles

- [ ] Authentification JWT
- [ ] Gestion des abonnements (création, modification)
- [ ] Upload de certificats médicaux
- [ ] Dashboard avec statistiques
- [ ] Recherche avancée
- [ ] Export CSV/PDF
- [ ] Notifications temps réel
- [ ] Mode sombre
- [ ] Tests unitaires (Jest + React Testing Library)
- [ ] Tests E2E (Playwright)

---

## 📞 Support

Pour toute question :
1. Consultez le README du backend : `demo/README.md`
2. Vérifiez les endpoints : `demo/API_ENDPOINTS.md`
3. Examinez les logs du backend dans `demo/logs/`
