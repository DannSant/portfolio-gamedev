import type { Language } from "../i18n/strings";

type LocalizedText = Record<Language, string>;

export type Project = {
  title: LocalizedText;
  description: LocalizedText;
  tech: string[];
  video: string;
};

export const projects: Project[] = [
  {
    title: {
      en: "Flames of Faith(in development)",
      es: "Flames of Faith(en desarrollo)",
    },
    description: {
      en: "2D action roguelike inspired by Brotato and Vampire Survivors.",
      es: "Roguelike de acción en 2D inspirado en Brotato y Vampire Survivors.",
    },
    tech: ["Unity", "C#", "ScriptableObjects", "SQLite","2D"],
    video: "https://www.youtube.com/embed/Pd9jGSP8eIQ",
  },
  {
    title: {
      en: "Kanator Falls(demo)",
      es: "Kanator Falls(demo)",
    },
    description: {
      en: "3D ARPG adventure game with exploration, questing, leveling, shop and a simple boss fight.",
      es: "Juego de aventura ARPG en 3D con elementos de exploración, misiones, subir de nivel, tienda y una simple pelea contra un jefe.",
    },
    tech: ["Unity", "C#", "ScriptableObjects","3D"],
    video: "https://www.youtube.com/embed/fuu1GIiQ3dw",
  },
];
