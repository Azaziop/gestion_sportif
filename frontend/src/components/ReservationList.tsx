import { useEffect, useState } from 'react';
import { sportService } from '../services/sportService';
import { authService } from '../services/api';
import { coursService } from '../services/coursService';
import type { Reservation, Cours } from '../types';

const formatDate = (iso?: string) => {
  if (!iso) return 'N/A';
  const date = new Date(iso);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadReservations();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await coursService.getAllCours();
      setCourses(data);
    } catch (err) {
      console.error('Erreur lors du chargement des cours', err);
    }
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      const role = authService.getUserRole();
      setIsAdmin(role === 'ADMIN');
      if (role === 'ADMIN') {
        const data = await sportService.getAllReservations();
        setReservations(data);
        setError(null);
        return;
      }
      const profile = await authService.getCurrentProfile();
      const data = await sportService.getMyReservations(profile.id);
      setReservations(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des réservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      console.log('❌ Annulation réservation #' + reservationId);
      await sportService.cancel(reservationId);
      console.log('✅ Réservation annulée, rechargement...');
      await loadReservations();
      
      // Attendre un court instant pour que le serveur soit à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Notifier les autres composants du changement
      console.log('📢 Émission événement reservationChanged après annulation');
      window.dispatchEvent(new CustomEvent('reservationChanged'));
    } catch (err) {
      setError("Erreur lors de l'annulation de la réservation");
      console.error(err);
    }
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'WAITING_LIST':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'ATTENDED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'CONFIRMED':
        return 'Confirmée';
      case 'WAITING_LIST':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulée';
      case 'ATTENDED':
        return 'Assisté';
      default:
        return statut;
    }
  };

  const getCoursTitle = (coursId?: number) => {
    if (!coursId) return 'Cours inconnu';
    const cours = courses.find(c => c.id === coursId);
    return cours?.titre || `Cours #${coursId}`;
  };

  if (loading) {
    return <div className="text-center py-8">Chargement de vos réservations...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button
          onClick={loadReservations}
          className="ml-2 underline font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes réservations</h2>
            <p className="text-sm text-gray-500">
              {isAdmin ? 'Gérez toutes les réservations.' : 'Suivez vos réservations et annulez si besoin.'}
            </p>
          </div>
          <button
            onClick={loadReservations}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Actualiser
          </button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-10 text-center">
          <p className="text-gray-500">Vous n'avez pas de réservations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getCoursTitle(reservation.coursId)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {reservation.statut === 'CANCELLED' && reservation.dateAnnulation 
                      ? `Annulée le ${formatDate(reservation.dateAnnulation)}`
                      : `Réservé le ${formatDate(reservation.dateReservation)}`
                    }
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${getStatutBadgeClass(reservation.statut)}`}
                >
                  {getStatutLabel(reservation.statut)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-gray-400">Date</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(reservation.dateReservation)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Réservation</p>
                  <p className="font-medium text-gray-800">#{reservation.id}</p>
                </div>
                {isAdmin && (
                  <div>
                    <p className="text-xs uppercase text-gray-400">Adhérent</p>
                    <p className="font-medium text-gray-800">#{reservation.adherentId ?? 'N/A'}</p>
                  </div>
                )}
              </div>

              {(reservation.statut === 'CONFIRMED' || reservation.statut === 'WAITING_LIST') && (
                <button
                  onClick={() => handleCancel(reservation.id)}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Annuler
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
