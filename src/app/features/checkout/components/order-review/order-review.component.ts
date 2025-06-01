import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { CartService, CartItem } from '../../../../shared/services/cart.service';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table'; // For displaying items
import { ButtonModule } from 'primeng/button'; // For any actions if needed later

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule
  ],
  templateUrl: './order-review.component.html',
  styleUrls: ['./order-review.component.scss']
})
export class OrderReviewComponent implements OnInit {
  cartItems$: Observable<CartItem[]> = of([]);
  cartSubtotal$: Observable<number> = of(0);
  // In a real scenario, you might have shipping costs, taxes, etc.
  // shippingCost: number = 0; // Example
  // taxes: number = 0; // Example
  // totalOrderAmount$: Observable<number> = of(0);


  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartItems$ = this.cartService.items$;
    this.cartSubtotal$ = this.cartService.getCartSubtotal();

    // Example for total amount if including other costs:
    // this.totalOrderAmount$ = this.cartSubtotal$.pipe(
    //   map(subtotal => subtotal + this.shippingCost + this.taxes)
    // );
  }
}
