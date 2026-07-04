# Modélisation de la base de données

Ce document présente la modélisation de la base de données de l'application de gestion de stock.

La modélisation est divisée en trois niveaux :

- MCD : modèle conceptuel de données ;
- MLD : modèle logique de données ;
- MPD : modèle physique de données.

## 1. Objectif de la base de données

La base de données doit permettre de gérer :

- les utilisateurs ;
- les rôles ;
- les catégories de produits ;
- les fournisseurs ;
- les produits ;
- les mouvements de stock ;
- les logs d'audit.

Elle doit aussi garantir certaines règles d'intégrité :

- une référence produit doit être unique ;
- une quantité de produit ne peut pas être négative ;
- une quantité de mouvement doit être positive ;
- un mouvement de stock doit être de type `IN` ou `OUT` ;
- un utilisateur doit avoir un rôle ;
- un produit peut être lié à une catégorie ;
- un produit peut être lié à un fournisseur.

## 2. MCD - Modèle conceptuel de données

### Entités principales

#### Role

Représente un rôle applicatif.

Exemples :

- `ADMIN`
- `GESTIONNAIRE`
- `LECTEUR`

Attributs :

- identifiant ;
- nom.

#### User

Représente un utilisateur de l'application.

Attributs :

- identifiant ;
- email ;
- mot de passe chiffré ;
- date de création ;
- date de modification.

Relation :

- un utilisateur possède un rôle.

#### Category

Représente une catégorie de produits.

Exemples :

- Informatique ;
- Bureau ;
- Consommables.

Attributs :

- identifiant ;
- nom ;
- date de création ;
- date de modification.

Relation :

- une catégorie peut contenir plusieurs produits.

#### Supplier

Représente un fournisseur.

Attributs :

- identifiant ;
- nom ;
- email ;
- téléphone ;
- date de création ;
- date de modification.

Relation :

- un fournisseur peut fournir plusieurs produits.

#### Product

Représente un produit stocké.

Attributs :

- identifiant ;
- référence ;
- nom ;
- description ;
- quantité ;
- seuil minimum ;
- date de création ;
- date de modification.

Relations :

- un produit peut appartenir à une catégorie ;
- un produit peut être rattaché à un fournisseur ;
- un produit peut avoir plusieurs mouvements de stock.

#### StockMovement

Représente une entrée ou une sortie de stock.

Attributs :

- identifiant ;
- type de mouvement ;
- quantité ;
- motif ;
- date de création.

Relations :

- un mouvement concerne un produit.

#### AuditLog

Représente une trace d'audit créée automatiquement.

Attributs :

- identifiant ;
- nom de l'entité ;
- identifiant de l'entité ;
- type d'action ;
- ancienne valeur ;
- nouvelle valeur ;
- date de création.

## 3. Relations du MCD

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

## 4. Représentation textuelle du MCD

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
