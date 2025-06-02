import { Component, OnInit, OnDestroy } from '@angular/core'; // Removed Renderer2 if not used elsewhere
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Router for navigation
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OrderReviewComponent } from './components/order-review/order-review.component';
import { ShippingAddressSelectorComponent } from './components/shipping-address-selector/shipping-address-selector.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { DireccionEnvio } from '../../shared/models/direccion-envio.model';
// Updated DTOs
import { FinalizarPedidoRequestDto } from '../../shared/models/finalizar-pedido-request.dto';
import { PagoItemDto } from '../../shared/models/iniciar-pago-request.dto'; // Reused for items
import { FinalizarPedidoResponseDto } from '../../shared/models/finalizar-pedido-response.dto';
import { CheckoutService } from './services/checkout.service';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { MessagesModule } from 'primeng/messages';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    MessagesModule, // Added for p-messages
    OrderReviewComponent,
    ShippingAddressSelectorComponent,
    OrderSummaryComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
  // providers: [CheckoutService] // Service is providedIn: 'root'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  selectedShippingAddress: DireccionEnvio | null = null;
  currentStep: string = 'review';
  msgs: any = []; // For displaying messages to the user
  isLoadingPayment: boolean = false; // To show loading during payment initiation
  private cartItems: CartItem[] = [];
  // private cartTotal: number = 0; // Subtotal from cart
  private subscriptions = new Subscription();

  // Hardcoded shipping and tax, MUST match OrderSummaryComponent for consistency
  // Ideally, this should come from a shared configuration or service, or OrderSummaryComponent should emit the final total.
  private readonly shippingCost: number = 5.00;
  private readonly taxRate: number = 0.10;

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private router: Router // For navigation
    // private renderer: Renderer2 // Removed if only for Redsys form

  ) { }
  
  ngOnInit(): void {
    console.log('CheckoutComponent initialized');
    this.subscriptions.add(
      this.cartService.items$.subscribe(items => this.cartItems = items)
    );
    // No need to store cartTotal here if we recalculate final total in proceedToPayment
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onAddressSelected(address: DireccionEnvio): void {
    this.selectedShippingAddress = address;
    this.currentStep = 'summary';
    this.msgs = []; // Clear previous messages
  }

  proceedToPayment(): void {
    this.msgs = []; // Clear previous messages
    if (!this.selectedShippingAddress || !this.selectedShippingAddress.id) {
      this.msgs = [{severity:'error', summary:'Error', detail:'Por favor, seleccione una dirección de envío.'}];
      return;
    }
    if (this.cartItems.length === 0) {
      this.msgs = [{severity:'error', summary:'Error', detail:'Tu carrito está vacío.'}];
      return;
    }

    this.isLoadingPayment = true;
    this.currentStep = 'payment_processing'; // Keep this step name for loading UI

    // Get current cart items and subtotal to calculate final total for the request
    this.subscriptions.add(
        this.cartService.getCartSubtotal().pipe(first()).subscribe(currentCartSubtotal => {
            const pagoItems: PagoItemDto[] = this.cartItems.map(item => ({
                productoId: item.productId,
                cantidad: item.cantidad
            }));

            const taxes = currentCartSubtotal * this.taxRate;
            const finalTotalAmount = currentCartSubtotal + this.shippingCost + taxes;

            const requestPayload: FinalizarPedidoRequestDto = {
                direccionEnvioId: this.selectedShippingAddress!.id,
                items: pagoItems,
                total: parseFloat(finalTotalAmount.toFixed(2)) // Ensure correct format/precision
            };

            this.subscriptions.add(
                this.checkoutService.finalizarPedidoSimulado(requestPayload).subscribe({
                    next: (response: FinalizarPedidoResponseDto) => {
                        this.isLoadingPayment = false;
                        // Clear cart after successful order simulation
                        this.cartService.clearCart(); // Or backend should clear cart associated with order
                        this.router.navigate(['/pedido-confirmado', response.orderId]);
                    },
                    error: (err) => {
                        console.error('Error al finalizar pedido simulado:', err);
                        this.msgs = [{severity:'error', summary:'Error de Pedido', detail: err.message || 'No se pudo completar el pedido. Intente de nuevo.'}];
                        this.isLoadingPayment = false;
                        this.currentStep = 'summary'; // Go back to summary
                    }
                })
            );
        })
    );
  }



  editAddress(): void {
    this.selectedShippingAddress = null;
    this.currentStep = 'address';
    this.msgs = [];
  }
}
