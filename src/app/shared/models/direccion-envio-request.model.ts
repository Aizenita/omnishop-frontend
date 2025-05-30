export interface DireccionEnvioRequest {
  usuarioId?: number; // Optional, as it might be set by the backend from auth principal
  calle: string;
  ciudad: string;
  cp: string;
  pais: string;
  predeterminada?: boolean; // Often, default status is handled separately or defaults to false
}
