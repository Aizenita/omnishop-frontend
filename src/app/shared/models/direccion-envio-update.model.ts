export interface DireccionEnvioUpdate {
  calle?: string; // Using optional fields as updates can be partial
  ciudad?: string;
  cp?: string;
  pais?: string;
  predeterminada?: boolean;
}
