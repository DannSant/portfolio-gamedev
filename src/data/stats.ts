import type { IconName } from "../components/PixelIcon";
import type { Language } from "../i18n/strings";

type LocalizedText = Record<Language, string>;

// Skill levels are out of 10 — tune these to taste.
export const skills: { name: LocalizedText; level: number }[] = [
  { name: { en: "C#", es: "C#" }, level: 9 },
  { name: { en: "Unity", es: "Unity" }, level: 9 },
  { name: { en: "Gameplay systems", es: "Sistemas de juego" }, level: 9 },
  { name: { en: "2D mechanics", es: "Mecánicas 2D" }, level: 8 },
  { name: { en: "Code architecture", es: "Arquitectura de código" }, level: 9 },
  { name: { en: "Full stack", es: "Full stack" }, level: 9 },
];

export const achievements: { icon: IconName; title: LocalizedText; description: LocalizedText }[] = [
  {
    icon: "trophy",
    title: { en: "Veteran", es: "Veterano" },
    description: { en: "10+ years of full stack development", es: "Más de 10 años en desarrollo full stack" },
  },
  {
    icon: "pad",
    title: { en: "Game Dev", es: "Game Dev" },
    description: { en: "5 years building games", es: "5 años creando videojuegos" },
  },
  {
    icon: "gear",
    title: { en: "Architect", es: "Arquitecto" },
    description: { en: "Clean code & scalable systems", es: "Código limpio y sistemas escalables" },
  },
  {
    icon: "star",
    title: { en: "Two Worlds", es: "Dos Mundos" },
    description: { en: "Building worlds in 2D and 3D", es: "Creando mundos en 2D y 3D" },
  },
];
