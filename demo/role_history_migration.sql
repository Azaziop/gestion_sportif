-- Script de migration pour ajouter la table d'historique des changements de rôles

CREATE TABLE IF NOT EXISTS role_change_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    old_role VARCHAR(50) NOT NULL,
    new_role VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(500),
    ip_address VARCHAR(50),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vérifier que la colonne 'role' dans la table 'users' accepte les nouveaux rôles
-- Si nécessaire, modifier la contrainte

-- Optionnel : Ajouter un trigger pour logger automatiquement les changements de rôles
DELIMITER $$

CREATE TRIGGER after_user_role_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.role != NEW.role THEN
        INSERT INTO role_change_history (user_id, old_role, new_role, changed_by, reason)
        VALUES (NEW.id, OLD.role, NEW.role, 'SYSTEM_TRIGGER', 'Changement automatique détecté');
    END IF;
END$$

DELIMITER ;

-- Commenter ou supprimer le trigger ci-dessus si vous préférez 
-- gérer l'historique uniquement via l'application Java
