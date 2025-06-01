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
import { Message } from 'primeng/api'; // For messages
import { MessagesModule } from 'primeng/messages'; // For p-messages
import { Subscription } from 'rxjs'; // For managing subscriptions
import { first } from 'rxjs/operators'; // To take only the first value of observables

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
  msgs: Message[] = []; // For displaying messages to the user
  isLoadingPayment: boolean = false; // To show loading during payment initiation

  private cartItems: CartItem[] = [];
  private cartTotal: number = 0;
  private subscriptions = new Subscription();

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private renderer: Renderer2 // For DOM manipulation (creating form)
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
    this.currentStep = 'payment_processing';

    // For now, let's get the total and items once before making the call
    this.cartService.items$.pipe(first()).subscribe(currentCartItems => {
      this.cartService.getCartSubtotal().pipe(first()).subscribe(currentCartTotal => {
        // Assuming shipping and tax are calculated as in OrderSummaryComponent
        const shippingCost = 5.00; // Must match OrderSummaryComponent display
        const taxRate = 0.10;    // Must match OrderSummaryComponent display
        const taxes = currentCartTotal * taxRate;
        const finalTotalAmount = currentCartTotal + shippingCost + taxes;

        const requestPayload: IniciarPagoRequestDto = {
          shippingAddressId: this.selectedShippingAddress!.id,
          items: currentCartItems.map(item => ({
            productoId: item.productId,
            cantidad: item.cantidad
          })),
          totalAmount: parseFloat(finalTotalAmount.toFixed(2)) // Ensure correct format/precision
        };

        this.subscriptions.add(
          this.checkoutService.iniciarPagoRedsys(requestPayload).subscribe({
            next: (redsysParams) => {
              this.redirectToRedsys(redsysParams);
              // isLoadingPayment will remain true as page redirects
            },
            error: (err) => {
              console.error('Error al iniciar pago Redsys:', err);
              this.msgs = [{severity:'error', summary:'Error de Pago', detail: err.message || 'No se pudo iniciar el proceso de pago. Intente de nuevo.'}];
              this.isLoadingPayment = false;
              this.currentStep = 'summary'; // Go back to summary to show error
            }
          })
        );
      });
    });
  }

  private redirectToRedsys(params: RedsysParamsDto): void {
    const form = this.renderer.createElement('form');
    this.renderer.setAttribute(form, 'method', 'POST');
    this.renderer.setAttribute(form, 'action', params.redsysUrl);
    // this.renderer.setStyle(form, 'display', 'none'); // Hide the form

    const versionInput = this.renderer.createElement('input');
    this.renderer.setAttribute(versionInput, 'type', 'hidden');
    this.renderer.setAttribute(versionInput, 'name', 'Ds_SignatureVersion');
    this.renderer.setAttribute(versionInput, 'value', params.dsSignatureVersion);
    this.renderer.appendChild(form, versionInput);

    const paramsInput = this.renderer.createElement('input');
    this.renderer.setAttribute(paramsInput, 'type', 'hidden');
    this.renderer.setAttribute(paramsInput, 'name', 'Ds_MerchantParameters');
    this.renderer.setAttribute(paramsInput, 'value', params.dsMerchantParameters);
    this.renderer.appendChild(form, paramsInput);

    const signatureInput = this.renderer.createElement('input');
    this.renderer.setAttribute(signatureInput, 'type', 'hidden');
    this.renderer.setAttribute(signatureInput, 'name', 'Ds_Signature');
    this.renderer.setAttribute(signatureInput, 'value', params.dsSignature);
    this.renderer.appendChild(form, signatureInput);

    this.renderer.appendChild(document.body, form);
    form.submit();
    this.renderer.removeChild(document.body, form); // Clean up, though submission might happen before this
  }

  editAddress(): void {
    this.selectedShippingAddress = null;
    this.currentStep = 'address';
    this.msgs = [];
  }
}
