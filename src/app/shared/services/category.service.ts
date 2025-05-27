import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, EMPTY } from 'rxjs'; // Asegúrate de importar EMPTY
import { catchError } from 'rxjs/operators';
import { Category } from '../models/category.model'; // Asegúrate que la ruta de importación sea correcta

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'api/categorias'; // Endpoint para las categorías
  // private mockCategories: Category[] = [
  //   { id: 1, nombre: 'Informática (Mock)' },
  //   { id: 2, nombre: 'Accesorios (Mock)' },
  //   { id: 3, nombre: 'Móviles (Mock)' }
  // ];

  constructor(private http: HttpClient) { }

  public getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching categories from API:', error); // Usar console.error para errores
        // alert('Failed to fetch categories. Please check backend connection.'); // Opcional: alertar al usuario
        return EMPTY; // Devuelve un observable que completa sin emitir valores
      })
    );
  }
}
