import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Product {
  id?: number; // Long en backend
  nombre?: string; // VARCHAR(100) en backend
  descripcion?: string; // TEXT en backend
  precio?: number; // NUMERIC(10,2) en backend
  stock?: number; // INT en backend
  imagen?: string; // VARCHAR(255) en backend
  categoriaId?: number; // INT REFERENCES categoria(id) en backend
  visible?: boolean; // BOOLEAN en backend
  destacado?: boolean; // BOOLEAN en backend
  creadoPor?: string; // VARCHAR(100) en backend
  modificadoPor?: string; // VARCHAR(100) en backend
  fechaCreacion?: Date; // TIMESTAMP en backend
  fechaModificacion?: Date; // TIMESTAMP en backend
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'api/products';
  private mockProducts: Product[] = [
    { id: 1, nombre: 'Sample Product 1 (Mock)', precio: 10.99, descripcion: 'Description 1', imagen: 'image1.jpg', categoriaId: 1, stock: 10, visible: true, destacado: true },
    { id: 2, nombre: 'Sample Product 2 (Mock)', precio: 20.49, descripcion: 'Description 2', imagen: 'image2.jpg', categoriaId: 2, stock: 5, visible: false, destacado: true }
  ];

  constructor(private http: HttpClient) { }

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.warn('Error fetching products from API, returning mock data instead:', error);
        return of(this.mockProducts);
      })
    );
  }
}
