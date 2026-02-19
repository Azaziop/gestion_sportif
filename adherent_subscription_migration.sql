-- Migration: Déplacer les colonnes d'abonnement de la table subscriptions vers la table adherents
-- Date: 11 février 2026
-- Description: Simplifier l'architecture en intégrant les informations d'abonnement directement dans la table adherents

-- Étape 1: Ajouter les nouvelles colonnes dans la table adherents
ALTER TABLE adherents 
ADD COLUMN subscription_type VARCHAR(50),
ADD COLUMN subscription_price DOUBLE PRECISION,
ADD COLUMN subscription_start_date DATE,
ADD COLUMN subscription_duration_months INTEGER,
ADD COLUMN subscription_end_date DATE;

-- Étape 2: Migrer les données existantes de subscriptions vers adherents
UPDATE adherents a
SET 
    subscription_type = s.type,
    subscription_price = s.price,
    subscription_start_date = s.start_date,
    subscription_duration_months = s.duration_months,
    subscription_end_date = s.end_date
FROM subscriptions s
WHERE a.subscription_id = s.id;

-- Étape 3: Supprimer la colonne subscription_id de la table adherents
ALTER TABLE adherents DROP COLUMN IF EXISTS subscription_id;

-- Étape 4: (Optionnel) Conserver la table subscriptions pour l'historique
-- Si vous voulez supprimer complètement la table subscriptions, décommentez les lignes suivantes:
-- DROP TABLE IF EXISTS subscriptions CASCADE;

-- Vérification: Compter les adhérents avec des abonnements
SELECT 
    COUNT(*) as total_adherents,
    COUNT(subscription_type) as adherents_with_subscription,
    COUNT(CASE WHEN subscription_type = 'BASIC' THEN 1 END) as basic_subscriptions,
    COUNT(CASE WHEN subscription_type = 'PREMIUM' THEN 1 END) as premium_subscriptions
FROM adherents;
