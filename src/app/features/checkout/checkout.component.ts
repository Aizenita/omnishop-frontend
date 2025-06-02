import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core'; // Added Renderer2, OnDestroy
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OrderReviewComponent } from './components/order-review/order-review.component';
import { ShippingAddressSelectorComponent } from './components/shipping-address-selector/shipping-address-selector.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { DireccionEnvio } from '../../shared/models/direccion-envio.model';
import { IniciarPagoRequestDto, PagoItemDto } from '../../shared/models/iniciar-pago-request.dto'; // DTOs
import { RedsysParamsDto } from '../../shared/models/redsys-params.dto';
import { CheckoutService } from './services/checkout.service'; // Service
import { CartService, CartItem } from '../../shared/services/cart.service'; // CartService
import { MessagesModule } from 'primeng/messages'; // For p-messages
import { Subscription } from 'rxjs'; // For managing subscriptions
import { first } from 'rxjs/operators'; // To take only the first value of observables
import { Router } from '@angular/router';


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
  private cartTotal: number = 0;
  private subscriptions = new Subscription();

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private renderer: Renderer2, // For DOM manipulation (creating form)
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('CheckoutComponent initialized');
    // Subscribe to cart items and total to have them ready
    this.subscriptions.add(
      this.cartService.items$.subscribe(items => this.cartItems = items)
    );
    this.subscriptions.add(
      this.cartService.getCartSubtotal().subscribe(total => this.cartTotal = total)
    );
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
  this.msgs = [];
  if (!this.selectedShippingAddress || !this.selectedShippingAddress.id) {
    this.msgs = [{severity:'error', summary:'Error', detail:'Por favor, seleccione una dirección de envío.'}];
    return;
  }
  if (this.cartItems.length === 0) {
    this.msgs = [{severity:'error', summary:'Error', detail:'Tu carrito está vacío.'}];
    return;
  }

  this.isLoadingPayment = true;
  this.currentStep = 'payment_processing';

  const shippingCost = 5.00;
  const taxRate = 0.10;
  const subtotal = this.cartService.getCurrentSubtotal();
  const taxes = subtotal * taxRate;
  const finalTotalAmount = parseFloat((subtotal + shippingCost + taxes).toFixed(2));

  const requestPayload: IniciarPagoRequestDto = {
    shippingAddressId: this.selectedShippingAddress!.id,
    items: this.cartItems.map(item => ({
      productoId: item.productId,
      cantidad: item.cantidad
    })),
    totalAmount: finalTotalAmount // ¡Ya está disponible directamente!
  };

  this.subscriptions.add(
    this.checkoutService.iniciarPagoRedsys(requestPayload).subscribe({
      next: (redsysParams) => {
        console.log('Frontend redirectToRedsys received:', redsysParams);
        this.redirectToRedsys(redsysParams);
      },
      error: (err) => {
        console.error('Error al iniciar pago Redsys:', err);
        this.msgs = [{severity:'error', summary:'Error de Pago', detail: err.message || 'No se pudo iniciar el proceso de pago.'}];
        this.isLoadingPayment = false;
        this.currentStep = 'summary';
      }
    })
  );
  }

  private redirectToRedsys(params: RedsysParamsDto): void {
  this.router.navigate(['/mock-redsys'], {
    state: { params }
  });
}

  editAddress(): void {
    this.selectedShippingAddress = null;
    this.currentStep = 'address';
    this.msgs = [];
  }
}
