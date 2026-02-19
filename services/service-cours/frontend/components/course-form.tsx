'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cours, CourseType, CourseLevel, CourseStatus, CreateCoursRequest } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

interface CourseFormProps {
  initialCourse?: Cours;
  isEditing?: boolean;
}

const courseTypes: CourseType[] = ['YOGA', 'FOOTBALL', 'MUSCULATION', 'NATATION', 'BOXE', 'PILATES', 'CROSSFIT'];
const courseLevels: CourseLevel[] = ['BASIC', 'PREMIUM'];
const courseStatuses: CourseStatus[] = ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'];

export function CourseForm({ initialCourse, isEditing }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titre: initialCourse?.titre || '',
    description: initialCourse?.description || '',
    type: (initialCourse?.type as CourseType) || ('YOGA' as CourseType),
    coach: initialCourse?.coach || '',
    salle: initialCourse?.salle || '',
    capaciteMax: initialCourse?.capaciteMax || 20,
    niveau: (initialCourse?.niveau as CourseLevel) || ('BASIC' as CourseLevel),
    dateHeure: initialCourse
      ? new Date(initialCourse.dateHeure).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    duree: initialCourse?.duree || 60,
    statut: (initialCourse?.statut as CourseStatus) || ('PLANIFIE' as CourseStatus),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'capaciteMax' || name === 'duree') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.titre.trim()) {
      setError('Le titre est requis');
      return;
    }
    if (!formData.coach.trim()) {
      setError('Le coach est requis');
      return;
    }
    if (!formData.salle.trim()) {
      setError('La salle est requise');
      return;
    }
    if (formData.capaciteMax < 1 || formData.capaciteMax > 100) {
      setError('La capacité doit être entre 1 et 100');
      return;
    }
    if (formData.duree < 15 || formData.duree > 300) {
      setError('La durée doit être entre 15 et 300 minutes');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert dateHeure to ISO format with timezone
      const dateTime = new Date(formData.dateHeure);
      const isoDateTime = dateTime.toISOString();

      const data: CreateCoursRequest = {
        ...formData,
        dateHeure: isoDateTime,
      };

      if (isEditing && initialCourse) {
        await apiClient.updateCourse(initialCourse.id, data);
        router.push(`/courses/${initialCourse.id}`);
      } else {
        const newCourse = await apiClient.createCourse(data);
        router.push(`/courses/${newCourse.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save course';
      console.error('[v0] Error saving course:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          <p className="font-semibold">Erreur</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Section: Informations générales */}
      <fieldset className="space-y-4 rounded-lg border border-border bg-card p-6">
        <legend className="text-lg font-semibold text-foreground">Informations générales</legend>

        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-foreground">
            Titre du cours <span className="text-red-500">*</span>
          </label>
          <input
            id="titre"
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            placeholder="Ex: Cours de Yoga matinal"
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description détaillée du cours..."
            rows={4}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </fieldset>

      {/* Section: Paramètres du cours */}
      <fieldset className="space-y-4 rounded-lg border border-border bg-card p-6">
        <legend className="text-lg font-semibold text-foreground">Paramètres du cours</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground">
              Type de cours <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {courseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="niveau" className="block text-sm font-medium text-foreground">
              Niveau d'accès <span className="text-red-500">*</span>
            </label>
            <select
              id="niveau"
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {courseLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="coach" className="block text-sm font-medium text-foreground">
              Coach <span className="text-red-500">*</span>
            </label>
            <input
              id="coach"
              type="text"
              name="coach"
              value={formData.coach}
              onChange={handleChange}
              placeholder="Ex: Marie Dupont"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label htmlFor="salle" className="block text-sm font-medium text-foreground">
              Salle <span className="text-red-500">*</span>
            </label>
            <input
              id="salle"
              type="text"
              name="salle"
              value={formData.salle}
              onChange={handleChange}
              placeholder="Ex: Salle A"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </div>
      </fieldset>

      {/* Section: Planning */}
      <fieldset className="space-y-4 rounded-lg border border-border bg-card p-6">
        <legend className="text-lg font-semibold text-foreground">Planning</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dateHeure" className="block text-sm font-medium text-foreground">
              Date et heure <span className="text-red-500">*</span>
            </label>
            <input
              id="dateHeure"
              type="datetime-local"
              name="dateHeure"
              value={formData.dateHeure}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label htmlFor="duree" className="block text-sm font-medium text-foreground">
              Durée (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="duree"
              type="number"
              name="duree"
              value={formData.duree}
              onChange={handleChange}
              min="15"
              max="300"
              step="5"
              placeholder="Ex: 60"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </div>
      </fieldset>

      {/* Section: Capacité */}
      <fieldset className="space-y-4 rounded-lg border border-border bg-card p-6">
        <legend className="text-lg font-semibold text-foreground">Capacité et statut</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="capaciteMax" className="block text-sm font-medium text-foreground">
              Capacité max <span className="text-red-500">*</span>
            </label>
            <input
              id="capaciteMax"
              type="number"
              name="capaciteMax"
              value={formData.capaciteMax}
              onChange={handleChange}
              min="1"
              max="100"
              placeholder="Ex: 20"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-foreground">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {courseStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le cours'}
        </Button>
      </div>
    </form>
  );
}
