export interface Category {
  id?: number; // SERIAL PRIMARY KEY en backend
  nombre?: string; // VARCHAR(50) en backend
  // Los campos creado_por, modificado_por, fecha_creacion, fecha_modificacion
  // no son estrictamente necesarios en el frontend para la funcionalidad de mostrar categorías,
  // así que los omitiremos por ahora para simplificar.
}
