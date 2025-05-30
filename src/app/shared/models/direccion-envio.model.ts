export interface DireccionEnvio {
  id: number; // Using number for Long in TypeScript
  usuarioId: number; // Using number for Long in TypeScript
  calle: string;
  ciudad: string;
  cp: string;
  pais: string;
  predeterminada: boolean;
}
