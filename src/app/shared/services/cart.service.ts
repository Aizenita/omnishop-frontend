import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs'; // 'of' might not be strictly needed here based on final code
import { map } from 'rxjs/operators';
import { Product } from './product.service'; // Ajusta la ruta si es necesario

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
export class CartService {
  private readonly CART_STORAGE_KEY = 'app_cart_items';
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadItemsFromStorage());
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  constructor() { }

  addItem(product: Product, quantity: number = 1): void {
    if (!product || product.id === undefined) { // Check for undefined id as well
      console.error('Intento de añadir producto inválido al carrito:', product);
      return;
    }
    const currentItems = [...this.itemsSubject.value];
    const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].cantidad += quantity;
    } else {
      currentItems.push({
        productId: product.id, // Ensured product.id is not undefined
        nombre: product.nombre || 'Nombre no disponible',
        precio: product.precio || 0,
        cantidad: quantity,
        imagen: product.imagen
      });
    }
    this.itemsSubject.next(currentItems);
    this.saveItemsToStorage();
  }

  removeItem(productId: number): void {
    const currentItems = this.itemsSubject.value.filter(item => item.productId !== productId);
    this.itemsSubject.next(currentItems);
    this.saveItemsToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const currentItems = this.itemsSubject.value.map(item =>
      item.productId === productId ? { ...item, cantidad: quantity } : item
    );
    this.itemsSubject.next(currentItems);
    this.saveItemsToStorage();
  }

  clearCart(): void {
    this.itemsSubject.next([]);
    this.saveItemsToStorage();
  }

  // Devuelve el snapshot actual, útil para componentes que no necesitan reactividad constante para esta lista
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

  private loadItemsFromStorage(): CartItem[] {
    if (typeof localStorage === 'undefined') return []; // Guard for SSR or specific environments
    const storedItems = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        return Array.isArray(items) ? items : []; // Ensure it's an array
      } catch (e) {
        console.error('Error parseando items del carrito desde localStorage:', e);
        localStorage.removeItem(this.CART_STORAGE_KEY); // Limpiar si está corrupto
      }
    }
    return [];
  }

  private saveItemsToStorage(): void {
    if (typeof localStorage === 'undefined') return; // Guard for SSR or specific environments
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.itemsSubject.value));
  }
}
