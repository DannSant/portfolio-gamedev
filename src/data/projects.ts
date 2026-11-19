import type { Language } from "../i18n/strings";

type LocalizedText = Record<Language, string>;

export type Project = {
  title: LocalizedText;
  description: LocalizedText;
  status: "wip" | "demo";
  tech: string[];
  /** YouTube video id */
  youtubeId: string;
  /** Accent colour for the card */
  accent: string;
};

export const projects: Project[] = [
  {
    title: {
      en: "Flames of Faith",
      es: "Flames of Faith",
    },
    description: {
      en: "2D action roguelike inspired by Brotato and Vampire Survivors.",
      es: "Roguelike de acción en 2D inspirado en Brotato y Vampire Survivors.",
    },
    status: "wip",
    tech: ["Unity", "C#", "ScriptableObjects", "SQLite", "2D"],
    youtubeId: "Pd9jGSP8eIQ",
    accent: "#f472b6",
  },
  {
    title: {
      en: "Kanator Falls",
      es: "Kanator Falls",
    },
    description: {
      en: "3D ARPG adventure game with exploration, questing, leveling, shop and a simple boss fight.",
      es: "Juego de aventura ARPG en 3D con elementos de exploración, misiones, subir de nivel, tienda y una simple pelea contra un jefe.",
    },
    status: "demo",
    tech: ["Unity", "C#", "ScriptableObjects", "3D"],
    youtubeId: "fuu1GIiQ3dw",
    accent: "#22d3ee",
  },
];
