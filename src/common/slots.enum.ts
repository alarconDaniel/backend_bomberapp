// src/common/slots.enum.ts

// Slots de equipamiento del avatar del usuario
// Cada slot representa una parte del cuerpo donde se puede equipar un ítem cosmético
export enum Slot {
  CABEZA = 'cabeza',
  TORSO = 'torso',
  PIERNAS = 'piernas',
  PIES = 'pies',
  EXTRA = 'extra',
}

// Lista conveniente con todos los slots disponibles (útil para validaciones)
export const ALL_SLOTS: Slot[] = [
  Slot.CABEZA,
  Slot.TORSO,
  Slot.PIERNAS,
  Slot.PIES,
  Slot.EXTRA,
];
