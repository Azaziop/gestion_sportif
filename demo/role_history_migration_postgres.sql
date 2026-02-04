-- Script de migration PostgreSQL pour l'historique des changements de rôles

CREATE TABLE IF NOT EXISTS role_change_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    old_role VARCHAR(50) NOT NULL,
    new_role VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(500),
    ip_address VARCHAR(50),
    
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_role_change_user_id ON role_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_changed_at ON role_change_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_role_change_changed_by ON role_change_history(changed_by);

-- Afficher les informations
\dt role_change_history
\di role_change_history*

COMMIT;
