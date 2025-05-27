import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, EMPTY } from 'rxjs'; // Asegúrate de importar EMPTY
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
  // mockProducts ya no es necesario aquí para el flujo principal,
  // pero puedes dejarlo comentado por si se necesita para pruebas futuras.
  // private mockProducts: Product[] = [
    // { id: 1, nombre: 'Sample Product 1 (Mock)', /* ...otros campos... */ visible: true, destacado: true, stock: 10, creadoPor: "mock", modificadoPor: "mock", fechaCreacion: new Date(), fechaModificacion: new Date() },
    // { id: 2, nombre: 'Sample Product 2 (Mock)', /* ...otros campos... */ visible: true, destacado: false, stock: 5, creadoPor: "mock", modificadoPor: "mock", fechaCreacion: new Date(), fechaModificacion: new Date() }
  // ];


  constructor(private http: HttpClient) { }

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching products from API:', error); // Usar console.error para errores
        // alert('Failed to fetch products. Please check backend connection.'); // Opcional: alertar al usuario
        return EMPTY; // Devuelve un observable que completa sin emitir valores
      })
    );
  }

  public getProductById(id: number): Observable<Product> {
    const url = `${this.apiUrl}/${id}`; // Construye la URL para el producto específico
    return this.http.get<Product>(url).pipe(
      catchError((error) => {
        console.error(`Error fetching product with id=${id} from API:`, error);
        return EMPTY; // Devuelve un observable vacío en caso de error
      })
    );
  }
}
