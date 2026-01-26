# 🆘 Guide d'aide rapide - Service Adhérent

## Bienvenue! 👋

Vous avez des questions? Ce guide peut vous aider.

---

## 📖 Commencer par la bonne documentation

### 🚀 **Je veux démarrer le service**
→ Lire: [IMPLEMENTATION.md](IMPLEMENTATION.md)
```bash
# Résumé rapide:
docker-compose up -d          # Démarrer BD
./mvnw spring-boot:run        # Lancer service
curl http://localhost:8080/actuator/health  # Vérifier
```

### 🔌 **Je veux tester l'API**
→ Lire: [API_ENDPOINTS.md](API_ENDPOINTS.md)
```bash
# Exemple rapide:
curl -X POST http://localhost:8080/api/adherents \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jean","lastName":"Dupont","email":"jean@example.com",...}'
```

### 🧪 **Je veux faire des tests**
→ Lire: [TEST_GUIDE.md](TEST_GUIDE.md)
```bash
# Exécuter les tests:
./mvnw test
```

### 📚 **Je veux comprendre l'architecture**
→ Lire: [SERVICE_ADHERENT_README.md](SERVICE_ADHERENT_README.md)

### 🗺️ **Je suis perdu, par où commencer?**
→ Lire: [README_INDEX.md](README_INDEX.md)

---

## ❓ Questions fréquentes

### Installation
**Q: Quoi installer?**  
A: Java 17+, Maven 3.8+, et optionnellement Docker

**Q: Ça prend combien de temps?**  
A: ~5 minutes de setup, puis c'est prêt

### Démarrage
**Q: Le service ne démarre pas**  
A: Vérifier que PostgreSQL est en cours d'exécution:
```bash
docker-compose ps
```

**Q: Le port 8080 est utilisé**  
A: Changer dans `application.properties`: `server.port=8081`

### API
**Q: Combien d'endpoints?**  
A: 26 endpoints, voir [API_ENDPOINTS.md](API_ENDPOINTS.md)

**Q: Comment créer un adhérent?**  
A: 
```bash
POST /api/adherents
Content-Type: application/json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phoneNumber": "+33612345678",
  "dateOfBirth": "1990-01-15",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France"
}
```

### Tests
**Q: Comment tester?**  
A: 3 options:
1. Postman: Importer `postman_collection.json`
2. cURL: Voir les exemples
3. Tests: `./mvnw test`

---

## 🛠️ Commandes courantes

```bash
# Démarrer
./mvnw spring-boot:run

# Tester
./mvnw test

# Construire
./mvnw clean package

# Nettoyer
./mvnw clean

# Base de données
docker-compose up -d

# API
curl http://localhost:8080/api/adherents
```

---

## 🚨 Problèmes courants

| Problème | Solution |
|----------|----------|
| `Connection refused` | Vérifier PostgreSQL: `docker-compose ps` |
| `ClassNotFoundException` | Reconstruire: `./mvnw clean compile` |
| `Port already in use` | Changer le port dans `application.properties` |
| `Tables not created` | Vérifier `ddl-auto=update` dans `application.properties` |

---

## 📞 Besoin de plus d'aide?

| Sujet | Fichier |
|-------|---------|
| Installation | [IMPLEMENTATION.md](IMPLEMENTATION.md) |
| API | [API_ENDPOINTS.md](API_ENDPOINTS.md) |
| Tests | [TEST_GUIDE.md](TEST_GUIDE.md) |
| Architecture | [SERVICE_ADHERENT_README.md](SERVICE_ADHERENT_README.md) |
| Index | [README_INDEX.md](README_INDEX.md) |

---

## 🎯 Étapes suivantes

1. **Démarrer** → `./mvnw spring-boot:run`
2. **Tester** → Importer Postman ou utiliser cURL
3. **Lire** → La documentation complète
4. **Intégrer** → Avec d'autres microservices

---

**Bonne chance! 🚀**

*Date: 24 janvier 2026*
