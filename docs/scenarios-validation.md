# Scénarios de validation

Ce document décrit les scénarios utilisés pour valider le fonctionnement de l'application de gestion de stock.

Les validations couvrent :

* l'environnement technique ;
* les migrations de base de données ;
* les règles métier ;
* l'authentification ;
* les permissions utilisateurs ;
* l'interface web ;
* les tests automatisés.

---

## 1. Validation de l'environnement technique

| Scénario                | Action                                   | Résultat attendu                                          | Statut |
| ----------------------- | ---------------------------------------- | --------------------------------------------------------- | ------ |
| Démarrer MySQL          | Lancer `docker compose up -d`            | Les conteneurs `stock_mysql` et `stock_adminer` démarrent | OK     |
| Vérifier les conteneurs | Lancer `docker ps`                       | Les conteneurs sont visibles                              | OK     |
| Accéder à Adminer       | Ouvrir `http://localhost:8081`           | La page Adminer s'affiche                                 | OK     |
| Connexion à la base     | Utiliser `stock_user` / `stock_password` | La base `stock_db` est accessible                         | OK     |
| Lancer Spring Boot      | Lancer `BackendApplication`              | L'application démarre sur le port `8080`                  | OK     |

---

## 2. Validation des migrations Flyway

| Scénario                       | Action                                          | Résultat attendu                           | Statut |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------ | ------ |
| Exécuter les migrations        | Démarrer Spring Boot                            | Flyway exécute les scripts SQL             | OK     |
| Vérifier l'historique Flyway   | Exécuter `SELECT * FROM flyway_schema_history;` | Les migrations V1, V2 et V3 sont en succès | OK     |
| Vérifier les tables            | Consulter les tables dans Adminer               | Les tables sont créées                     | OK     |
| Vérifier les données initiales | Exécuter `SELECT * FROM products;`              | Les produits de test sont présents         | OK     |
| Vérifier les triggers          | Exécuter `SHOW TRIGGERS;`                       | Les triggers sont présents                 | OK     |

Tables attendues :

```text
roles
users
categories
suppliers
products
stock_movements
audit_logs
flyway_schema_history
```

---

## 3. Validation de la base de données

| Scénario                  | Requête SQL                      | Résultat attendu                                      | Statut |
| ------------------------- | -------------------------------- | ----------------------------------------------------- | ------ |
| Vérifier les rôles        | `SELECT * FROM roles;`           | Les rôles `ADMIN`, `GESTIONNAIRE`, `LECTEUR` existent | OK     |
| Vérifier les catégories   | `SELECT * FROM categories;`      | Les catégories de test existent                       | OK     |
| Vérifier les fournisseurs | `SELECT * FROM suppliers;`       | Les fournisseurs de test existent                     | OK     |
| Vérifier les produits     | `SELECT * FROM products;`        | Les produits de test existent                         | OK     |
| Vérifier les mouvements   | `SELECT * FROM stock_movements;` | Les mouvements créés sont enregistrés                 | OK     |
| Vérifier l'audit          | `SELECT * FROM audit_logs;`      | Les modifications produit sont tracées                | OK     |

---

## 4. Validation de l'authentification

Les comptes de test sont les suivants :

| Rôle         | Email                 | Mot de passe |
| ------------ | --------------------- | ------------ |
| ADMIN        | `admin@example.com`   | `admin123`   |
| GESTIONNAIRE | `manager@example.com` | `manager123` |
| LECTEUR      | `reader@example.com`  | `reader123`  |

### Test ADMIN

Commande :

```powershell
curl.exe -u admin@example.com:admin123 http://localhost:8080/api/me
```

Résultat attendu :

```json
{
  "email": "admin@example.com",
  "roles": ["ROLE_ADMIN"]
}
```

Statut : OK

### Test GESTIONNAIRE

Commande :

```powershell
curl.exe -u manager@example.com:manager123 http://localhost:8080/api/me
```

Résultat attendu :

```json
{
  "email": "manager@example.com",
  "roles": ["ROLE_GESTIONNAIRE"]
}
```

Statut : OK

### Test LECTEUR

Commande :

```powershell
curl.exe -u reader@example.com:reader123 http://localhost:8080/api/me
```

Résultat attendu :

```json
{
  "email": "reader@example.com",
  "roles": ["ROLE_LECTEUR"]
}
```

Statut : OK

---

## 5. Validation des permissions

| Scénario                    | Utilisateur  | Action                      | Résultat attendu                                      | Statut |
| --------------------------- | ------------ | --------------------------- | ----------------------------------------------------- | ------ |
| Lire les produits           | LECTEUR      | `GET /api/products`         | Autorisé                                              | OK     |
| Créer un produit            | LECTEUR      | `POST /api/products`        | Refusé avec `403 Forbidden`                           | OK     |
| Supprimer un produit        | GESTIONNAIRE | `DELETE /api/products/{id}` | Refusé avec `403 Forbidden`                           | OK     |
| Créer un mouvement de stock | GESTIONNAIRE | `POST /api/stock-movements` | Autorisé                                              | OK     |
| Modifier un produit         | GESTIONNAIRE | `PUT /api/products/{id}`    | Autorisé                                              | OK     |
| Supprimer un produit        | ADMIN        | `DELETE /api/products/{id}` | Autorisé si le produit n'est pas lié à des mouvements | OK     |

---

## 6. Test : un lecteur ne peut pas créer de produit

Commande :

```powershell
curl.exe -u reader@example.com:reader123 `
  -X POST http://localhost:8080/api/products `
  -H "Content-Type: application/json" `
  --data-raw '{"reference":"TEST-001","name":"Produit test","description":"test","quantity":1,"minimumQuantity":1,"categoryId":1,"supplierId":1}'
```

Résultat attendu :

```text
403 Forbidden
```

Résultat obtenu :

```text
403 Forbidden
```

Statut : OK

---

## 7. Test : un gestionnaire ne peut pas supprimer un produit

Commande :

```powershell
curl.exe -u manager@example.com:manager123 `
  -X DELETE http://localhost:8080/api/products/1
```

Résultat attendu :

```text
403 Forbidden
```

Résultat obtenu :

```text
403 Forbidden
```

Statut : OK

---

## 8. Test : un gestionnaire peut créer un mouvement de stock

Commande :

```powershell
$body = @{
    productId = 1
    movementType = "IN"
    quantity = 3
    reason = "Test securite"
} | ConvertTo-Json

$pair = "manager@example.com:manager123"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [Convert]::ToBase64String($bytes)

$headers = @{
    Authorization = "Basic $base64"
}

Invoke-RestMethod `
    -Uri "http://localhost:8080/api/stock-movements" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body
```

Résultat attendu :

* le mouvement est créé ;
* la quantité du produit augmente ;
* une ligne est ajoutée dans `stock_movements` ;
* une ligne d'audit est ajoutée dans `audit_logs`.

Résultat obtenu :

```text
movementType : IN
quantity     : 3
reason       : Test securite
```

Statut : OK

---

## 9. Validation des produits

| Scénario              | Action                                        | Résultat attendu                | Statut |
| --------------------- | --------------------------------------------- | ------------------------------- | ------ |
| Afficher les produits | Ouvrir `products.html`                        | La liste des produits s'affiche | OK     |
| Ajouter un produit    | Remplir le formulaire produit                 | Le produit est créé             | OK     |
| Modifier un produit   | Cliquer sur `Modifier`                        | Les données sont mises à jour   | OK     |
| Supprimer un produit  | Cliquer sur `Supprimer` avec un admin         | Le produit est supprimé         | OK     |
| Référence dupliquée   | Créer un produit avec une référence existante | La création est refusée         | OK     |

---

## 10. Validation des mouvements de stock

| Scénario                  | Action                                                 | Résultat attendu                           | Statut |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------ | ------ |
| Entrée de stock           | Créer un mouvement `IN`                                | La quantité du produit augmente            | OK     |
| Sortie de stock valide    | Créer un mouvement `OUT` inférieur au stock disponible | La quantité du produit diminue             | OK     |
| Sortie de stock invalide  | Créer un mouvement `OUT` supérieur au stock disponible | L'application retourne `Stock insuffisant` | OK     |
| Historique des mouvements | Consulter `stock_movements`                            | Le mouvement est enregistré                | OK     |
| Audit SQL                 | Modifier une quantité produit                          | Une ligne est ajoutée dans `audit_logs`    | OK     |

Requêtes SQL de vérification :

```sql
SELECT * FROM stock_movements;
SELECT * FROM products;
SELECT * FROM audit_logs;
```

---

## 11. Validation de l'interface web

| Scénario               | Rôle             | Résultat attendu                                               | Statut |
| ---------------------- | ---------------- | -------------------------------------------------------------- | ------ |
| Connexion lecteur      | LECTEUR          | Le lecteur voit les produits en lecture seule                  | OK     |
| Connexion gestionnaire | GESTIONNAIRE     | Le gestionnaire peut ajouter, modifier et créer des mouvements | OK     |
| Connexion admin        | ADMIN            | L'administrateur peut modifier et supprimer                    | OK     |
| Déconnexion            | Tous             | L'utilisateur est redirigé vers la page de connexion           | OK     |
| Action interdite       | Rôle insuffisant | Un message d'erreur clair est affiché                          | OK     |

---

## 12. Validation de l'accessibilité

| Élément vérifié     | Résultat attendu                                          | Statut |
| ------------------- | --------------------------------------------------------- | ------ |
| Labels des champs   | Chaque champ possède un label associé                     | OK     |
| Messages dynamiques | Les messages utilisent `aria-live`                        | OK     |
| Navigation clavier  | Les liens, boutons et champs sont accessibles au clavier  | OK     |
| Contraste           | Le texte reste lisible                                    | OK     |
| Titres              | Les pages utilisent des titres `h1`, `h2`, `h3` cohérents | OK     |
| Boutons             | Les actions principales sont identifiables                | OK     |

---

## 13. Tests automatisés

Les tests automatisés sont lancés avec :

```powershell
cd C:\Users\yanis\Desktop\gestion-stock\backend
.\mvnw.cmd test
```

Résultat obtenu :

```text
Tests run: 7
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

---

## 14. Tests unitaires réalisés

| Classe de test             | Scénario testé                                 | Résultat |
| -------------------------- | ---------------------------------------------- | -------- |
| `ProductServiceTest`       | Création d'un produit avec une référence libre | OK       |
| `ProductServiceTest`       | Refus d'une référence déjà utilisée            | OK       |
| `StockMovementServiceTest` | Entrée de stock                                | OK       |
| `StockMovementServiceTest` | Sortie de stock valide                         | OK       |
| `StockMovementServiceTest` | Sortie refusée si stock insuffisant            | OK       |
| `StockMovementServiceTest` | Mouvement refusé si produit inexistant         | OK       |

---

## 15. Conclusion de validation

Les scénarios de validation montrent que l'application répond aux besoins principaux :

* les données sont persistées en base MySQL ;
* les tables sont créées automatiquement par Flyway ;
* les contraintes SQL empêchent les données invalides ;
* les triggers assurent une traçabilité minimale ;
* les utilisateurs sont authentifiés ;
* les rôles limitent les actions disponibles ;
* les règles métier critiques sont testées automatiquement ;
* l'interface permet d'utiliser l'application sans passer directement par l'API.
