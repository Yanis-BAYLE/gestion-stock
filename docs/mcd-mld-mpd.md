# Modélisation de la base de données

Ce document présente la modélisation de la base de données de l'application de gestion de stock.

La modélisation est divisée en trois niveaux :

* **MCD** : modèle conceptuel de données ;
* **MLD** : modèle logique de données ;
* **MPD** : modèle physique de données.

---

## 1. Objectif de la base de données

La base de données doit permettre de gérer :

* les utilisateurs ;
* les rôles ;
* les catégories de produits ;
* les fournisseurs ;
* les produits ;
* les mouvements de stock ;
* les logs d'audit.

Elle doit aussi garantir certaines règles d'intégrité :

* une référence produit doit être unique ;
* une quantité de produit ne peut pas être négative ;
* une quantité de mouvement doit être positive ;
* un mouvement de stock doit être de type `IN` ou `OUT` ;
* un utilisateur doit avoir un rôle ;
* un produit peut être lié à une catégorie ;
* un produit peut être lié à un fournisseur.

---

# 2. MCD - Modèle conceptuel de données

## 2.1 Entité Role

Représente un rôle applicatif.

Exemples :

* `ADMIN`
* `GESTIONNAIRE`
* `LECTEUR`

Attributs :

| Attribut | Description         |
| -------- | ------------------- |
| id       | Identifiant du rôle |
| name     | Nom du rôle         |

---

## 2.2 Entité User

Représente un utilisateur de l'application.

Attributs :

| Attribut      | Description                              |
| ------------- | ---------------------------------------- |
| id            | Identifiant utilisateur                  |
| email         | Adresse email utilisée pour la connexion |
| password_hash | Mot de passe chiffré                     |
| created_at    | Date de création                         |
| updated_at    | Date de modification                     |

Relation :

* un utilisateur possède un rôle.

---

## 2.3 Entité Category

Représente une catégorie de produits.

Exemples :

* Informatique ;
* Bureau ;
* Consommables.

Attributs :

| Attribut   | Description                 |
| ---------- | --------------------------- |
| id         | Identifiant de la catégorie |
| name       | Nom de la catégorie         |
| created_at | Date de création            |
| updated_at | Date de modification        |

Relation :

* une catégorie peut contenir plusieurs produits.

---

## 2.4 Entité Supplier

Représente un fournisseur.

Attributs :

| Attribut   | Description                |
| ---------- | -------------------------- |
| id         | Identifiant du fournisseur |
| name       | Nom du fournisseur         |
| email      | Email du fournisseur       |
| phone      | Téléphone du fournisseur   |
| created_at | Date de création           |
| updated_at | Date de modification       |

Relation :

* un fournisseur peut fournir plusieurs produits.

---

## 2.5 Entité Product

Représente un produit stocké.

Attributs :

| Attribut         | Description                 |
| ---------------- | --------------------------- |
| id               | Identifiant du produit      |
| reference        | Référence unique du produit |
| name             | Nom du produit              |
| description      | Description du produit      |
| quantity         | Quantité disponible         |
| minimum_quantity | Seuil minimum de stock      |
| created_at       | Date de création            |
| updated_at       | Date de modification        |

Relations :

* un produit peut appartenir à une catégorie ;
* un produit peut être rattaché à un fournisseur ;
* un produit peut avoir plusieurs mouvements de stock.

---

## 2.6 Entité StockMovement

Représente une entrée ou une sortie de stock.

Attributs :

| Attribut      | Description                       |
| ------------- | --------------------------------- |
| id            | Identifiant du mouvement          |
| movement_type | Type de mouvement : `IN` ou `OUT` |
| quantity      | Quantité déplacée                 |
| reason        | Motif du mouvement                |
| created_at    | Date de création                  |

Relation :

* un mouvement concerne un seul produit.

---

## 2.7 Entité AuditLog

Représente une trace d'audit créée automatiquement.

Attributs :

| Attribut    | Description                      |
| ----------- | -------------------------------- |
| id          | Identifiant du log               |
| entity_name | Nom de l'entité modifiée         |
| entity_id   | Identifiant de l'entité modifiée |
| action_type | Type d'action                    |
| old_value   | Ancienne valeur                  |
| new_value   | Nouvelle valeur                  |
| created_at  | Date de création                 |

---

# 3. Relations du MCD

| Relation                                      | Cardinalité                 |
| --------------------------------------------- | --------------------------- |
| Un rôle possède plusieurs utilisateurs        | `Role 1,N User`             |
| Un utilisateur possède un seul rôle           | `User 1,1 Role`             |
| Une catégorie contient plusieurs produits     | `Category 0,N Product`      |
| Un produit appartient à zéro ou une catégorie | `Product 0,1 Category`      |
| Un fournisseur fournit plusieurs produits     | `Supplier 0,N Product`      |
| Un produit est lié à zéro ou un fournisseur   | `Product 0,1 Supplier`      |
| Un produit possède plusieurs mouvements       | `Product 0,N StockMovement` |
| Un mouvement concerne un seul produit         | `StockMovement 1,1 Product` |

---

# 4. Représentation textuelle du MCD

```text
ROLE
- id
- name

USER
- id
- email
- password_hash
- created_at
- updated_at
- role

CATEGORY
- id
- name
- created_at
- updated_at

SUPPLIER
- id
- name
- email
- phone
- created_at
- updated_at

PRODUCT
- id
- reference
- name
- description
- quantity
- minimum_quantity
- created_at
- updated_at
- category
- supplier

STOCK_MOVEMENT
- id
- movement_type
- quantity
- reason
- created_at
- product

AUDIT_LOG
- id
- entity_name
- entity_id
- action_type
- old_value
- new_value
- created_at
```

---

# 5. MLD - Modèle logique de données

Le modèle logique traduit les entités et relations en tables relationnelles.

```text
roles(
    id,
    name
)

users(
    id,
    email,
    password_hash,
    role_id,
    created_at,
    updated_at
)

categories(
    id,
    name,
    created_at,
    updated_at
)

suppliers(
    id,
    name,
    email,
    phone,
    created_at,
    updated_at
)

products(
    id,
    reference,
    name,
    description,
    quantity,
    minimum_quantity,
    category_id,
    supplier_id,
    created_at,
    updated_at
)

stock_movements(
    id,
    product_id,
    movement_type,
    quantity,
    reason,
    created_at
)

audit_logs(
    id,
    entity_name,
    entity_id,
    action_type,
    old_value,
    new_value,
    created_at
)
```

---

# 6. Clés primaires

| Table             | Clé primaire |
| ----------------- | ------------ |
| `roles`           | `id`         |
| `users`           | `id`         |
| `categories`      | `id`         |
| `suppliers`       | `id`         |
| `products`        | `id`         |
| `stock_movements` | `id`         |
| `audit_logs`      | `id`         |

---

# 7. Clés étrangères

| Table             | Colonne       | Référence        |
| ----------------- | ------------- | ---------------- |
| `users`           | `role_id`     | `roles(id)`      |
| `products`        | `category_id` | `categories(id)` |
| `products`        | `supplier_id` | `suppliers(id)`  |
| `stock_movements` | `product_id`  | `products(id)`   |

---

# 8. Contraintes d'intégrité

| Table             | Contrainte                       | Rôle                                           |
| ----------------- | -------------------------------- | ---------------------------------------------- |
| `roles`           | `name UNIQUE`                    | Empêcher les doublons de rôles                 |
| `users`           | `email UNIQUE`                   | Empêcher deux comptes avec le même email       |
| `categories`      | `name UNIQUE`                    | Empêcher les doublons de catégories            |
| `products`        | `reference UNIQUE`               | Empêcher deux produits avec la même référence  |
| `products`        | `quantity >= 0`                  | Empêcher un stock négatif                      |
| `products`        | `minimum_quantity >= 0`          | Empêcher un seuil négatif                      |
| `stock_movements` | `movement_type IN ('IN', 'OUT')` | Limiter les types de mouvements                |
| `stock_movements` | `quantity > 0`                   | Empêcher les mouvements sans quantité positive |

---

# 9. MPD - Modèle physique de données

La base de données est implémentée avec **MySQL**.

Les tables sont créées par Flyway dans le fichier :

```text
backend/src/main/resources/db/migration/V1__create_tables.sql
```

Les triggers sont créés dans :

```text
backend/src/main/resources/db/migration/V2__create_triggers.sql
```

Les données initiales sont insérées dans :

```text
backend/src/main/resources/db/migration/V3__seed_data.sql
```

---

# 10. Description des tables physiques

## 10.1 Table `roles`

| Colonne | Type          | Contraintes                 |
| ------- | ------------- | --------------------------- |
| `id`    | `BIGINT`      | Primary key, auto increment |
| `name`  | `VARCHAR(50)` | Not null, unique            |

---

## 10.2 Table `users`

| Colonne         | Type           | Contraintes                 |
| --------------- | -------------- | --------------------------- |
| `id`            | `BIGINT`       | Primary key, auto increment |
| `email`         | `VARCHAR(255)` | Not null, unique            |
| `password_hash` | `VARCHAR(255)` | Not null                    |
| `role_id`       | `BIGINT`       | Not null, foreign key       |
| `created_at`    | `TIMESTAMP`    | Default current timestamp   |
| `updated_at`    | `TIMESTAMP`    | Default current timestamp   |

---

## 10.3 Table `categories`

| Colonne      | Type           | Contraintes                 |
| ------------ | -------------- | --------------------------- |
| `id`         | `BIGINT`       | Primary key, auto increment |
| `name`       | `VARCHAR(100)` | Not null, unique            |
| `created_at` | `TIMESTAMP`    | Default current timestamp   |
| `updated_at` | `TIMESTAMP`    | Default current timestamp   |

---

## 10.4 Table `suppliers`

| Colonne      | Type           | Contraintes                 |
| ------------ | -------------- | --------------------------- |
| `id`         | `BIGINT`       | Primary key, auto increment |
| `name`       | `VARCHAR(150)` | Not null                    |
| `email`      | `VARCHAR(255)` | Nullable                    |
| `phone`      | `VARCHAR(50)`  | Nullable                    |
| `created_at` | `TIMESTAMP`    | Default current timestamp   |
| `updated_at` | `TIMESTAMP`    | Default current timestamp   |

---

## 10.5 Table `products`

| Colonne            | Type           | Contraintes                     |
| ------------------ | -------------- | ------------------------------- |
| `id`               | `BIGINT`       | Primary key, auto increment     |
| `reference`        | `VARCHAR(100)` | Not null, unique                |
| `name`             | `VARCHAR(150)` | Not null                        |
| `description`      | `TEXT`         | Nullable                        |
| `quantity`         | `INT`          | Not null, default 0, check >= 0 |
| `minimum_quantity` | `INT`          | Not null, default 0, check >= 0 |
| `category_id`      | `BIGINT`       | Foreign key nullable            |
| `supplier_id`      | `BIGINT`       | Foreign key nullable            |
| `created_at`       | `TIMESTAMP`    | Default current timestamp       |
| `updated_at`       | `TIMESTAMP`    | Default current timestamp       |

---

## 10.6 Table `stock_movements`

| Colonne         | Type           | Contraintes                   |
| --------------- | -------------- | ----------------------------- |
| `id`            | `BIGINT`       | Primary key, auto increment   |
| `product_id`    | `BIGINT`       | Not null, foreign key         |
| `movement_type` | `VARCHAR(10)`  | Not null, check `IN` ou `OUT` |
| `quantity`      | `INT`          | Not null, check > 0           |
| `reason`        | `VARCHAR(255)` | Nullable                      |
| `created_at`    | `TIMESTAMP`    | Default current timestamp     |

---

## 10.7 Table `audit_logs`

| Colonne       | Type           | Contraintes                 |
| ------------- | -------------- | --------------------------- |
| `id`          | `BIGINT`       | Primary key, auto increment |
| `entity_name` | `VARCHAR(100)` | Not null                    |
| `entity_id`   | `BIGINT`       | Not null                    |
| `action_type` | `VARCHAR(50)`  | Not null                    |
| `old_value`   | `TEXT`         | Nullable                    |
| `new_value`   | `TEXT`         | Nullable                    |
| `created_at`  | `TIMESTAMP`    | Default current timestamp   |

---

# 11. Triggers

## 11.1 Trigger `trg_products_updated_at`

Ce trigger met automatiquement à jour la colonne `updated_at` lorsqu'un produit est modifié.

Objectifs :

* éviter de gérer manuellement cette date dans le code Java ;
* garantir une date de modification cohérente côté base de données.

---

## 11.2 Trigger `trg_products_audit_update`

Ce trigger insère une ligne dans `audit_logs` après une modification d'un produit.

Objectifs :

* conserver une trace des modifications ;
* montrer l'utilisation d'un déclencheur SQL ;
* renforcer la traçabilité des opérations métier.

---

# 12. Choix de conception

## 12.1 Séparation des responsabilités

L'application est organisée en couches :

| Couche       | Rôle                                    |
| ------------ | --------------------------------------- |
| `controller` | Expose les endpoints REST               |
| `dto`        | Définit les données attendues en entrée |
| `entity`     | Représente les tables SQL               |
| `repository` | Accède aux données                      |
| `service`    | Contient la logique métier              |
| `security`   | Gère l'authentification et les rôles    |

---

## 12.2 Accès aux données

L'accès aux données passe par Spring Data JPA.

Le code métier n'utilise pas directement SQL pour les opérations courantes. Les repositories assurent l'indépendance entre la logique métier et le stockage.

---

## 12.3 Sécurité

Les utilisateurs sont stockés en base de données avec un mot de passe chiffré.

Les rôles limitent les actions disponibles :

| Rôle           | Permissions principales                      |
| -------------- | -------------------------------------------- |
| `ADMIN`        | Peut gérer les produits et supprimer         |
| `GESTIONNAIRE` | Peut créer, modifier et gérer les mouvements |
| `LECTEUR`      | Peut uniquement consulter                    |

---

## 12.4 Intégrité des données

L'intégrité est assurée à deux niveaux :

* côté application, avec la logique métier dans les services ;
* côté base de données, avec les contraintes SQL et les triggers.

Exemples :

* le service bloque une sortie de stock si la quantité disponible est insuffisante ;
* la base empêche une quantité négative avec une contrainte `CHECK`.

---

# 13. Conclusion

La base de données permet de représenter les éléments essentiels d'une gestion de stock simple.

Elle couvre les besoins suivants :

* gestion des produits ;
* classification par catégories ;
* association à des fournisseurs ;
* gestion des entrées et sorties de stock ;
* sécurisation par utilisateurs et rôles ;
* traçabilité minimale avec audit ;
* intégrité des données avec contraintes et clés étrangères.
