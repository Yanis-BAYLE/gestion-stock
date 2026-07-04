CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    SET NEW.updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER trg_products_audit_update
    AFTER UPDATE ON products
    FOR EACH ROW
    INSERT INTO audit_logs (
        entity_name,
        entity_id,
        action_type,
        old_value,
        new_value,
        created_at
    )
    VALUES (
               'products',
               NEW.id,
               'UPDATE',
               CONCAT('quantity=', OLD.quantity),
               CONCAT('quantity=', NEW.quantity),
               CURRENT_TIMESTAMP
           );