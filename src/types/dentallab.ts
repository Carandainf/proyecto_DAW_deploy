/**
 * @file dentallab.ts
 * @description Definición de interfaces globales para el proyecto.
 */

export interface Servicio {
  id: string;
  title: string;
  desc?: string; // Opcional, para la vista bento
  longDesc: string; // Obligatorio, para el modal
  img: string;
  features: string[];
  size?: string; // Opcional, solo usado en el bento
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  gridSpan?: string; // Opcional para layouts irregulares (md:col-span-2)
  accent: string; // Paleta de color para el hover
}
