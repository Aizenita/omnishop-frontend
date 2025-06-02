import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CartService } from '../../../../shared/services/cart.service'; // Assuming CartItem is exported
import { DireccionEnvio } from '../../../../shared/models/direccion-envio.model';
import { Observable, of, map } from 'rxjs';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button'; // For "Proceed to Payment" button

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    ButtonModule
  ],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent implements OnInit {
  @Input() shippingAddress: DireccionEnvio | null = null;
  
  cartItems$: Observable<CartItem[]> = of([]);
  cartSubtotal$: Observable<number> = of(0);
  
  // Placeholders - these would typically come from configuration or backend calculation
  shippingCost: number = 5.00; // Example fixed shipping
  taxRate: number = 0.10; // Example 10% tax rate
  taxes$: Observable<number> = of(0);
  totalOrderAmount$: Observable<number> = of(0);

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartItems$ = this.cartService.items$;
    this.cartSubtotal$ = this.cartService.getCartSubtotal();

    this.taxes$ = this.cartSubtotal$.pipe(
      map(subtotal => subtotal * this.taxRate)
    );

    this.totalOrderAmount$ = this.cartSubtotal$.pipe(
      map(subtotal => subtotal + (subtotal * this.taxRate) + this.shippingCost)
    );
  }
}
