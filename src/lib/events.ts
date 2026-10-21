import { EVENT_KEYS, type EventKey } from "./guests";

export { EVENT_KEYS as EVENT_ORDER };

export interface EventInfo {
  key: EventKey;
  label: string;
  date: string; // ISO (YYYY-MM-DD)
  heure: string;
  lieu: string;
  description: string;
}

// Horaires précis à compléter par Simon & Tiffany avant le lancement.
export const EVENTS: Record<EventKey, EventInfo> = {
  mairie: {
    key: "mairie",
    label: "Mairie",
    date: "2027-08-07",
    heure: "14h",
    lieu: "Mairie de Sales",
    description: "La cérémonie civile à la mairie.",
  },
  ceremonie_religieuse: {
    key: "ceremonie_religieuse",
    label: "Cérémonie religieuse",
    date: "2027-08-09",
    heure: "13h30",
    lieu: "La Grange à Jules",
    description: "La cérémonie religieuse.",
  },
  vin_honneur: {
    key: "vin_honneur",
    label: "Vin d'honneur",
    date: "2027-08-09",
    heure: "15h30",
    lieu: "La Grange à Jules",
    description: "Un moment convivial pour trinquer avec les mariés.",
  },
  repas: {
    key: "repas",
    label: "Repas",
    date: "2027-08-09",
    heure: "20h",
    lieu: "La Grange à Jules",
    description: "Le dîner de mariage.",
  },
  soiree: {
    key: "soiree",
    label: "Soirée",
    date: "2027-08-09",
    heure: "23h",
    lieu: "La Grange à Jules",
    description: "Musique et danse jusqu'au bout de la nuit.",
  },
  brunch_lendemain: {
    key: "brunch_lendemain",
    label: "Brunch du lendemain",
    date: "2027-08-11",
    heure: "Midi",
    lieu: "La Grange à Jules",
    description: "Pour prolonger la fête en douceur.",
  },
};

export function formatEventDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
