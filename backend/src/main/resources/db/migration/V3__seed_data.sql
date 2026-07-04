INSERT INTO roles (name) VALUES
                             ('ADMIN'),
                             ('GESTIONNAIRE'),
                             ('LECTEUR');

INSERT INTO categories (name) VALUES
                                  ('Informatique'),
                                  ('Bureau'),
                                  ('Consommables');

INSERT INTO suppliers (name, email, phone) VALUES
                                               ('Logitech', 'contact@logitech.example', '0102030405'),
                                               ('Dell', 'contact@dell.example', '0102030406'),
                                               ('Fournisseur Bureau', 'contact@bureau.example', '0102030407');

INSERT INTO products (
    reference,
    name,
    description,
    quantity,
    minimum_quantity,
    category_id,
    supplier_id
)
VALUES
    ('PROD-001', 'Clavier', 'Clavier USB standard', 15, 5, 1, 1),
    ('PROD-002', 'Souris', 'Souris optique', 8, 5, 1, 1),
    ('PROD-003', 'Écran 24 pouces', 'Écran de bureau', 4, 2, 1, 2),
    ('PROD-004', 'Ramette papier', 'Papier A4', 25, 10, 2, 3);