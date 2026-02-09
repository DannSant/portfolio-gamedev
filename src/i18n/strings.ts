export type Language = "en" | "es";

export const strings = {
  en: {
    nav: {
      about: "Home",
      projects: "Projects",
      contact: "Contact",
    },
    hero: {
      title: "Hi, my name is",
      role: "Game Programmer · Unity · C#",
      description:
        "I am a Software Engineer with over 10 years of experience in Full Stack Development and 5 years in Game Development. I specialize in creating robust gameplay systems, 2D game mechanics, clean code architecture, and scalable solutions.",
    },
    projects: {
      title: "Projects",
    },
    contact: {
      description:
        "Interested in working together or want to know more? Feel free to reach out.",
    },
  },

  es: {
    nav: {
      about: "Inicio",
      projects: "Proyectos",
      contact: "Contacto",
    },
    hero: {
      title: "Hola, mi nombre es",
      role: "Programador de Videojuegos · Unity · C#",
      description:
        "Soy Ingeniero en Software con más de 10 años de experiencia en Desarrollo Full Stack y 5 años en Desarrollo de Videojuegos. Me especializo en crear sistemas de juego robustos, mecánicas de juegos 2D, arquitectura de código limpia y soluciones escalables.",
    },
    projects: {
      title: "Proyectos",
    },
    contact: {
      description:
        "¿Interesado en trabajar juntos o quieres saber más? No dudes en contactarme.",
    },
  },
} as const;
