import { EVENT_KEYS, type EventKey } from "./guests";

export { EVENT_KEYS as EVENT_ORDER };

export interface EventInfo {
  key: EventKey;
  label: string;
  heure: string;
  lieu: string;
  description: string;
}

// Informations à compléter par Simon & Tiffany avant le lancement (heures, lieux, déroulé).
export const EVENTS: Record<EventKey, EventInfo> = {
  ceremonie_religieuse: {
    key: "ceremonie_religieuse",
    label: "Cérémonie religieuse",
    heure: "à préciser",
    lieu: "à préciser",
    description: "La cérémonie religieuse.",
  },
  vin_honneur: {
    key: "vin_honneur",
    label: "Vin d'honneur",
    heure: "à préciser",
    lieu: "à préciser",
    description: "Un moment convivial pour trinquer avec les mariés.",
  },
  repas: {
    key: "repas",
    label: "Repas",
    heure: "à préciser",
    lieu: "à préciser",
    description: "Le dîner de mariage.",
  },
  soiree: {
    key: "soiree",
    label: "Soirée",
    heure: "à préciser",
    lieu: "à préciser",
    description: "Musique et danse jusqu'au bout de la nuit.",
  },
  brunch_lendemain: {
    key: "brunch_lendemain",
    label: "Brunch du lendemain",
    heure: "à préciser",
    lieu: "à préciser",
    description: "Pour prolonger la fête en douceur.",
  },
};
