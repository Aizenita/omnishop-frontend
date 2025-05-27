import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Product {
  id?: number;
  nombre?: string;
  precio?: number;
  descripcion?: string;
  imagen?: string;
  categoriaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'api/products';
  private mockProducts: Product[] = [
    { id: 1, nombre: 'Sample Product 1 (Mock)', precio: 10.99, descripcion: 'Description 1', imagen: 'image1.jpg', categoriaId: 1 },
    { id: 2, nombre: 'Sample Product 2 (Mock)', precio: 20.49, descripcion: 'Description 2', imagen: 'image2.jpg', categoriaId: 2 }
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
