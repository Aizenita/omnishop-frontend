import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // RouterModule para routerLink
import { Observable } from 'rxjs';

import { CartService, CartItem } from '../../shared/services/cart.service'; // Ajusta ruta
import { AuthService } from '../../shared/services/auth.service'; // Para verificar si está logueado para checkout

// Importaciones PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber'; // Para actualizar cantidad
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms'; // Necesario para p-inputNumber con ngModel

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, // Importar FormsModule
    CardModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  cartSubtotal$: Observable<number>;
  cartItemCount$: Observable<number>;
  // Para p-inputNumber, necesitamos un array para el ngModel de las cantidades
  // Esto es un poco más complejo de lo ideal con observables directos en la tabla.
  // Una alternativa sería tener los items como un array normal y actualizarlo desde el servicio.
  // Por ahora, dejaremos que la actualización de cantidad llame directamente al servicio.

  constructor(
    public cartService: CartService, // Público para usarlo en el template directamente para el subtotal, etc.
    private messageService: MessageService,
    private authService: AuthService, // Para el botón de checkout
    private router: Router
  ) {
    this.cartItems$ = this.cartService.items$;
    this.cartSubtotal$ = this.cartService.getCartSubtotal();
    this.cartItemCount$ = this.cartService.getCartItemCount();
  }

  ngOnInit(): void {}

  updateItemQuantity(item: CartItem, newQuantity: number | null): void {
    if (newQuantity !== null && newQuantity >= 0) {
      this.cartService.updateQuantity(item.productId, newQuantity);
      if (newQuantity === 0) {
        this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: `${item.nombre} eliminado del carrito.` });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Cantidad de ${item.nombre} actualizada.` });
      }
    } else if (newQuantity === null && item.cantidad !== undefined){ // si el input se vacía
         this.cartService.updateQuantity(item.productId, 0); // o la cantidad que tuviera antes si no queremos eliminarlo
         this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: `${item.nombre} eliminado del carrito.` });
    }
  }

  removeItemFromCart(item: CartItem): void {
    this.cartService.removeItem(item.productId);
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: `${item.nombre} eliminado del carrito.` });
  }

  clearEntireCart(): void {
    this.cartService.clearCart();
    this.messageService.add({ severity: 'warn', summary: 'Carrito Vacío', detail: 'Todos los productos han sido eliminados del carrito.' });
  }

  proceedToCheckout(): void {
    if (this.authService.isAuthenticated()) { // O this.authService.getCurrentUser() para obtener datos del user
      // Lógica para ir a la página de checkout
      this.router.navigate(['/checkout']); // Asumiendo que /checkout es la ruta
      console.log('Procediendo al checkout...');
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Autenticación Requerida', detail: 'Por favor, inicia sesión para proceder al pago.' });
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
    }
  }
}
