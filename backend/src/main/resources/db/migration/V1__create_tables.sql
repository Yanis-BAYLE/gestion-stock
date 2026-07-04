CREATE TABLE roles (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role_id BIGINT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                       CONSTRAINT fk_users_role
                           FOREIGN KEY (role_id)
                               REFERENCES roles(id)
);

CREATE TABLE categories (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           name VARCHAR(150) NOT NULL,
                           email VARCHAR(255),
                           phone VARCHAR(50),
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          reference VARCHAR(100) NOT NULL UNIQUE,
                          name VARCHAR(150) NOT NULL,
                          description TEXT,
                          quantity INT NOT NULL DEFAULT 0,
                          minimum_quantity INT NOT NULL DEFAULT 0,
                          category_id BIGINT,
                          supplier_id BIGINT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_products_category
                              FOREIGN KEY (category_id)
                                  REFERENCES categories(id),

                          CONSTRAINT fk_products_supplier
                              FOREIGN KEY (supplier_id)
                                  REFERENCES suppliers(id),

                          CONSTRAINT chk_products_quantity
                              CHECK (quantity >= 0),

                          CONSTRAINT chk_products_minimum_quantity
                              CHECK (minimum_quantity >= 0)
);

CREATE TABLE stock_movements (
                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 product_id BIGINT NOT NULL,
                                 movement_type VARCHAR(10) NOT NULL,
                                 quantity INT NOT NULL,
                                 reason VARCHAR(255),
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                 CONSTRAINT fk_stock_movements_product
                                     FOREIGN KEY (product_id)
                                         REFERENCES products(id),

                                 CONSTRAINT chk_stock_movements_type
                                     CHECK (movement_type IN ('IN', 'OUT')),

                                 CONSTRAINT chk_stock_movements_quantity
                                     CHECK (quantity > 0)
);

CREATE TABLE audit_logs (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            entity_name VARCHAR(100) NOT NULL,
                            entity_id BIGINT NOT NULL,
                            action_type VARCHAR(50) NOT NULL,
                            old_value TEXT,
                            new_value TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);