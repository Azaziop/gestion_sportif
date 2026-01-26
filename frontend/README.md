# Frontend TypeScript - Gestion des Adhérents

Application React TypeScript pour la gestion des adhérents du club sportif.

## 🚀 Technologies

- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS
- **Axios** - Client HTTP

## 📦 Installation

```bash
cd frontend
npm install
```

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

### Build production
```bash
npm run build
```

## 🔧 Configuration

Créez un fichier `.env` à la racine du projet frontend :

```env
VITE_API_URL=http://localhost:8080/api
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/          # Composants React
│   │   ├── AdherentList.tsx      # Liste paginée des adhérents
│   │   ├── AdherentForm.tsx      # Formulaire de création
│   │   └── AdherentDetails.tsx   # Détails et actions
│   ├── services/            # Services API
│   │   └── api.ts                # Client HTTP et méthodes API
│   ├── types/               # Types TypeScript
│   │   └── index.ts              # Interfaces et enums
│   ├── App.tsx              # Composant principal
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── .env                     # Variables d'environnement
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎯 Fonctionnalités

### Liste des adhérents
- Affichage paginé des adhérents
- Filtrage par statut (ACTIVE, INACTIVE, SUSPENDED)
- Navigation par pagination

### Création d'adhérent
- Formulaire complet avec validation
- Tous les champs requis
- Gestion des erreurs

### Détails de l'adhérent
- Affichage complet des informations
- Informations d'abonnement
- Actions : Suspendre / Réactiver
- Raison de suspension

## 🔌 API Endpoints utilisés

- `POST /api/adherents` - Créer un adhérent
- `GET /api/adherents` - Liste paginée
- `GET /api/adherents/{id}` - Détails
- `GET /api/adherents/status/{status}` - Filtrage par statut
- `PUT /api/adherents/{id}` - Mettre à jour
- `DELETE /api/adherents/{id}` - Supprimer
- `PATCH /api/adherents/{id}/suspend` - Suspendre
- `PATCH /api/adherents/{id}/reactivate` - Réactiver

## 🎨 Interface utilisateur

L'application utilise Tailwind CSS pour un design moderne et responsive avec :
- Header bleu avec le titre de l'application
- Table responsive pour la liste des adhérents
- Formulaires avec grille 2/3 colonnes
- Badges de couleur pour les statuts et types d'abonnement
- Pagination intuitive

## 🛠️ Développement

### Prérequis
- Node.js 18+
- npm ou yarn
- Backend Spring Boot en cours d'exécution sur http://localhost:8080

### Scripts disponibles
- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérification ESLint

## 🔄 CORS

Assurez-vous que le backend autorise les requêtes CORS depuis http://localhost:5173

Dans `SecurityConfig.java`, vérifiez que CORS est configuré :

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOrigin("http://localhost:5173");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    // ...
}
```

## 📝 Types TypeScript

Tous les types sont définis dans `src/types/index.ts` et correspondent aux entités Java :

- `Adherent` - Entité adhérent complète
- `Subscription` - Informations d'abonnement
- `AdherentStatus` - Enum (ACTIVE, INACTIVE, SUSPENDED)
- `SubscriptionType` - Enum (BASIC, STANDARD, PREMIUM)
- `AdherentCreateRequest` - DTO de création
- `AdherentUpdateRequest` - DTO de mise à jour
- `PaginatedResponse<T>` - Réponse paginée générique

      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
