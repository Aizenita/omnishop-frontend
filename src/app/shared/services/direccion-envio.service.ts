import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DireccionEnvio } from '../models/direccion-envio.model';
import { DireccionEnvioRequest } from '../models/direccion-envio-request.model';
import { DireccionEnvioUpdate } from '../models/direccion-envio-update.model';

@Injectable({
  providedIn: 'root'
})
export class DireccionEnvioService {

  private apiUrl = '/api/direcciones'; // Assuming proxy handles base URL

  constructor(private http: HttpClient) { }

  // Method to get all addresses for the authenticated user
  getDirecciones(): Observable<DireccionEnvio[]> {
    return this.http.get<DireccionEnvio[]>(this.apiUrl);
  }

  // Method to get a single address by its ID
  // (Useful if we need to fetch a single one, e.g., before editing, though backend controller's obtener(id) might be restricted)
  // For now, the plan focuses on getDirecciones() for the list.
  // getDireccion(id: number): Observable<DireccionEnvio> {
  //   return this.http.get<DireccionEnvio>(`${this.apiUrl}/${id}`);
  // }

  // Method to create a new address
  crearDireccion(direccionData: DireccionEnvioRequest): Observable<DireccionEnvio> {
    return this.http.post<DireccionEnvio>(this.apiUrl, direccionData);
  }

  // Method to update an existing address
  actualizarDireccion(id: number, direccionData: DireccionEnvioUpdate): Observable<DireccionEnvio> {
    return this.http.put<DireccionEnvio>(`${this.apiUrl}/${id}`, direccionData);
  }

  // Method to delete an address
  eliminarDireccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Placeholder for marking an address as default if a specific endpoint is decided later
  // marcarComoPredeterminada(id: number): Observable<DireccionEnvio> {
  //   // This might be a PATCH request or part of PUT (actualizarDireccion)
  //   // e.g., return this.http.patch<DireccionEnvio>(`${this.apiUrl}/${id}/predeterminada`, {});
  //   throw new Error('Not implemented yet');
  // }
}
