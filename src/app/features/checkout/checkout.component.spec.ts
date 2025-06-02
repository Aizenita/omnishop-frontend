import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CheckoutComponent } from './checkout.component';
import { CheckoutService } from './services/checkout.service';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { DireccionEnvio } from '../../shared/models/direccion-envio.model';
import { FinalizarPedidoRequestDto } from '../../shared/models/finalizar-pedido-request.dto';
import { FinalizarPedidoResponseDto } from '../../shared/models/finalizar-pedido-response.dto';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router'; // Import Router
import { By } from '@angular/platform-browser';

// Import Standalone Child Components & PrimeNG Modules used in CheckoutComponent's template
import { OrderReviewComponent } from './components/order-review/order-review.component';
import { ShippingAddressSelectorComponent } from './components/shipping-address-selector/shipping-address-selector.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';

// Mock Services
class MockCartService {
  items$ = new BehaviorSubject<CartItem[]>([]);
  private cartSubtotalSubject = new BehaviorSubject<number>(0);
  getCartSubtotal() { return this.cartSubtotalSubject.asObservable(); }
  clearCart = jasmine.createSpy('clearCart'); // Spy on clearCart

  // Helper to update mock values
  setItems(items: CartItem[]) { this.items$.next(items); }
  setSubtotal(subtotal: number) { this.cartSubtotalSubject.next(subtotal); }
}

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let mockCheckoutService: jasmine.SpyObj<CheckoutService>;
  let mockCartService: MockCartService;
  let mockRouter: jasmine.SpyObj<Router>; // Use Router spy

  const mockShippingAddress: DireccionEnvio = { id: 1, usuarioId: 1, calle: '123 Main St', ciudad: 'Anytown', cp: '12345', pais: 'USA', predeterminada: true };
  const mockCartItems: CartItem[] = [{ productId: 1, nombre: 'Test Product', precio: 10, cantidad: 2, imagen: 'test.jpg' }];
  const mockCartSubtotal: number = 20; // Subtotal from items

  beforeEach(async () => {
    mockCheckoutService = jasmine.createSpyObj('CheckoutService', ['finalizarPedidoSimulado']);
    mockCartService = new MockCartService();
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);


    await TestBed.configureTestingModule({
      imports: [
        CheckoutComponent,
        OrderReviewComponent,
        ShippingAddressSelectorComponent,
        OrderSummaryComponent,
        RouterTestingModule, // Good for routerLink, but we mock Router for navigate
        HttpClientTestingModule,
        CardModule,
        ButtonModule,
        MessagesModule
      ],
      providers: [
        { provide: CheckoutService, useValue: mockCheckoutService },
        { provide: CartService, useValue: mockCartService },
        { provide: Router, useValue: mockRouter } // Provide spy for Router
        // Renderer2 is removed
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    
    mockCartService.setItems(mockCartItems);
    mockCartService.setSubtotal(mockCartSubtotal);
    
    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.currentStep).toBe('review');
  });

  // ... (other tests like onAddressSelected, editAddress can remain similar) ...
  it('should handle onAddressSelected and move to "summary" step', () => {
    component.onAddressSelected(mockShippingAddress);
    expect(component.selectedShippingAddress).toEqual(mockShippingAddress);
    expect(component.currentStep).toBe('summary');
    expect(component.msgs.length).toBe(0);
  });

  it('should move to "address" step when editAddress is called', () => {
    component.currentStep = 'summary';
    component.selectedShippingAddress = mockShippingAddress;
    component.editAddress();
    expect(component.selectedShippingAddress).toBeNull();
    expect(component.currentStep).toBe('address');
  });


  describe('proceedToPayment (Simulated)', () => {
    beforeEach(() => {
      component.selectedShippingAddress = mockShippingAddress;
      component.currentStep = 'summary';
      // Ensure cart items and total are set for the component instance via mock service
      mockCartService.setItems(mockCartItems);
      mockCartService.setSubtotal(mockCartSubtotal);
      fixture.detectChanges();
    });

    it('should show error if no shipping address is selected', () => {
      component.selectedShippingAddress = null;
      component.proceedToPayment();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].detail).toContain('Por favor, seleccione una dirección de envío.');
      expect(mockCheckoutService.finalizarPedidoSimulado).not.toHaveBeenCalled();
    });

    it('should show error if cart is empty', () => {
      mockCartService.setItems([]); // Simulate empty cart
      fixture.detectChanges(); // To re-evaluate cartItems in component if it directly binds
      (component as any).cartItems = []; // Also directly set for safety in test

      component.proceedToPayment();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].detail).toContain('Tu carrito está vacío.');
      expect(mockCheckoutService.finalizarPedidoSimulado).not.toHaveBeenCalled();
    });

    it('should call checkoutService.finalizarPedidoSimulado, clear cart and navigate on success', fakeAsync(() => {
      const mockResponse: FinalizarPedidoResponseDto = { orderId: 123, message: 'Success' };
      mockCheckoutService.finalizarPedidoSimulado.and.returnValue(of(mockResponse));
      
      component.proceedToPayment();
      tick(); 

      // Calculate expected total as done in component
      const shippingCost = (component as any).shippingCost; // 5.00
      const taxRate = (component as any).taxRate;       // 0.10
      const taxes = mockCartSubtotal * taxRate;
      const expectedFinalTotal = parseFloat((mockCartSubtotal + shippingCost + taxes).toFixed(2));

      expect(mockCheckoutService.finalizarPedidoSimulado).toHaveBeenCalledWith(jasmine.objectContaining({
        direccionEnvioId: mockShippingAddress.id,
        items: [{ productoId: mockCartItems[0].productId, cantidad: mockCartItems[0].cantidad }],
        total: expectedFinalTotal
      }));
      
      expect(mockCartService.clearCart).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/pedido-confirmado', mockResponse.orderId]);
      expect(component.isLoadingPayment).toBeFalse();
    }));

    it('should display error and reset step if finalizarPedidoSimulado fails', fakeAsync(() => {
      mockCheckoutService.finalizarPedidoSimulado.and.returnValue(throwError(() => new Error('Simulated error')));
      component.proceedToPayment();
      tick();

      expect(mockCheckoutService.finalizarPedidoSimulado).toHaveBeenCalled();
      expect(component.isLoadingPayment).toBeFalse();
      expect(component.msgs.length).toBe(1);
      expect(component.msgs[0].severity).toBe('error');
      expect(component.msgs[0].detail).toContain('No se pudo completar el pedido.');
      expect(component.currentStep).toBe('summary'); 
      expect(mockCartService.clearCart).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));
  });
  
  it('should unsubscribe on destroy', () => {
    spyOn((component as any).subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).subscriptions.unsubscribe).toHaveBeenCalled();
  });
});
