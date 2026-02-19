import { useState } from 'react';
import { sportService } from '../services/sportService';
import type { Sport } from '../types';
import { authService } from '../services/api';

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

interface ReservationFormProps {
  sport: Sport;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReservationForm({
  sport,
  onSuccess,
  onCancel,
}: ReservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await authService.getCurrentProfile();
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }

      await sportService.create(sport.id, user.id);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la réservation'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFullyBooked = sport.capaciteActuelle >= sport.capaciteMax;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-hard max-w-lg w-full overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Réservation</p>
              <h2 className="text-2xl font-bold text-gray-900">{sport.nom}</h2>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{sport.lieu}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase text-gray-400">Date</p>
              <p className="font-medium text-gray-800">{formatDate(sport.dateDebut)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Places restantes</p>
              <p className="font-medium text-gray-800">
                {sport.capaciteMax - sport.capaciteActuelle}/{sport.capaciteMax}
              </p>
            </div>
            {sport.coach && (
              <div>
                <p className="text-xs uppercase text-gray-400">Coach</p>
                <p className="font-medium text-gray-800">{sport.coach}</p>
              </div>
            )}
          </div>

          {sport.description && (
            <p className="text-sm text-gray-600">{sport.description}</p>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-sm text-blue-800">
              ✓ Vous allez réserver une place pour cette activité
            </p>
          </div>

          {isFullyBooked && (
            <p className="text-sm text-red-600">
              Cette activité est malheureusement complète
            </p>
          )}
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading || isFullyBooked}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:shadow-soft disabled:opacity-60"
          >
            {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
