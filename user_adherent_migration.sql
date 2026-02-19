-- Migration: move relation from users.adherent_id to adherents.user_id
-- Apply on each DB: auth_service and user_service

BEGIN;

-- 1) Add user_id to adherents if not exists
ALTER TABLE adherents
  ADD COLUMN IF NOT EXISTS user_id BIGINT;

-- 2) Backfill adherents.user_id from users.adherent_id
UPDATE adherents a
SET user_id = u.id
FROM users u
WHERE u.adherent_id = a.id
  AND a.user_id IS NULL;

-- 3) Add FK from adherents.user_id -> users.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_adherents_user_id'
  ) THEN
    ALTER TABLE adherents
      ADD CONSTRAINT fk_adherents_user_id
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- 4) Drop old FK + column from users
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_adherent_id_fkey;

ALTER TABLE users
  DROP COLUMN IF EXISTS adherent_id;

COMMIT;
