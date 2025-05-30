import { Injectable, OnDestroy } from '@angular/core'; // Importar OnDestroy
import { BehaviorSubject, Observable, of, throwError, forkJoin, Subject } from 'rxjs'; // Añadir Subject
import { map, tap, catchError, switchMap, takeUntil, distinctUntilChanged } from 'rxjs/operators'; // Añadir takeUntil, distinctUntilChanged
import { Product } from './product.service'; 
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service'; 

export interface CartItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy { // Implementar OnDestroy
  private readonly CART_STORAGE_KEY = 'app_cart_items';
  private itemsSubject = new BehaviorSubject<CartItem[]>([]); // Inicialización sin carga directa
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();
  private apiUrl = '/api/carrito';
  private destroy$ = new Subject<void>(); // Para desuscripción

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Escuchar cambios en el estado de autenticación para recargar el carrito
    this.authService.isAuthenticated$.pipe(
      // distinctUntilChanged(), // Opcional: solo reaccionar si el estado realmente cambia
      tap(isAuthenticated => console.log('CartService: Estado de autenticación cambiado a:', isAuthenticated)),
      switchMap(() => this.loadInitialCart()), // Llama a loadInitialCart y maneja su observable
      takeUntil(this.destroy$)
    ).subscribe({
      // La lógica de next/error ya está dentro de loadInitialCart/fetchCartFromServer
      // y las funciones que llaman a los métodos del servicio.
      // Aquí solo nos interesa disparar la carga.
      error: err => console.error('CartService: Error en la suscripción a isAuthenticated$ para cargar carrito', err)
    });
  }

  public loadInitialCart(): Observable<CartItem[]> { // Devolver Observable
    console.log('CartService: loadInitialCart llamado. Autenticado:', this.authService.isAuthenticated());
    if (this.authService.isAuthenticated()) {
      return this.fetchCartFromServer().pipe(
        tap(backendCartItems => {
          this.itemsSubject.next(backendCartItems);
          this.saveItemsToStorage(); 
          console.log('CartService: Carrito cargado del servidor y actualizado en localStorage.');
        }),
        catchError(err => {
          console.error('CartService: Error al cargar carrito del servidor, usando localStorage como fallback:', err);
          this.itemsSubject.next(this.loadItemsFromLocalStorage());
          return of(this.itemsSubject.value); // Devuelve el carrito actual (de localStorage o vacío)
        })
      );
    } else {
      console.log('CartService: Usuario no autenticado, cargando carrito de localStorage.');
      this.itemsSubject.next(this.loadItemsFromLocalStorage());
      return of(this.itemsSubject.value); // Devuelve el carrito actual de localStorage
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCartFromServer(): Observable<CartItem[]> {
    return this.http.get<VentaDtoFromBackend>(this.apiUrl).pipe(
      map(ventaDto => this.transformVentaDtoToCartItems(ventaDto)),
      catchError(this.handleError.bind(this))
    );
  }

  private transformVentaDtoToCartItems(ventaDto: VentaDtoFromBackend | null): CartItem[] {
    if (!ventaDto || !ventaDto.lineasVenta) {
      return [];
    }
    return ventaDto.lineasVenta.map(linea => ({
      productId: linea.productoId,
      nombre: linea.nombreProducto,
      precio: linea.precioUnitario,
      cantidad: linea.cantidad,
      // Asumiendo que LineaVentaDtoFromBackend puede tener 'imagenProducto'
      imagen: linea.imagenProducto || '' 
    }));
  }

  addItem(product: Product, quantity: number = 1): void {
    console.log(`CartService: Método addItem llamado. Usuario autenticado: ${this.authService.isAuthenticated()}`);
    if (!product || product.id === undefined) {
      console.error('Intento de añadir producto inválido al carrito:', product);
      return;
    }

    if (this.authService.isAuthenticated()) {
      console.log(`CartService: Usuario AUTENTICADO en addItem. Intentando llamada a backend.`);
      const params = new HttpParams()
        .set('productoId', product.id.toString())
        .set('cantidad', quantity.toString());
      
      this.http.post<VentaDtoFromBackend>(`${this.apiUrl}/agregar`, null, { params }).pipe(
        map(ventaDto => this.transformVentaDtoToCartItems(ventaDto)),
        tap(cartItems => {
          this.itemsSubject.next(cartItems);
          this.saveItemsToStorage();
        }),
        catchError(this.handleError.bind(this))
      ).subscribe();
    } else {
      console.log(`CartService: Usuario NO AUTENTICADO en addItem. Usando localStorage.`);
      const currentItems = [...this.itemsSubject.value];
      const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);
      if (existingItemIndex > -1) {
        currentItems[existingItemIndex].cantidad += quantity;
      } else {
        currentItems.push({
          productId: product.id,
          nombre: product.nombre || 'Nombre no disponible',
          precio: product.precio || 0,
          cantidad: quantity,
          imagen: product.imagen
        });
      }
      this.itemsSubject.next(currentItems);
      this.saveItemsToStorage();
    }
  }

  removeItem(productId: number): void {
    console.log(`CartService: Método removeItem llamado. Usuario autenticado: ${this.authService.isAuthenticated()}`);
    if (this.authService.isAuthenticated()) {
      console.log(`CartService: Usuario AUTENTICADO en removeItem. Intentando llamada a backend.`);
      const params = new HttpParams().set('productoId', productId.toString());
      this.http.delete<VentaDtoFromBackend>(`${this.apiUrl}/quitar`, { params }).pipe(
        map(ventaDto => this.transformVentaDtoToCartItems(ventaDto)),
        tap(cartItems => {
          this.itemsSubject.next(cartItems);
          this.saveItemsToStorage();
        }),
        catchError(this.handleError.bind(this))
      ).subscribe();
    } else {
      console.log(`CartService: Usuario NO AUTENTICADO en removeItem. Usando localStorage.`);
      const currentItems = this.itemsSubject.value.filter(item => item.productId !== productId);
      this.itemsSubject.next(currentItems);
      this.saveItemsToStorage();
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId); // removeItem will call its own logs
      return;
    }
    console.log(`CartService: Método updateQuantity llamado. Usuario autenticado: ${this.authService.isAuthenticated()}`);

    if (this.authService.isAuthenticated()) {
      console.log(`CartService: Usuario AUTENTICADO en updateQuantity. Intentando llamada a backend.`);
      const dto: ActualizarCantidadDto = { productoId: productId, cantidad: quantity };
      this.http.put<void>(`${this.apiUrl}/cantidad`, dto).pipe( // Esperamos <void> ya que el backend no devuelve cuerpo
        tap(() => {
          console.log('CartService: PUT /api/carrito/cantidad exitoso. Recargando carrito desde el servidor...');
          // Después de un PUT exitoso, recargar el carrito para obtener el estado más reciente.
          // fetchCartFromServer ya actualiza itemsSubject y localStorage.
          this.fetchCartFromServer().subscribe({
            next: () => console.log('CartService: Carrito recargado después de actualizar cantidad.'),
            error: (err) => console.error('CartService: Error al recargar carrito después de actualizar cantidad:', err)
          });
        }),
        catchError(this.handleError.bind(this)) // Manejar errores del PUT en sí
      ).subscribe({
        error: (err) => {
          // Este error es si el observable del PUT falla, que ya es manejado por handleError.
          // Podríamos querer forzar una recarga del carrito aquí también para asegurar consistencia
          // si el handleError no lo hizo (aunque debería si hay error de auth).
          console.error('CartService: Error en la suscripción principal de updateQuantity:', err);
        }
      });
    } else {
      console.log(`CartService: Usuario NO AUTENTICADO en updateQuantity. Usando localStorage.`);
      const currentItems = this.itemsSubject.value.map(item =>
        item.productId === productId ? { ...item, cantidad: quantity } : item
      );
      this.itemsSubject.next(currentItems);
      this.saveItemsToStorage();
    }
  }

  clearCart(): void {
    console.log(`CartService: Método clearCart llamado. Usuario autenticado: ${this.authService.isAuthenticated()}`);
    if (this.authService.isAuthenticated()) {
      console.log(`CartService: Usuario AUTENTICADO en clearCart. Intentando llamada a backend.`);
      this.http.delete<void>(`${this.apiUrl}/vaciar`).pipe(
        tap(() => {
          this.itemsSubject.next([]);
          this.saveItemsToStorage();
        }),
        catchError(this.handleError.bind(this))
      ).subscribe();
    } else {
      console.log(`CartService: Usuario NO AUTENTICADO en clearCart. Usando localStorage.`);
      this.itemsSubject.next([]);
      this.saveItemsToStorage();
    }
  }
  
  public getCurrentItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getCartItemCount(): Observable<number> {
    return this.items$.pipe(
      map(items => items.reduce((acc, item) => acc + item.cantidad, 0))
    );
  }

  getCartSubtotal(): Observable<number> {
    return this.items$.pipe(
      map(items => items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0))
    );
  }

  private loadItemsFromLocalStorage(): CartItem[] {
    if (typeof localStorage === 'undefined') return [];
    const storedItems = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        return Array.isArray(items) ? items : [];
      } catch (e) {
        console.error('Error parseando items del carrito desde localStorage:', e);
        localStorage.removeItem(this.CART_STORAGE_KEY);
      }
    }
    return [];
  }

  private saveItemsToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.itemsSubject.value));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido al contactar con el servidor del carrito.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'No autorizado. Por favor, inicia sesión de nuevo.';
      setTimeout(() => this.authService.logout(), 0);
    } else if (error.error && error.error.error) {
      errorMessage = `Error del servidor: ${error.error.error}`;
    } else if (typeof error.error === 'string' && error.error.length < 200 && error.error.length > 0) {
      errorMessage = error.error;
    } else {
      errorMessage = `Error ${error.status}: ${error.statusText}. Inténtalo más tarde.`;
    }
    console.error('Error en CartService:', error);
    return throwError(() => new Error(errorMessage));
  }

  // --- Métodos para fusión de carrito ---
  getLocalCartForMerge(): CartItem[] {
    return this.loadItemsFromLocalStorage();
  }

  mergeLocalCartWithBackend(localItems: CartItem[]): Observable<VentaDtoFromBackend | null> {
    if (!this.authService.isAuthenticated() || localItems.length === 0) {
      return of(null);
    }
    console.log('CartService: Iniciando merge de items locales al backend:', localItems);
    const addOperations: Observable<VentaDtoFromBackend>[] = localItems.map(item => {
      const params = new HttpParams()
        .set('productoId', item.productId.toString())
        .set('cantidad', item.cantidad.toString());
      return this.http.post<VentaDtoFromBackend>(`${this.apiUrl}/agregar`, null, { params });
    });

    return forkJoin(addOperations).pipe(
      map(responses => {
        const finalCartState = responses.length > 0 ? responses[responses.length - 1] : null;
        if (finalCartState) {
          const cartItems = this.transformVentaDtoToCartItems(finalCartState);
          this.itemsSubject.next(cartItems);
          this.saveItemsToStorage();
        }
        return finalCartState;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  clearLocalCartData(): void {
    localStorage.removeItem(this.CART_STORAGE_KEY);
    console.log('CartService: Datos del carrito local eliminados después de la fusión.');
    if (!this.authService.isAuthenticated()) { // Solo limpiar subject si no está autenticado
        this.itemsSubject.next([]);
    }
  }
}

// --- Backend DTO Interfaces ---
export interface LineaVentaDtoFromBackend {
  id?: number;
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal?: number;
  imagenProducto?: string; // Asumiendo que el backend puede enviar esto
}

export interface VentaDtoFromBackend {
  id: number;
  lineasVenta: LineaVentaDtoFromBackend[];
  total?: number;
  estadoVenta?: string;
}

export interface ActualizarCantidadDto {
  productoId: number;
  cantidad: number;
}