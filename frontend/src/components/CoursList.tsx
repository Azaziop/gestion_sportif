import { useEffect, useMemo, useState } from 'react';
import type { Cours, CourseLevel, CreateCoursRequest, Reservation } from '../types';
import { coursService } from '../services/coursService';
import { authService } from '../services/api';
import { sportService } from '../services/sportService';

type AvailabilityFilter = 'all' | 'available' | 'finished' | 'upcoming';

const emptyForm: CreateCoursRequest = {
  titre: '',
  description: '',
  type: '',
  coach: '',
  salle: '',
  capaciteMax: 20,
  niveau: 'BASIC',
  dateHeure: '',
  duree: 60,
};

const toLocalInputValue = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getAvailabilityInfo = (course: Cours) => {
  const now = new Date();
  const isFinished = new Date(course.dateHeure) < now || course.actif === false;
  const remaining = course.placesRestantes ?? (course.capaciteMax - course.nombreInscrits);
  if (isFinished) {
    return { label: 'Terminé', tone: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
  if (remaining <= 0) {
    return { label: 'Complet', tone: 'bg-red-50 text-red-600 border-red-200' };
  }
  return { label: 'Disponible', tone: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
};

export default function CoursList() {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | ''>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Cours | null>(null);
  const [formData, setFormData] = useState<CreateCoursRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const isAdmin = authService.getUserRole() === 'ADMIN';
  const [reservingId, setReservingId] = useState<number | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    loadCourses();
    loadAllReservations();
    if (!isAdmin) {
      loadUserReservations();
    }
  }, []);

  // Recharger systématiquement les réservations à chaque affichage du composant
  useEffect(() => {
    // Recharger immédiatement si le composant vient d'être monté et qu'on est USER
    if (!isAdmin) {
      const recheckReservations = () => {
        console.log('👁️ CoursList visible, rechargement des réservations');
        loadUserReservations();
      };

      // Recharger après un court délai pour s'assurer que le composant est bien visible
      const timeoutId = setTimeout(recheckReservations, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isAdmin]);

  // Recharger les réservations quand elles sont modifiées depuis d'autres composants
  useEffect(() => {
    const handleReservationChange = () => {
      if (!isAdmin) {
        console.log('🔄 Rechargement des réservations suite à un changement');
        loadUserReservations();
      }
    };

    const handleFocus = () => {
      if (!isAdmin) {
        loadUserReservations();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !isAdmin) {
        loadUserReservations();
      }
    };

    // Écouter l'événement personnalisé de changement de réservation
    window.addEventListener('reservationChanged', handleReservationChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('reservationChanged', handleReservationChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAdmin]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursService.getAllCours();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllReservations = async () => {
    try {
      const reservations = await sportService.getAllReservations();
      setAllReservations(reservations);
    } catch (err) {
      console.error('Erreur lors du chargement de toutes les réservations', err);
    }
  };

  const loadUserReservations = async () => {
    try {
      const reservations = await sportService.getAllReservations();
      console.log('📋 Réservations chargées:', reservations.filter(r => r.statut === 'CONFIRMED' || r.statut === 'WAITING_LIST').length, 'actives');
      setUserReservations(reservations);
    } catch (err) {
      console.error('Erreur lors du chargement des réservations', err);
    }
  };

  const openCreateForm = () => {
    if (!isAdmin) return;
    setEditingCourse(null);
    setFormData({ ...emptyForm, dateHeure: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (course: Cours) => {
    if (!isAdmin) return;
    setEditingCourse(course);
    setFormData({
      titre: course.titre ?? '',
      description: course.description ?? '',
      type: course.type ?? '',
      coach: course.coach ?? '',
      salle: course.salle ?? '',
      capaciteMax: course.capaciteMax ?? 0,
      niveau: course.niveau ?? 'BASIC',
      dateHeure: toLocalInputValue(course.dateHeure),
      duree: course.duree ?? 0,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
    setFormData(emptyForm);
  };

  const handleFormChange = (field: keyof CreateCoursRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.titre || !formData.type || !formData.coach || !formData.salle || !formData.dateHeure) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      setSaving(true);
      const normalizedDateHeure =
        formData.dateHeure.length === 16 ? `${formData.dateHeure}:00` : formData.dateHeure;
      const payload: CreateCoursRequest = {
        ...formData,
        dateHeure: normalizedDateHeure,
        capaciteMax: Number(formData.capaciteMax),
        duree: Number(formData.duree),
      };
      if (editingCourse) {
        await coursService.updateCourse(editingCourse.id, payload);
      } else {
        await coursService.createCourse(payload);
      }
      await loadCourses();
      closeForm();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement du cours");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Supprimer ce cours ?')) return;
    try {
      await coursService.deleteCourse(courseId);
      await loadCourses();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression du cours');
    }
  };

  const handleReserve = async (courseId: number) => {
    // Empêcher les réservations multiples pendant le traitement
    if (reservingId !== null) {
      console.warn('⚠️ Réservation déjà en cours, annulation du clic');
      return;
    }
    
    // Vérifier si l'utilisateur a déjà une réservation active
    const existingReservation = getReservationStatus(courseId);
    if (existingReservation) {
      console.warn('⚠️ Réservation déjà existante:', existingReservation);
      return;
    }

    try {
      console.log('🎫 Création réservation pour cours #' + courseId);
      setReservingId(courseId);
      const profile = await authService.getCurrentProfile();
      await sportService.create(courseId, profile.id);
      console.log('✅ Réservation créée avec succès');
      setError(null);
      await loadCourses();
      await loadAllReservations();
      await loadUserReservations();
    } catch (err) {
      console.error('❌ Erreur réservation:', err);
      setError("Erreur lors de la réservation du cours");
    } finally {
      setReservingId(null);
    }
  };

  const getReservationStatus = (courseId: number) => {
    const reservation = userReservations.find(
      (r) => r.coursId === courseId && (r.statut === 'CONFIRMED' || r.statut === 'WAITING_LIST')
    );
    return reservation;
  };

  const getActualEnrollmentCount = (courseId: number): number => {
    return allReservations.filter(
      (r) => r.coursId === courseId && r.statut === 'CONFIRMED'
    ).length;
  };

  const filteredCourses = useMemo(() => {
    const now = new Date();
    return courses.filter((course) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (
          !course.titre.toLowerCase().includes(query) &&
          !course.description?.toLowerCase().includes(query) &&
          !course.coach?.toLowerCase().includes(query) &&
          !course.salle?.toLowerCase().includes(query) &&
          !course.type?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (selectedLevel && course.niveau !== selectedLevel) {
        return false;
      }

      if (availabilityFilter === 'available') {
        const places = course.placesRestantes ?? (course.capaciteMax - course.nombreInscrits);
        return places > 0 && course.actif !== false;
      }

      if (availabilityFilter === 'finished') {
        return new Date(course.dateHeure) < now || course.actif === false;
      }

      if (availabilityFilter === 'upcoming') {
        return new Date(course.dateHeure) >= now && course.actif !== false;
      }

      return true;
    });
  }, [courses, searchQuery, selectedLevel, availabilityFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const total = courses.length;
    const available = courses.filter((course) => {
      const remaining = course.placesRestantes ?? (course.capaciteMax - course.nombreInscrits);
      return remaining > 0 && course.actif !== false && new Date(course.dateHeure) >= now;
    }).length;
    const upcoming = courses.filter((course) => new Date(course.dateHeure) >= now && course.actif !== false).length;
    const finished = courses.filter((course) => new Date(course.dateHeure) < now || course.actif === false).length;
    return { total, available, upcoming, finished };
  }, [courses]);

  if (loading) {
    return <div className="text-center py-8">Chargement des cours...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button
          onClick={loadCourses}
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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Cours</h2>
              <p className="text-sm text-gray-500">
                {isAdmin ? 'Créez, modifiez et suivez les disponibilités.' : 'Consultez les cours disponibles.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <button
                  onClick={openCreateForm}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-soft hover:shadow-hard"
                >
                  Nouveau cours
                </button>
              )}
              <button
                onClick={loadCourses}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Actualiser
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-700">Disponibles</p>
              <p className="text-2xl font-semibold text-emerald-700">{stats.available}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-700">À venir</p>
              <p className="text-2xl font-semibold text-blue-700">{stats.upcoming}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">
              <p className="text-xs text-gray-600">Terminés</p>
              <p className="text-2xl font-semibold text-gray-700">{stats.finished}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Rechercher par titre, description, coach ou salle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as CourseLevel | '')}
              className="form-input"
            >
              <option value="">Tous les niveaux</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'available', 'upcoming', 'finished'] as AvailabilityFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setAvailabilityFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm border ${
                  availabilityFilter === filter
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {filter === 'all' && 'Tous'}
                {filter === 'available' && 'Disponibles'}
                {filter === 'upcoming' && 'À venir'}
                {filter === 'finished' && 'Terminés'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-hard">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCourse ? 'Modifier le cours' : 'Créer un cours'}
                </h3>
                <p className="text-sm text-gray-500">Les champs marqués * sont requis.</p>
              </div>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
              <div className="space-y-1">
                <label className="form-label">Titre *</label>
                <input
                  className="form-input"
                  placeholder="Titre"
                  value={formData.titre}
                  onChange={(e) => handleFormChange('titre', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="form-label">Type *</label>
                <input
                  className="form-input"
                  placeholder="YOGA, MUSCULATION..."
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="form-label">Coach *</label>
                <input
                  className="form-input"
                  placeholder="Coach"
                  value={formData.coach}
                  onChange={(e) => handleFormChange('coach', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="form-label">Salle *</label>
                <input
                  className="form-input"
                  placeholder="Salle"
                  value={formData.salle}
                  onChange={(e) => handleFormChange('salle', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="form-label">Capacité max *</label>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={formData.capaciteMax}
                  onChange={(e) => handleFormChange('capaciteMax', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="form-label">Niveau *</label>
                <select
                  className="form-input"
                  value={formData.niveau}
                  onChange={(e) => handleFormChange('niveau', e.target.value as CourseLevel)}
                >
                  <option value="BASIC">Basic</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="form-label">Date & heure *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.dateHeure}
                  onChange={(e) => handleFormChange('dateHeure', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="form-label">Durée (min) *</label>
                <input
                  type="number"
                  min={15}
                  className="form-input"
                  value={formData.duree}
                  onChange={(e) => handleFormChange('duree', Number(e.target.value))}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input min-h-[96px]"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-10 text-center">
          <p className="text-gray-500">Aucun cours trouvé</p>
          {isAdmin && (
            <button
              onClick={openCreateForm}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Créer un cours
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-soft hover:shadow-hard transition-shadow"
            >
              <div className="mb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{course.titre}</h3>
                    <p className="text-sm text-gray-500">{course.type}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full border bg-gray-50 text-gray-600">
                    {course.niveau}
                  </span>
                </div>
                <div className="mt-2">
                  {(() => {
                    const info = getAvailabilityInfo(course);
                    return (
                      <span className={`text-xs px-2 py-1 rounded-full border ${info.tone}`}>
                        {info.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {course.description && (
                <p className="text-gray-600 text-sm mb-3">{course.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  <p className="text-xs uppercase text-gray-400">Coach</p>
                  <p className="font-medium text-gray-800">{course.coach}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Salle</p>
                  <p className="font-medium text-gray-800">{course.salle}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Date</p>
                  <p className="font-medium text-gray-800">{formatDate(course.dateHeure)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Durée</p>
                  <p className="font-medium text-gray-800">{course.duree} min</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                {(() => {
                  const actualEnrolled = getActualEnrollmentCount(course.id);
                  const fillPercentage = (actualEnrolled / course.capaciteMax) * 100;
                  
                  return (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Places:</span> {actualEnrolled}/{course.capaciteMax}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${fillPercentage}%` }}
                        ></div>
                      </div>
                    </>
                  );
                })()}
                {isAdmin ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditForm(course)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(() => {
                      const reservation = getReservationStatus(course.id);
                      const actualEnrolled = getActualEnrollmentCount(course.id);
                      const remaining = course.capaciteMax - actualEnrolled;
                      const isFull = remaining <= 0;
                      
                      if (reservation) {
                        return (
                          <button
                            disabled
                            className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded-lg bg-blue-50 cursor-not-allowed"
                          >
                            {reservation.statut === 'CONFIRMED' ? 'Déjà réservé' : 'En liste d\'attente'}
                          </button>
                        );
                      }
                      
                      if (isFull) {
                        return (
                          <button
                            disabled
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-500 rounded-lg bg-gray-50 cursor-not-allowed"
                          >
                            Complet
                          </button>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => handleReserve(course.id)}
                          disabled={reservingId === course.id}
                          className="px-3 py-1 text-sm border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 disabled:opacity-60"
                        >
                          {reservingId === course.id ? 'Réservation...' : 'Réserver'}
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
